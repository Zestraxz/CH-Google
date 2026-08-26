// ============================================================================
// Enterprise Intelligence Engine — corrected build v3.1 (2026-08-27)
// Canonical version. Supersedes the v3.0 listing in the founding blueprint
// (.resource/ PDF 4, pp. 5-15), which contains verified defects and must not
// be pasted as-is. Delta table: src/apps-script/README.md.
// ============================================================================

// CONFIGURATION: PASTE YOUR IDs HERE
const CONFIG = {
  MASTER_DOC_ID: "YOUR_MASTER_DOC_ID_HERE",
  TARGET_FOLDER_ID: "YOUR_FOLDER_ID_HERE",
  TEMPLATE_ID: "YOUR_TEMPLATE_ID_HERE",
  // Name of the tracker tab. getActiveSheet() in trigger context binds to the
  // last UI-active tab — adding a second tab would silently corrupt the wrong
  // sheet. Empty string = first sheet in the spreadsheet (deterministic).
  TRACKER_SHEET_NAME: "Sheet1",
  ALERT_EMAIL: "", // empty = Session.getActiveUser(); failure alerts go here
  // Verified current on ai.google.dev/gemini-api/docs/models (2026-08-27).
  // gemini-1.5-flash removed: retired, was a permanent-404 tier.
  // Hard-coded model lists rot — recheck the deprecations page at each touch.
  MODEL_CASCADE: ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash"],
  // Scout/Research prompts promise web recency, so grounding must actually be
  // on. v3.0 sent bare generateContent — "market intelligence" was model priors.
  // NOTE (2026-08-27): the tools:[{ google_search: {} }] shape below is the
  // documented generateContent form for 2.x-era models; the current docs'
  // {"type":"google_search"} example belongs to the /interactions endpoint and
  // the generateContent Tool schema for 3.x could not be confirmed — VERIFY at
  // deployment (runbook §1.7). A rejected shape fails LOUD (400 → fail-fast →
  // alert); silent non-grounding is caught by the groundingMetadata warning
  // and the runbook §3.2 spot-check.
  USE_WEB_GROUNDING: true,
  // Synthesis reads only the newest slice of the ever-growing Master Log
  // (log is newest-first). Whole-history prompts eventually exceed model
  // limits and the 6-minute execution cap.
  SYNTHESIS_MAX_CHARS: 100000,
  RESEARCH_FAIL_LIMIT: 3, // consecutive failures before a topic is parked
  // Checked between rows only — one long grounded call can still overshoot;
  // if that happens the hard kill surfaces via the trigger-failure email.
  EXECUTION_BUDGET_MS: 5.5 * 60 * 1000 // stop cleanly before the 6-min cap
};

// Tracker sheet columns (1-based): B=Topic, E=Last Run, F=Next Run,
// G=Priority Score, H=Execution Notes.
const COL = { TOPIC: 2, LAST_RUN: 5, NEXT_RUN: 6, SCORE: 7, NOTES: 8 };

// Deterministic tracker-sheet resolution (never getActiveSheet in triggers).
function getTrackerSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (CONFIG.TRACKER_SHEET_NAME) {
    const sheet = ss.getSheetByName(CONFIG.TRACKER_SHEET_NAME);
    if (!sheet) {
      throw new Error('Tracker sheet "' + CONFIG.TRACKER_SHEET_NAME + '" not found — check CONFIG.TRACKER_SHEET_NAME.');
    }
    return sheet;
  }
  return ss.getSheets()[0];
}

