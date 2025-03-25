/**
 * Tests specifically for BibTeX entry types (Jest version)
 */

import { Parser } from '../src/lib/parser';
import { BtMetatype } from '../src/lib/types';

describe('BibTeX Entry Types', () => {

  describe('Standard Entry Types', () => {
    const entryTypes = [
      'article',
      'book',
      'booklet',
      'conference',
      'inbook',
      'incollection',
      'inproceedings',
      'manual',
      'mastersthesis',
      'misc',
      'phdthesis',
      'proceedings',
      'techreport',
      'unpublished'
    ];

    test.each(entryTypes)('should parse %s entry type', (entryType) => {
      const bib = `@${entryType}{key, title = {Test}}`;
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe(entryType);
      expect(entries[0].metatype).toBe(BtMetatype.REGULAR);
    });
  });

  describe('Custom Entry Types', () => {
    test('should parse custom entry type', () => {
      const customBib = '@customentrya{key, title = {Custom Entry}}';
      const parser = new Parser();
      const customEntries = parser.parseString(customBib);

      expect(customEntries.length).toBe(1);
      expect(customEntries[0].type).toBe('customentrya');
      expect(customEntries[0].metatype).toBe(BtMetatype.REGULAR);
    });
  });

  describe('Case Insensitivity', () => {
    test('should normalize entry types to lowercase', () => {
      const mixedCaseBib = '@ArTiClE{key, title = {Mixed Case}}';
      const parser = new Parser();
      const mixedCaseEntries = parser.parseString(mixedCaseBib);

      expect(mixedCaseEntries.length).toBe(1);
      expect(mixedCaseEntries[0].type).toBe('article');
    });
  });

  describe('Special Entry Types', () => {
    test('should parse string entries', () => {
      const stringBib = '@string{journal = "Journal Name"}';
      const parser = new Parser();
      const stringEntries = parser.parseString(stringBib);

      expect(stringEntries.length).toBe(1);
      expect(stringEntries[0].type).toBe('string');
      expect(stringEntries[0].metatype).toBe(BtMetatype.MACRODEF);
    });

    test('should parse preamble entries', () => {
      const preambleBib = '@preamble{"Preamble Text"}';
      const parser = new Parser();
      const preambleEntries = parser.parseString(preambleBib);

      expect(preambleEntries.length).toBe(1);
      expect(preambleEntries[0].type).toBe('preamble');
      expect(preambleEntries[0].metatype).toBe(BtMetatype.PREAMBLE);
    });

    test('should parse comment entries', () => {
      const commentBib = '@comment{Comment Text}';
      const parser = new Parser();
      const commentEntries = parser.parseString(commentBib);

      expect(commentEntries.length).toBe(1);
      expect(commentEntries[0].type).toBe('comment');
      expect(commentEntries[0].metatype).toBe(BtMetatype.COMMENT);
    });
  });
}); 