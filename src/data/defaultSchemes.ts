import { SchemeRecord } from "../types/scheme";

/**
 * Default fallback schemes collection.
 * 18 duplicate cases removed. The primary source of truth is
 * the authentic server-synchronized dataset loaded via /api/schemes.
 */
export const DEFAULT_SCHEMES_DATABASE: SchemeRecord[] = [];