// ============================================================================
// FAILURE VISIBILITY — no silent failure (ARCHITECTURE.md §4).
// v3.0 ended every failure path in Logger.log, which nobody reads and which
// also suppressed Apps Script's own trigger-failure emails.
// ============================================================================
function notifyFailure_(context, err) {
  const msg = context + ": " + (err && err.message ? err.message : err);
  Logger.log("FAILURE " + msg);
  try {
    // getActiveUser().getEmail() can be blank in some trigger contexts —
    // set CONFIG.ALERT_EMAIL explicitly (runbook §1) so alerts never dead-end.
    const to = CONFIG.ALERT_EMAIL || Session.getActiveUser().getEmail();
    if (!to) {
      Logger.log("NO ALERT RECIPIENT — set CONFIG.ALERT_EMAIL. Alert not sent.");
      return;
    }
    MailApp.sendEmail(to, "PIPELINE FAILURE - Research Engine", msg);
  } catch (mailErr) {
    Logger.log("Alert email also failed: " + mailErr);
  }
}

// ============================================================================
// CORE AI ENGINE: MODEL FALLBACK CASCADE (v3.1)
// Fixes vs v3.0: fail-fast actually works (the old client-error throw was
// swallowed by its own catch, and 400 sat in the retryable set, so a bad key
// burned the full cascade); key moved from URL query param to header.
// ============================================================================
function callGeminiWithFallback(prompt, useGrounding) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY missing from Script Properties.");

  const grounding = useGrounding === undefined ? CONFIG.USE_WEB_GROUNDING : useGrounding;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  if (grounding) {
    payload.tools = [{ google_search: {} }];
  }
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "x-goog-api-key": apiKey }, // never in the URL: queries leak into logs
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const maxOuterRetries = 2;
  let backoffDelay = 5000;

  for (let attempt = 0; attempt < maxOuterRetries; attempt++) {
    for (let i = 0; i < CONFIG.MODEL_CASCADE.length; i++) {
      const currentModel = CONFIG.MODEL_CASCADE[i];
      const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" +
        currentModel + ":generateContent";
      let responseCode = -1, responseText = "";
      try {
        const response = UrlFetchApp.fetch(endpoint, options);
        responseCode = response.getResponseCode();
        responseText = response.getContentText();
      } catch (fetchErr) {
        Logger.log("[" + currentModel + "] fetch error: " + fetchErr.message);
        continue; // network-level: try next tier
      }

      if (responseCode === 200) {
        try {
          const result = JSON.parse(responseText);
          if (result.candidates && result.candidates.length > 0 &&
              result.candidates[0].content && result.candidates[0].content.parts) {
            if (grounding && !result.candidates[0].groundingMetadata) {
              // Grounding was requested but the response carries no grounding
              // metadata — the model answered from priors. Warn loudly; the
              // runbook's validation §3.2 spot-checks this end-to-end.
              Logger.log("WARNING [" + currentModel + "]: no groundingMetadata in response — treat output as UNGROUNDED.");
            }
            const text = result.candidates[0].content.parts.map(function (p) {
              return p.text || "";
            }).join("");
            if (text.trim()) {
              Logger.log("SUCCESS using model: [" + currentModel + "]");
              return text;
            }
            // 200 with empty text (e.g. thought-only / filtered parts) is
            // NOT success — filing it would log an empty report as SUCCESS.
          }
          Logger.log("[" + currentModel + "] 200 but empty/blocked/textless candidates. Cascading...");
        } catch (parseErr) {
          Logger.log("[" + currentModel + "] unparseable 200 body. Cascading...");
        }
      } else if (responseCode === 429 || responseCode >= 500 || responseCode === 404) {
        // Retryable/skippable: quota, server trouble, or model-not-found tier.
        Logger.log("[" + currentModel + "] HTTP " + responseCode + ". Cascading to next model...");
        Utilities.sleep(1500);
      } else {
        // 400/401/403-family: misconfiguration. Identical on every tier —
        // fail fast with the real message instead of churning the cascade.
        throw new Error("Non-retryable HTTP " + responseCode + " from [" + currentModel + "]: " +
          responseText.slice(0, 500));
      }
    }
    Logger.log("All models exhausted. Backing off " + backoffDelay / 1000 + "s...");
    Utilities.sleep(backoffDelay + Math.floor(Math.random() * 2000));
    backoffDelay *= 2;
  }
  throw new Error("Gemini fallback cascade exhausted: all model tiers failed.");
}

