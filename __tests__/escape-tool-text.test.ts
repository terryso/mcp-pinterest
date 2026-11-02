import { describe, expect, it } from '@jest/globals';
import { escapeToolText } from '../src/escape-tool-text.js';

describe('escapeToolText', () => {
  it('leaves ordinary keywords and image URLs unchanged', () => {
    expect(escapeToolText('cats')).toBe('cats');
    expect(escapeToolText('https://i.pinimg.com/originals/abc.jpg')).toBe(
      'https://i.pinimg.com/originals/abc.jpg'
    );
  });

  it('entity-encodes HTML so scraped titles cannot inject markup', () => {
    const keyword = '<img src=x onerror=alert(1)>';
    const line = `Found 1 images related to "${escapeToolText(keyword)}" on Pinterest`;

    expect(line).not.toContain('<img');
    expect(line).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('neutralizes markdown link labels without damaging the URL', () => {
    const title = 'see [docs](https://evil.example/a.jpg)';
    const escaped = escapeToolText(title);

    expect(escaped).toBe('see \\[docs\\](https://evil.example/a.jpg)');
    expect(escaped).toContain('https://evil.example/a.jpg');
  });

  it('flattens newlines and escapes emphasis and code markers', () => {
    expect(escapeToolText('line1\nline2 `code` *bold*')).toBe(
      'line1 line2 \\`code\\` \\*bold\\*'
    );
  });

  it('encodes ampersands before other entities', () => {
    expect(escapeToolText('a & b < c')).toBe('a &amp; b &lt; c');
  });

  it('stringifies non-strings and treats null as empty', () => {
    expect(escapeToolText(null)).toBe('');
    expect(escapeToolText(undefined)).toBe('');
    expect(escapeToolText(12)).toBe('12');
  });
});
