<#
.SYNOPSIS
  Back up this project's Claude Code session transcript(s) into the repo.

.DESCRIPTION
  Implements MEMORY/SESSION_BACKUP_POLICY.md (D-010).
  - Resolves the machine-local transcript dir: ~/.claude/projects/<encoded-cwd>/
    (encoding rule: every non-alphanumeric character of the repo path becomes '-').
  - Copies the newest transcript (or all with -All) into docs/01-session/transcripts/.
  - Best-effort redaction of secret-shaped values AND masking of identity-shaped values
    (tenant accounts, SharePoint URLs, tenant clusters) plus any named entities listed in
    the Brain's scripts/04-sync/redaction-terms.txt. Amendment A still holds: a net, not a
    guarantee; the pristine original always stays in the machine-local Claude dir. Use
    -NoRedact only for private, known-clean repos.
  - Size cap (Amendment B): files over -MaxMB are skipped with a pointer note.

  Windows PowerShell 5.1 compatible. ASCII only. Read-only toward ~/.claude.

.EXAMPLE
  .\scripts\04-sync\backup-session.ps1              # newest session, redacted, into this repo

.EXAMPLE
  .\scripts\04-sync\backup-session.ps1 -All -MaxMB 50
#>
[CmdletBinding()]
param(
  [string] $Repo = ".",
  [string] $OutDir = "docs/01-session/transcripts",
  [int]    $MaxMB = 25,
  [switch] $All,
  [switch] $NoRedact,

  # Re-apply the CURRENT redaction + mask rules to transcripts already sitting in $OutDir, in place.
  # For files backed up before a rule existed. Same patterns as a fresh backup - one definition, no drift.
  [switch] $Remask
)

$ErrorActionPreference = 'Stop'

