/**
 * Compile-time constants for Google.
 * Runtime env values go via Vite's import.meta.env, not here.
 */

export const APP_NAME = 'Google';
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
export const FEATURE_FLAGS = {
  EXAMPLE: (import.meta.env.VITE_FEATURE_EXAMPLE ?? 'false') === 'true',
} as const;
