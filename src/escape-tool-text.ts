/**
 * Markdown characters that can start emphasis, code, or a link label.
 * Dots, slashes, and parentheses are left alone so image URLs stay copyable.
 */
const MARKDOWN_METACHARACTERS = /[\\`*_~[\]]/g;

/**
 * Escape untrusted text before it is placed in an MCP text tool result.
 *
 * Keywords and scraped titles or links are not trusted. HTML metacharacters
 * are entity-encoded, newlines are flattened, and a small set of Markdown
 * punctuation is backslash-escaped so a client that renders tool output
 * cannot treat that text as markup.
 *
 * @param value - Untrusted value. Null and undefined become an empty string.
 * @returns A single-line string safe to interpolate into tool text.
 */
export function escapeToolText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const text = typeof value === 'string' ? value : String(value);

  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r\n|\r|\n|\u2028|\u2029/g, ' ')
    .replace(MARKDOWN_METACHARACTERS, (character: string): string => `\\${character}`);
}
