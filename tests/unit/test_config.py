"""Tests for env-derived Settings."""

from __future__ import annotations

from pathlib import Path

import pytest
from pydantic import ValidationError

VALID_ENV = {
    "DATABASE_URL": "postgresql://user:pass@localhost:5432/db",
    "REDIS_URL": "redis://localhost:6379",
    "JWT_SECRET": "a" * 48,
    "SESSION_SECRET": "b" * 48,
    "CORS_ORIGINS": "http://localhost:3000",
}


def _import_settings(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path, env: dict[str, str]
) -> object:
    """Re-import the config module under a clean, isolated env.

    Isolation matters twice over:

    1. `Settings` reads `env_file=".env"` **relative to the current directory**, so the
       test runs from an empty tmp dir. Without this, the developer's own `.env` (which
       `01_setup/run.ps1` creates from `.env.example` during bootstrap) supplies the very
       values a negative test is trying to remove - so the test passes on a fresh clone
       and silently stops testing anything the moment anyone runs the documented setup.
    2. Every key is cleared before the case's own values are set, so "missing X" really
       means missing rather than "inherited from the ambient environment".
    """
    import importlib
    import sys

    monkeypatch.chdir(tmp_path)
    for key in VALID_ENV:
        monkeypatch.delenv(key, raising=False)
    for key, value in env.items():
        monkeypatch.setenv(key, value)

    if "google.config" in sys.modules:
        del sys.modules["google.config"]
    return importlib.import_module("google.config")


def test_valid_env_imports(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    mod = _import_settings(monkeypatch, tmp_path, VALID_ENV)
    assert mod.settings.database_url is not None
    assert mod.settings.llm_daily_budget_usd == 10.0


def test_short_jwt_rejected(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    env = {**VALID_ENV, "JWT_SECRET": "short"}
    with pytest.raises(ValidationError):
        _import_settings(monkeypatch, tmp_path, env)


def test_missing_database_url_rejected(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    env = {k: v for k, v in VALID_ENV.items() if k != "DATABASE_URL"}
    with pytest.raises(ValidationError):
        _import_settings(monkeypatch, tmp_path, env)


def test_blank_optional_url_is_unset(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    """A blank line in .env means unset, not an empty URL.

    Regression guard: `.env.example` ships SENTRY_DSN= and
    OTEL_EXPORTER_OTLP_ENDPOINT= with no value, and bootstrap copies it to `.env`.
    Before the coercion in config.py, that combination made the app refuse to start.
    """
    env = {**VALID_ENV, "SENTRY_DSN": "", "OTEL_EXPORTER_OTLP_ENDPOINT": ""}
    mod = _import_settings(monkeypatch, tmp_path, env)
    assert mod.settings.sentry_dsn is None
    assert mod.settings.otel_exporter_otlp_endpoint is None