// Strips code fences / control chars and parses the first {...} block.
function parseModelJson_(rawText) {
  let t = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1) t = t.substring(start, end + 1);
  t = t.replace(/\n/g, " ").replace(/\r/g, "").replace(/\t/g, " ");
  return JSON.parse(t);
}

// ============================================================================
// LAYER 1: THE SCOUT (daily 6-7 AM trigger)
// Fixes vs v3.0: empty Next-Run cells no longer crash the first run (v3.0
// date-formatted the cell BEFORE its emptiness guard, outside any try, so the
// documented fresh-tracker state could never score); per-row try/catch;
// LockService against overlap with the Researcher; execution budget guard.
// ============================================================================
function runScoutLayer() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { notifyFailure_("Scout", "could not acquire lock"); return; }
  const started = Date.now();
  try {
    const sheet = getTrackerSheet_();
    const data = sheet.getDataRange().getValues();
    const tz = Session.getScriptTimeZone();
    const todayStr = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
    let failures = 0;

    for (let i = 1; i < data.length; i++) {
      if (Date.now() - started > CONFIG.EXECUTION_BUDGET_MS) {
        notifyFailure_("Scout", "execution budget reached at row " + (i + 1) + "; remaining rows deferred to next run");
        break;
      }
      const topic = data[i][COL.TOPIC - 1];
      if (!topic) continue;

      // Empty/invalid Next Run means "due now" — check BEFORE any date math.
      const nextRunCell = data[i][COL.NEXT_RUN - 1];
      let due = true;
      if (nextRunCell) {
        const nextRunObj = new Date(nextRunCell);
        if (!isNaN(nextRunObj.getTime())) {
          due = Utilities.formatDate(nextRunObj, tz, "yyyy-MM-dd") <= todayStr;
        }
      }
      if (!due) continue;

      const prompt = 'Scan the web and recent developments regarding "' + topic + '" in manufacturing. ' +
        "Give a single Impact Score (0-10) based on enterprise readiness and measurable ROI. " +
        'Respond ONLY with a valid JSON object using this exact format: {"score": 8, "notes": "Brief explanation"}';
      try {
        const aiResponse = parseModelJson_(callGeminiWithFallback(prompt, true));
        // Parseable is not valid: a missing/non-numeric score would make the
        // Researcher's `score >= 7` silently false forever — reject instead.
        if (typeof aiResponse.score !== "number" || isNaN(aiResponse.score) ||
            aiResponse.score < 0 || aiResponse.score > 10) {
          throw new Error("Invalid score in model response: " + JSON.stringify(aiResponse.score));
        }
        sheet.getRange(i + 1, COL.SCORE).setValue(aiResponse.score);
        sheet.getRange(i + 1, COL.NOTES).setValue(aiResponse.notes);
        sheet.getRange(i + 1, COL.LAST_RUN).setValue(new Date());
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        sheet.getRange(i + 1, COL.NEXT_RUN).setValue(nextWeek);
      } catch (error) {
        failures++;
        sheet.getRange(i + 1, COL.NOTES).setValue("SCOUT_FAIL " + todayStr + ": " + error.message);
        Logger.log("Error processing " + topic + ": " + error);
      }
    }
    if (failures > 0) notifyFailure_("Scout", failures + " topic(s) failed — see tracker Execution Notes");
  } catch (err) {
    notifyFailure_("Scout (layer-level)", err);
    throw err; // rethrow so Apps Script's own failure accounting also sees it
  } finally {
    lock.releaseLock();
  }
}

