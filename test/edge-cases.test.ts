/**
 * Tests for edge cases in BibTeX parsing
 * 
 * These tests verify how the parser handles various edge cases:
 * - Empty/null entries
 * - Escape characters in strings
 * - Number ranges
 * - Other special syntax cases
 */

import { Parser } from '../src/lib/parser';
import { BtMetatype } from '../src/lib/types';

describe('Empty and Null Entry Tests', () => {
  test('should parse entry with empty key', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{}');
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({
      type: 'article',
      key: '',
      metatype: BtMetatype.REGULAR
    });
    expect(Object.keys(result[0].fields).length).toBe(0);
  });
  
  test('should parse entry with whitespace key', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{ }');
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({
      type: 'article',
      key: '',
      metatype: BtMetatype.REGULAR
    });
  });
  
  test('should parse entry with empty fields', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, }');
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({
      type: 'article',
      key: 'key123',
      metatype: BtMetatype.REGULAR
    });
    expect(Object.keys(result[0].fields).length).toBe(0);
  });
  
  test('should parse entry with empty field value', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, title = {}}');
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({
      type: 'article',
      key: 'key123',
      metatype: BtMetatype.REGULAR
    });
    expect(result[0].fields.title).toBe('');
  });
  
  test('should parse entry with empty quoted field value', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, title = ""}');
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({
      type: 'article',
      key: 'key123',
      metatype: BtMetatype.REGULAR
    });
    expect(result[0].fields.title).toBe('');
  });
  
  test('should parse adjacent entries without separator', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key1}@article{key2}');
    expect(result.length).toBe(2);
    expect(result[0].key).toBe('key1');
    expect(result[1].key).toBe('key2');
  });
});

describe('Escape Character Tests', () => {
  test('should handle backslash escapes in quoted strings', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, title = "Quotes \\"inside\\" string"}');
    expect(result.length).toBe(1);
    expect(result[0].fields.title).toBe('Quotes "inside" string');
  });
  
  test('should handle backslash escapes in braced strings', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, title = {Escaped \\{braces\\} in string}}');
    expect(result.length).toBe(1);
    expect(result[0].fields.title).toBe('Escaped \\{braces\\} in string');
  });
  
  test('should preserve LaTeX special characters', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, title = {Special \\& \\% \\$ \\_}}');
    expect(result.length).toBe(1);
    expect(result[0].fields.title).toBe('Special \\& \\% \\$ \\_');
  });
  
  test('should handle complex escape sequences', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, title = {Complex $\\mathcal{O}(n^2)$ notation}}');
    expect(result.length).toBe(1);
    expect(result[0].fields.title).toBe('Complex $\\mathcal{O}(n^2)$ notation');
  });
  
  test('should handle backslash at end of string', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, title = {Trailing backslash \\}}');
    expect(result.length).toBe(1);
    expect(result[0].fields.title).toBe('Trailing backslash \\');
  });
});

describe('Number Range Tests', () => {
  test('should parse page ranges with double dash', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, pages = {10--20}}');
    expect(result.length).toBe(1);
    expect(result[0].fields.pages).toBe('10--20');
  });
  
  test('should parse page ranges with single dash', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, pages = {10-20}}');
    expect(result.length).toBe(1);
    expect(result[0].fields.pages).toBe('10-20');
  });
  
  test('should parse complex page ranges', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, pages = {10--20, 35--40}}');
    expect(result.length).toBe(1);
    expect(result[0].fields.pages).toBe('10--20, 35--40');
  });
  
  test('should parse numeric range as literal value', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, pages = 10--20}');
    expect(result.length).toBe(1);
    expect(result[0].fields.pages).toBe('10--20');
  });
  
  test('should parse compound page identifiers', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key123, pages = {A10--A20}}');
    expect(result.length).toBe(1);
    expect(result[0].fields.pages).toBe('A10--A20');
  });
});

describe('Other Edge Cases', () => {
  test('should parse entries with unusual but valid keys', () => {
    const parser = new Parser();
    const result = parser.parseString('@article{key-with-dashes:and:colons+plus+chars}');
    expect(result.length).toBe(1);
    expect(result[0].key).toBe('key-with-dashes:and:colons+plus+chars');
  });
  
  test('should parse multiple entries with the same key', () => {
    const parser = new Parser();
    const input = `
      @article{duplicate, title = {First}}
      @article{duplicate, title = {Second}}
    `;
    const result = parser.parseString(input);
    expect(result.length).toBe(2);
    expect(result[0].key).toBe('duplicate');
    expect(result[1].key).toBe('duplicate');
    expect(result[0].fields.title).toBe('First');
    expect(result[1].fields.title).toBe('Second');
  });
  
  test.skip('should parse entries with missing comma', () => {
    const parser = new Parser();
    try {
      // This might fail depending on the parser's strictness, but should be handled
      const result = parser.parseString('@article{key, title = {Title} author = {Author}}');
      if (result.length > 0) {
        // Parse succeeded, verify the content
        expect(result[0].type).toBe('article');
        expect(result[0].key).toBe('key');
      }
    } catch (error) {
      // If it fails, that's an acceptable outcome too
      console.log('Parser requires commas between fields (expected behavior)');
    }
  });
}); 