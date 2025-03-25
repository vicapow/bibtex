/**
 * Tests specifically for BibTeX field parsing (Jest version)
 */

import { Parser } from '../src/lib/parser';

describe('Field Parsing Tests', () => {

  describe('Field Name Case Insensitivity', () => {
    const caseTests = [
      { fieldName: 'title', expected: 'title' },
      { fieldName: 'TITLE', expected: 'title' },
      { fieldName: 'Title', expected: 'title' },
      { fieldName: 'TiTlE', expected: 'title' }
    ];

    test.each(caseTests)('should normalize $fieldName to $expected', ({ fieldName, expected }) => {
      const bib = `@article{key, ${fieldName} = {Test}}`;
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields[expected]).toBeDefined();
      expect(entries[0].fields[expected]).toBe('Test');
    });
  });

  describe('Field Delimiters', () => {
    const delimiterTests = [
      { name: 'braces', delimiter: '{Test}', expected: 'Test' },
      { name: 'quotes', delimiter: '"Test"', expected: 'Test' },
      { name: 'number', delimiter: '123', expected: '123' }
    ];

    test.each(delimiterTests)('should parse $name delimiter correctly', ({ name, delimiter, expected }) => {
      const bib = `@article{key, title = ${delimiter}}`;
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe(expected);
    });
  });

  describe('Special Characters in Field Names', () => {
    const specialTests = [
      { fieldName: 'title_with_underscore', expected: 'title_with_underscore' },
      { fieldName: 'title-with-hyphen', expected: 'title-with-hyphen' },
      { fieldName: 'title.with.dots', expected: 'title.with.dots' },
      { fieldName: 'title:with:colons', expected: 'title:with:colons' }
    ];

    test.each(specialTests)('should preserve field name $fieldName', ({ fieldName, expected }) => {
      const bib = `@article{key, ${fieldName} = {Test}}`;
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields[expected]).toBeDefined();
      expect(entries[0].fields[expected]).toBe('Test');
    });
  });

  describe('Multiple Fields', () => {
    test('should parse entry with multiple fields', () => {
      const multiFieldBib = '@article{key, title = {Title}, author = {Author}, year = 2020, journal = {Journal}}';
      const parser = new Parser();
      const entries = parser.parseString(multiFieldBib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('Title');
      expect(entries[0].fields.author).toBe('Author');
      expect(entries[0].fields.year).toBe('2020');
      expect(entries[0].fields.journal).toBe('Journal');
    });
  });

  describe('Whitespace in Fields', () => {
    test('should parse entry with variable whitespace around equals', () => {
      const whitespaceBib = '@article{key, title = {Title}, author={Author}, year =  {2020}, journal    =    {Journal}}';
      const parser = new Parser();
      const entries = parser.parseString(whitespaceBib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('Title');
      expect(entries[0].fields.author).toBe('Author');
      expect(entries[0].fields.year).toBe('2020');
      expect(entries[0].fields.journal).toBe('Journal');
    });
  });

  describe('Trailing Comma', () => {
    test('should parse entry with trailing comma', () => {
      const trailingCommaBib = '@article{key, title = {Title},}';
      const parser = new Parser();
      const entries = parser.parseString(trailingCommaBib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('Title');
    });
  });

  describe('No Fields', () => {
    test('should parse entry with no fields', () => {
      const noFieldsBib = '@article{key}';
      const parser = new Parser();
      const entries = parser.parseString(noFieldsBib);
      
      expect(entries.length).toBe(1);
      expect(Object.keys(entries[0].fields).length).toBe(0);
    });
  });

  describe('Field Content with Special Characters', () => {
    test('should preserve special characters in field content', () => {
      const specialContentBib = '@article{key, title = {Title with !@#$%^&*()[] characters}}';
      const parser = new Parser();
      const entries = parser.parseString(specialContentBib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('Title with !@#$%^&*()[] characters');
    });
  });
}); 