// ============================================================================
// LAYER 2: THE RESEARCHER (daily 7-8 AM trigger)
// Kept from v3.0: score resets to 0 only after a successful write, so failed
// research retries next day. Added: a consecutive-failure cap so a persistent
// cause (wrong MASTER_DOC_ID, dead topic) cannot burn quota daily forever.
// ============================================================================
function runDeepResearchLayer() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { notifyFailure_("Researcher", "could not acquire lock"); return; }
  const started = Date.now();
  try {
    const sheet = getTrackerSheet_();
    const data = sheet.getDataRange().getValues();
    const tz = Session.getScriptTimeZone();
    const todayStr = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");

    for (let i = 1; i < data.length; i++) {
      if (Date.now() - started > CONFIG.EXECUTION_BUDGET_MS) {
        notifyFailure_("Researcher", "execution budget reached at row " + (i + 1) + "; remaining rows deferred");
        break;
      }
      const topic = data[i][COL.TOPIC - 1];
      const score = data[i][COL.SCORE - 1];
      if (!topic || !(score >= 7)) continue;

      const notes = String(data[i][COL.NOTES - 1] || "");
      const failCount = (notes.match(/RESEARCH_FAIL/g) || []).length;
      if (failCount >= CONFIG.RESEARCH_FAIL_LIMIT) {
        sheet.getRange(i + 1, COL.SCORE).setValue(0);
        notifyFailure_("Researcher", 'Topic "' + topic + '" parked after ' + failCount + " consecutive failures");
        continue;
      }

      const prompt = "Act as an expert Manufacturing & Supply Chain AI Research Analyst. " +
        "Conduct a comprehensive Deep Research sweep on '" + topic + "'. " +
        "Detail: autonomous capabilities, real-world enterprise adoption, measurable ROI, and human-in-the-loop governance. " +
        "Output Format: Executive Summary, Vendor Landscape, Measurable ROI, Implementation Prerequisites.";
      try {
        const reportText = callGeminiWithFallback(prompt, true);
        const doc = DocumentApp.openById(CONFIG.MASTER_DOC_ID);
        const body = doc.getBody();
        body.insertHorizontalRule(0);
        body.insertParagraph(0, reportText);
        body.insertParagraph(0, "Report: " + topic + " - " + todayStr)
          .setHeading(DocumentApp.ParagraphHeading.HEADING1);
        doc.saveAndClose();
        Logger.log("Successfully added report for: " + topic);
        sheet.getRange(i + 1, COL.SCORE).setValue(0); // reset only on success
      } catch (error) {
        sheet.getRange(i + 1, COL.NOTES).setValue(notes + " | RESEARCH_FAIL " + todayStr + ": " + error.message);
        notifyFailure_('Researcher topic "' + topic + '"', error);
      }
    }
  } catch (err) {
    notifyFailure_("Researcher (layer-level)", err);
    throw err;
  } finally {
    lock.releaseLock();
  }
}