function Get-ClaudeHomeLocal {
  # Same precedence Claude Code uses. A machine that redirects CLAUDE_CONFIG_DIR would otherwise
  # have this script look in a directory that holds no transcripts (L-012, found by PC2 2026-08-23).
  # Kept local rather than dot-sourced so this file still works when copied into a scaffolded repo.
  if ($env:CLAUDE_CONFIG_DIR) {
    $p = $env:CLAUDE_CONFIG_DIR.Trim().Trim('"').Trim("'")
    $p = ($p -replace '^/([A-Za-z])/', '$1:/') -replace '/', '\'
    $p = $p.TrimEnd('\')
    if (Test-Path $p) { return $p }
  }
  return (Join-Path $env:USERPROFILE '.claude')
}

$repoPath   = (Resolve-Path $Repo).Path.TrimEnd('\')
$encoded    = $repoPath -replace '[^A-Za-z0-9]', '-'
$claudeHome = Get-ClaudeHomeLocal
$srcDir     = Join-Path $claudeHome ("projects\" + $encoded)

if (-not (Test-Path $srcDir)) {
  throw "No local session directory for this repo: $srcDir (has Claude Code run here?)"
}

$files = Get-ChildItem -Path $srcDir -Filter *.jsonl | Sort-Object LastWriteTime -Descending
if (-not $files) { throw "No .jsonl transcripts found in $srcDir" }
if (-not $All)   { $files = @($files | Select-Object -First 1) }

$dest = Join-Path $repoPath $OutDir
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Force -Path $dest | Out-Null }

# Secret-shaped patterns. Group 1+2 keep the key and separator; the value is masked.
# The alternation is deliberately broad on the KEY NAME side: 'access_key' slipped through on
# 2026-08-25 because the list only knew 'api_key'/'apikey'. A key is named by its purpose, not by
# a fixed vocabulary - match the shape <something>_key/_token/_secret, not a memorised list.
$kvPattern    = '(?i)((?:access|api|app|auth|client|private|public|secret|session|subscription|web3forms)[_-]?(?:key|token|secret)|apikey|accesskey|secret|token|passwd|password|credential|authorization|bearer)(\\?["'']?\s*[:=]\s*\\?["'']?)([^"''\s,}\\]{6,})'
$barePatterns = @(
  'sk-ant-[A-Za-z0-9_\-]{10,}',
  'ghp_[A-Za-z0-9]{20,}',
  'github_pat_[A-Za-z0-9_]{20,}',
  'eyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{5,}'
)

# --- Employer / tenant masking (L-011 + the 2026-08-23 measurement) -------------------------
# WHY: D-011 tells every session to read the Brain's packs before building. Some of those packs are
# employer-domain, so the better a session follows the rule, the more employer identifiers land in
# its transcript - and this script then copies the transcript into whatever repo the session ran in.
# The secret-shape pass above never saw them: they are not secrets, they are identities.
#
# SHAPES live here (they name nothing, so they are safe in any repo, including a public one).
# NAMED ENTITIES live in the Brain's private term list and are never written into this script -
# a scaffolded repo must not carry the words it is meant to hide.
$maskPatterns = @(
  @{ P = '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]*onmicrosoft\.com';                          R = '[TENANT-ACCOUNT-REDACTED]' },
  @{ P = '(?i)https?://[A-Za-z0-9-]+\.sharepoint\.com[^\s"'',)\\]*';                  R = '[SHAREPOINT-URL-REDACTED]' },
  @{ P = '(?i)\bWABI-[A-Z0-9-]+(?:\.[A-Za-z0-9.-]+)?';                                R = '[TENANT-CLUSTER-REDACTED]' }
)

# Optional term list from the Brain: one rule per line, "<regex>" or "<regex> => <LABEL>", # comments.
# Resolved the same way the hooks resolve the Brain, so a copy running inside another repo still
# finds it; absent list = shapes only, and the script says so rather than pretending to be complete.
$termsLoaded = 0
$termsSource = 'none'
$brainCands = @()
$ptr = Join-Path $claudeHome 'brain.path'
if (Test-Path $ptr) { $brainCands += (Get-Content $ptr -Raw).Trim() }
$brainCands += (Join-Path (Split-Path -Parent $repoPath) '.CH-Claude-Persistent-Brain')
$brainCands += $repoPath
foreach ($b in $brainCands) {
  $tf = Join-Path $b 'scripts\04-sync\redaction-terms.txt'
  if ($b -and (Test-Path $tf)) {
    foreach ($line in (Get-Content $tf)) {
      $t = $line.Trim()
      if (-not $t -or $t.StartsWith('#')) { continue }
      $label = '[EMPLOYER-REDACTED]'
      if ($t -match '^(.*?)\s*=>\s*(\S.*)$') { $t = $Matches[1].Trim(); $label = $Matches[2].Trim() }
      $maskPatterns += @{ P = $t; R = $label }
      $termsLoaded++
    }
    $termsSource = $tf
    break
  }
}

if ($Remask) {
  $dest = Join-Path $repoPath $OutDir
  if (-not (Test-Path $dest)) { throw "Nothing to re-mask: $dest does not exist" }
  $existing = Get-ChildItem -Path $dest -Filter *.jsonl -ErrorAction SilentlyContinue
  if (-not $existing) { Write-Host "No transcripts in $dest"; exit 0 }
  $totalMask = 0
  foreach ($f in $existing) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $linesBefore = ($content -split "`n").Count
    $masked = 0
    foreach ($p in $barePatterns) {
      $masked += ([regex]::Matches($content, $p)).Count
      $content = [regex]::Replace($content, $p, 'REDACTED')
    }
    foreach ($m in $maskPatterns) {
      try {
        $hits = ([regex]::Matches($content, $m.P)).Count
        if ($hits -gt 0) { $masked += $hits; $content = [regex]::Replace($content, $m.P, $m.R) }
      } catch { Write-Host ("WARN  bad mask pattern skipped: " + $m.P) }
    }
    $linesAfter = ($content -split "`n").Count
    if ($linesAfter -ne $linesBefore) { Write-Host ("FAIL  {0}: line count changed {1} -> {2}, NOT written" -f $f.Name, $linesBefore, $linesAfter); continue }
    if ($masked -gt 0) { [System.IO.File]::WriteAllText($f.FullName, $content, (New-Object System.Text.UTF8Encoding($false))) }
    $totalMask += $masked
    Write-Host ("{0}  {1}  ({2} mask(s), {3} lines)" -f $(if ($masked -gt 0) { 'MASKED' } else { 'clean  ' }), $f.Name, $masked, $linesBefore)
  }
  Write-Host ""
  Write-Host ("Re-mask complete: {0} value(s) masked across {1} file(s)." -f $totalMask, $existing.Count)
  Write-Host "The originals in the machine-local Claude dir are untouched; git history still holds any"
  Write-Host "previously committed copies - masking here fixes the working tree, not the past."
  exit 0
}

$summary = @()
foreach ($f in $files) {
  $mb = [math]::Round($f.Length / 1MB, 1)
  if ($mb -gt $MaxMB) {
    Write-Host ("SKIP  {0}  ({1} MB exceeds the {2} MB cap; raw stays local per Amendment B)" -f $f.Name, $mb, $MaxMB)
    $summary += ("skipped {0} ({1} MB > cap)" -f $f.Name, $mb)
    continue
  }

  $stamp   = $f.LastWriteTime.ToString('yyyy-MM-dd')
  $outName = ("{0}-{1}.jsonl" -f $stamp, $f.BaseName)
  $outPath = Join-Path $dest $outName

  $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
  $redactions = 0
  $masked = 0

  if (-not $NoRedact) {
    $evaluator = { param($m) $m.Groups[1].Value + $m.Groups[2].Value + 'REDACTED' }
    $before = $content
    $content = [regex]::Replace($content, $kvPattern, $evaluator)
    $redactions += ([regex]::Matches($before, $kvPattern)).Count
    foreach ($p in $barePatterns) {
      $redactions += ([regex]::Matches($content, $p)).Count
      $content = [regex]::Replace($content, $p, 'REDACTED')
    }
    # Masked, not dropped: the record still shows a hazard was present, never its value (L-007).
    foreach ($m in $maskPatterns) {
      try {
        $hits = ([regex]::Matches($content, $m.P)).Count
        if ($hits -gt 0) {
          $masked += $hits
          $content = [regex]::Replace($content, $m.P, $m.R)
        }
      } catch {
        Write-Host ("WARN  bad mask pattern skipped: " + $m.P)
      }
    }
  }

  [System.IO.File]::WriteAllText($outPath, $content, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host ("OK    {0}  ({1} MB, {2} secret redaction(s), {3} identity mask(s)) -> {4}" -f $f.Name, $mb, $redactions, $masked, $outName)
  $summary += ("backed up {0} as {1} ({2} MB, {3} redactions, {4} masks)" -f $f.Name, $outName, $mb, $redactions, $masked)
}

# --- Signature refresh (trademark usage panel, self-measured from these same transcripts) ---
$sig = Join-Path $repoPath "scripts\04-sync\build-signature.py"
if (Test-Path $sig) {
  # Machine ID from env override or ~/.claude/machine-id; falls back to the
  # hostname. Hostnames are employer asset identifiers - never hard-code them
  # in a push-safe file (L-011).
  $id = $env:CH_MACHINE_ID
  if (-not $id) {
    $idFile = Join-Path $HOME ".claude\machine-id"
    if (Test-Path $idFile) { $id = (Get-Content $idFile -TotalCount 1).Trim() }
  }
  if (-not $id) { $id = $env:COMPUTERNAME }
  $other = Get-ChildItem (Join-Path $repoPath "OUTPUTS\signature") -Filter "shard-*.json" -ErrorAction SilentlyContinue |
           Where-Object { $_.Name -ne "shard-$id.json" } | ForEach-Object { $_.FullName }
  $mergeArgs = @(); if ($other) { $mergeArgs = @("--merge") + $other }
  Push-Location $repoPath
  try { & python $sig --emit-shard $id @mergeArgs 2>&1 | Select-Object -Last 1 | ForEach-Object { Write-Host ("SIG   " + $_) } }
  catch { Write-Host "SIG   signature refresh skipped: $($_.Exception.Message)" }
  finally { Pop-Location }
}

Write-Host ""
if ($termsLoaded -gt 0) {
  Write-Host ("Identity masking: shapes + {0} term(s) from {1}" -f $termsLoaded, $termsSource)
} else {
  Write-Host "Identity masking: SHAPES ONLY - no redaction-terms.txt found. Named entities (employer,"
  Write-Host "  dataset and project names) are NOT masked. See scripts/04-sync/redaction-terms.example.txt."
}
Write-Host "Done. Review the diff before committing (redaction is best-effort, not a guarantee)."
Write-Host "Policy: MEMORY/SESSION_BACKUP_POLICY.md (D-010). Raw originals remain in:"
Write-Host ("  " + $srcDir)
