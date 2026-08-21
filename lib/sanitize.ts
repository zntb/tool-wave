/**
 * Input sanitization utilities to prevent stored XSS.
 *
 * React escapes output by default, but these helpers provide defense-in-depth
 * by sanitizing data before it's stored in the database.
 */

/**
 * Strip `<script>` tags and their content from a string.
 */
function stripScriptTags(input: string): string {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Strip event handler attributes (onclick, onerror, etc.) from a string.
 */
function stripEventHandlers(input: string): string {
  return input.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

/**
 * Strip `javascript:` protocol URIs.
 */
function stripJavascriptUri(input: string): string {
  return input.replace(/javascript\s*:/gi, '');
}

/**
 * Sanitize a single string value.
 * - Trims whitespace
 * - Strips script tags
 * - Strips event handlers
 * - Strips javascript: URIs
 */
export function sanitizeString(input: string): string {
  return stripJavascriptUri(
    stripEventHandlers(stripScriptTags(input.trim())),
  );
}

/**
 * Sanitize an optional string value. Returns undefined if the input is undefined or empty after trimming.
 */
export function sanitizeOptional(input: string | undefined | null): string | undefined {
  if (input == null) return undefined;
  const sanitized = sanitizeString(input);
  return sanitized.length > 0 ? sanitized : undefined;
}

/**
 * Sanitize an object's string fields in-place.
 * Pass the field names that should be sanitized.
 */
export function sanitizeFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T & string)[],
): T {
  const result = { ...data };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[field] = sanitizeString(value);
    }
  }
  return result;
}