// ============================================================================
// LAYER 3: THE SYNTHESIZER (weekly Monday 8-9 AM trigger — weekly by design;
// the blueprint's diagram drew this as a daily stage, the trigger is canonical)
// Fixes vs v3.0: bounded log slice; empty-deck guard BEFORE mutating anything;
// slides duplicated in REVERSE so the final deck is in order (duplicate()
// inserts immediately after the master, so forward iteration reversed it);
// bullets replaced individually (multi-line replaceAllText is unproven and
// v3.0's fallback left "Bullet point 2/3" residue); PPTX export checked.
// ============================================================================
function runSynthesisLayer() {
  // Same lock as the other layers: a Researcher run drifting past 8 AM must
  // not have the Monday synthesis read a mid-write Master Log.
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(60000)) { notifyFailure_("Synthesizer", "could not acquire lock"); return; }
  try {
    const fullText = DocumentApp.openById(CONFIG.MASTER_DOC_ID).getBody().getText();
    // Log is newest-first: the leading slice is the most recent research.
    const docText = fullText.slice(0, CONFIG.SYNTHESIS_MAX_CHARS);
    if (!docText.trim()) throw new Error("Master Log is empty — nothing to synthesize.");

    const prompt = "Act as a Chief Supply Chain Officer (CSCO). Read the accumulated deep research log.\n" +
      "Generate two outputs:\n" +
      "1. An Executive Report (HTML format).\n" +
      "2. A structured JSON array for a 4-slide Executive Deck.\n" +
      "Respond strictly with valid JSON in this exact format. Do NOT use literal newlines inside strings.\n" +
      '{ "reportHtml": "<h1>Executive Summary</h1>...", "slides": [ { "title": "Phase 1 Roadmap", "bullets": ["Point 1", "Point 2", "Point 3"] } ] }\n' +
      "Research Log:\n" + docText;

    let data = null;
    for (let jsonRetries = 0; !data && jsonRetries < 3; jsonRetries++) {
      // API call sits OUTSIDE the parse try: non-retryable errors (bad key,
      // cascade exhausted) propagate immediately with their real message
      // instead of being re-labeled as JSON-parse failures after 3 retries.
      const rawText = callGeminiWithFallback(prompt, false);
      try {
        data = parseModelJson_(rawText);
      } catch (parseErr) {
        if (jsonRetries >= 2) throw new Error("Failed to parse valid JSON after 3 attempts.");
        Utilities.sleep(2000);
      }
    }
    if (!data || !Array.isArray(data.slides) || data.slides.length === 0) {
      throw new Error("Model returned no slides — deck not generated."); // guard BEFORE any copy
    }

    const tz = Session.getScriptTimeZone();
    const todayStr = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
    const deckTitle = "AI Strategy Deck - " + todayStr;

    const templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_ID);
    const targetFolder = DriveApp.getFolderById(CONFIG.TARGET_FOLDER_ID);
    const newDeckFile = templateFile.makeCopy(deckTitle, targetFolder);
    const deck = SlidesApp.openById(newDeckFile.getId());

    let slides = deck.getSlides();
    slides[0].replaceAllText("Title Placeholder", "Manufacturing AI Strategic Roadmap");
    slides[0].replaceAllText("Subtitle Placeholder", "Generated: " + todayStr);

    const masterContentSlide = slides.length > 1 ? slides[1] : null;
    // duplicate() inserts immediately after the master, so the last duplicate
    // ends up first — reverse input yields an in-order deck. appendSlide()
    // appends at the end, so the fallback path iterates FORWARD instead.
    const orderedInput = masterContentSlide ? data.slides.slice().reverse() : data.slides;
    orderedInput.forEach(function (slideData) {
      const newSlide = masterContentSlide ? masterContentSlide.duplicate()
        : deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
      newSlide.replaceAllText("Slide Title Placeholder", slideData.title || "");
      const bullets = Array.isArray(slideData.bullets) ? slideData.bullets : [];
      // Individually: template has exactly 3 bullet lines; extras fold into #3.
      newSlide.replaceAllText("Bullet point 1", bullets[0] || "");
      newSlide.replaceAllText("Bullet point 2", bullets[1] || "");
      newSlide.replaceAllText("Bullet point 3", bullets.slice(2).join("\n") || "");
    });

    slides = deck.getSlides();
    if (masterContentSlide && slides.length > 1) {
      slides[1].remove(); // remove the master reference slide
    }
    deck.saveAndClose();

    const pptxUrl = "https://docs.google.com/feeds/download/presentations/Export?id=" +
      deck.getId() + "&exportFormat=pptx";
    const pptxResp = UrlFetchApp.fetch(pptxUrl, {
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    if (pptxResp.getResponseCode() !== 200) {
      throw new Error("PPTX export failed: HTTP " + pptxResp.getResponseCode());
    }
    const pptxBlob = pptxResp.getBlob().setName("AI_Strategy_Roadmap_" + todayStr + ".pptx");

    MailApp.sendEmail({
      to: CONFIG.ALERT_EMAIL || Session.getActiveUser().getEmail(),
      subject: "AI Strategic Roadmap & Strategy PPTX - " + todayStr,
      htmlBody: data.reportHtml || "<p>(report body missing)</p>",
      attachments: [pptxBlob]
    });
    Logger.log("Successfully generated populated presentation (" + data.slides.length + " content slides).");
  } catch (err) {
    notifyFailure_("Synthesizer", err);
    throw err;
  } finally {
    lock.releaseLock();
  }
}
