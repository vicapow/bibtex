/**
 * Tests specifically for BibTeX entry key parsing (Jest version)
 */

import { Parser } from '../src/lib/parser';

describe('Entry Key Tests', () => {

  describe('Basic Keys', () => {
    test('should parse entry with basic key', () => {
      const basicKeyBib = '@article{basic-key, title = {Title}}';
      const parser = new Parser();
      const entries = parser.parseString(basicKeyBib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].key).toBe('basic-key');
    });
  });

  describe('Alphanumeric Keys', () => {
    test('should parse entry with alphanumeric key', () => {
      const alphaNumBib = '@article{key123, title = {Title}}';
      const parser = new Parser();
      const entries = parser.parseString(alphaNumBib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].key).toBe('key123');
    });
  });

  describe('Keys with Special Characters', () => {
    const specialKeyTests = [
      { key: 'key-with-hyphens', expected: 'key-with-hyphens' },
      { key: 'key_with_underscores', expected: 'key_with_underscores' },
      { key: 'key:with:colons', expected: 'key:with:colons' },
      { key: 'key.with.dots', expected: 'key.with.dots' },
      { key: 'key/with/slashes', expected: 'key/with/slashes' }
    ];

    test.each(specialKeyTests)('should parse entry with special key $key', ({ key, expected }) => {
      const bib = `@article{${key}, title = {Title}}`;
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].key).toBe(expected);
    });
  });

  describe('Author-Year Style Keys', () => {
    test('should parse entry with author-year key', () => {
      const authorYearBib = '@article{Smith2020, title = {Title}}';
      const parser = new Parser();
      const entries = parser.parseString(authorYearBib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].key).toBe('Smith2020');
    });
  });

  describe('Multiple Author Style Keys', () => {
    test('should parse entry with multiple author key', () => {
      const multiAuthorBib = '@article{SmithJones2020, title = {Title}}';
      const parser = new Parser();
      const entries = parser.parseString(multiAuthorBib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].key).toBe('SmithJones2020');
    });
  });

  describe('Suffix Style Keys', () => {
    test('should parse entry with suffix key', () => {
      const suffixBib = '@article{Smith2020a, title = {Title}}';
      const parser = new Parser();
      const entries = parser.parseString(suffixBib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].key).toBe('Smith2020a');
    });
  });

  describe('Complex Keys', () => {
    test('should parse entry with complex key', () => {
      const complexKeyBib = '@article{Smith-Jones_2020:paper.1, title = {Title}}';
      const parser = new Parser();
      const entries = parser.parseString(complexKeyBib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].key).toBe('Smith-Jones_2020:paper.1');
    });
  });

  describe('Numeric Keys', () => {
    test('should parse entry with numeric key', () => {
      const numericKeyBib = '@article{12345, title = {Title}}';
      const parser = new Parser();
      const entries = parser.parseString(numericKeyBib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].key).toBe('12345');
    });
  });

  describe('Case Sensitivity in Keys', () => {
    test('should preserve case in keys and treat them as distinct', () => {
      const caseKeyBib = '@article{Smith2020, title = {Title}}\n@article{SMITH2020, title = {Another Title}}';
      const parser = new Parser();
      const entries = parser.parseString(caseKeyBib);
      
      expect(entries.length).toBe(2);
      expect(entries[0].key).toBe('Smith2020');
      expect(entries[1].key).toBe('SMITH2020');
      expect(entries[0].key).not.toBe(entries[1].key);
    });
  });
}); 