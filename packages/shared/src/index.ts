/**
 * @google/shared — public re-exports.
 *
 * Apps import via subpath:
 *   import { exampleSchema } from '@google/shared/schemas';
 */

export * from './schemas';
export * from './state';
export * from './constants';

// NOTE: './types' is deliberately NOT re-exported here. It is a convenience barrel
// for subpath imports (`@<pkg>/shared/types`) that re-exports names already surfaced
// by './schemas' and './state' - star-exporting it too would declare each of those
// names twice from this module (eslint import/export).
