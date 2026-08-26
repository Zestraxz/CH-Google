"""CLI entry point for Google.

Invoke via `python -m google` or the installed `google` console script.
"""

from __future__ import annotations

import sys


def main(argv: list[str] | None = None) -> int:
    """Program entry. Return process exit code."""
    args = list(sys.argv[1:] if argv is None else argv)

    if not args or args[0] in {"-h", "--help"}:
        print("Google — TODO: implement CLI")
        print("")
        print("Usage:")
        print("  google [command] [args...]")
        return 0

    # TODO: dispatch on args[0]
    print(f"TODO: implement command {args[0]!r}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
