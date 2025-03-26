/**
 * BibTeX stringify functionality tests
 * 
 * These tests verify the functionality to convert BibTeX entries back to strings:
 * - Regular entries with different field types
 * - Special entries (string, comment, preamble)
 * - Round-trip conversion (parse -> stringify -> parse)
 */

import { Parser } from '../src/lib/parser';
import { BtMetatype, BtEntry } from '../src/lib/types';

describe('BibTeX Stringify Functionality', () => {
  // Helper function to create a clean bibtex string for comparison
  const cleanBibtex = (str: string) => {
    return str.replace(/\s+/g, ' ').trim();
  };

  describe('Regular Entries', () => {
    test('should stringify a basic article entry', () => {
      const parser = new Parser();
      const entry: BtEntry = {
        type: 'article',
        key: 'key123',
        metatype: BtMetatype.REGULAR,
        fields: {
          title: 'Sample Title',
          author: 'Sample Author',
          year: '2023'
        }
      };

      const result = parser.stringifyEntry(entry);
      expect(result).toContain('@article{key123');
      expect(result).toContain('title = {Sample Title}');
      expect(result).toContain('author = {Sample Author}');
      expect(result).toContain('year = {2023}');
    });

    test('should stringify an entry with no fields', () => {
      const parser = new Parser();
      const entry: BtEntry = {
        type: 'book',
        key: 'emptyBook',
        metatype: BtMetatype.REGULAR,
        fields: {}
      };

      const result = parser.stringifyEntry(entry);
      expect(result).toBe('@book{emptyBook}');
    });
  });

  describe('Special Entry Types', () => {
    test('should stringify a comment entry', () => {
      const parser = new Parser();
      const entry: BtEntry = {
        type: 'comment',
        key: '',
        metatype: BtMetatype.COMMENT,
        fields: {
          content: 'This is a comment'
        }
      };

      const result = parser.stringifyEntry(entry);
      expect(result).toBe('@comment{This is a comment}');
    });

    test('should stringify a preamble entry', () => {
      const parser = new Parser();
      const entry: BtEntry = {
        type: 'preamble',
        key: '',
        metatype: BtMetatype.PREAMBLE,
        fields: {
          content: 'This is a preamble'
        }
      };

      const result = parser.stringifyEntry(entry);
      expect(result).toBe('@preamble{{This is a preamble}}');
    });

    test('should stringify a string/macro definition', () => {
      const parser = new Parser();
      const entry: BtEntry = {
        type: 'string',
        key: '',
        metatype: BtMetatype.MACRODEF,
        fields: {
          journal1: 'Journal of Something'
        }
      };

      const result = parser.stringifyEntry(entry);
      expect(result).toBe('@string{journal1 = "Journal of Something"}');
    });

    test('should stringify multiple macro definitions', () => {
      const parser = new Parser();
      const entry: BtEntry = {
        type: 'string',
        key: '',
        metatype: BtMetatype.MACRODEF,
        fields: {
          journal2: 'Journal of Something',
          publisher: 'Example Publisher'
        }
      };

      const result = parser.stringifyEntry(entry);
      expect(result).toContain('@string{');
      expect(result).toContain('journal2 = "Journal of Something"');
      expect(result).toContain('publisher = "Example Publisher"');
    });
  });

  describe('Multiple Entries', () => {
    test('should stringify multiple entries', () => {
      const parser = new Parser();
      const entries: BtEntry[] = [
        {
          type: 'article',
          key: 'article1',
          metatype: BtMetatype.REGULAR,
          fields: {
            title: 'Article Title',
            author: 'Some Author'
          }
        },
        {
          type: 'book',
          key: 'book1',
          metatype: BtMetatype.REGULAR,
          fields: {
            title: 'Book Title',
            author: 'Another Author',
            year: '2023'
          }
        }
      ];

      const result = parser.stringifyEntries(entries);
      expect(result).toContain('@article{article1');
      expect(result).toContain('@book{book1');
      expect(result).toContain('title = {Article Title}');
      expect(result).toContain('title = {Book Title}');
    });
  });

  describe('Round-trip Tests', () => {
    test('should correctly round-trip a regular entry', () => {
      const parser = new Parser();
      
      // Original BibTeX string
      const original = '@article{key123,\n  title = {Sample Title},\n  author = {Sample Author},\n  year = {2023}\n}';
      
      // Parse and then stringify
      const parsed = parser.parseString(original);
      expect(parsed.length).toBe(1);
      
      const stringified = parser.stringifyEntry(parsed[0]);
      
      // Parse the stringified version with a fresh parser
      const newParser = new Parser();
      const reparsed = newParser.parseString(stringified);
      expect(reparsed.length).toBe(1);
      
      // Compare the structures
      expect(reparsed[0].type).toBe(parsed[0].type);
      expect(reparsed[0].key).toBe(parsed[0].key);
      expect(reparsed[0].metatype).toBe(parsed[0].metatype);
      expect(reparsed[0].fields).toEqual(parsed[0].fields);
    });

    test('should correctly round-trip special entries', () => {
      // Test comment
      {
        const parser = new Parser();
        let original = '@comment{Some comment text}';
        let parsed = parser.parseString(original);
        let stringified = parser.stringifyEntry(parsed[0]);
        let reparsed = parser.parseString(stringified);
        
        expect(reparsed[0].type).toBe(parsed[0].type);
        expect(reparsed[0].metatype).toBe(parsed[0].metatype);
        expect(reparsed[0].fields.content).toBe(parsed[0].fields.content);
      }
      
      // Test preamble
      {
        const parser = new Parser();
        let original = '@preamble{{Some preamble text}}';
        let parsed = parser.parseString(original);
        let stringified = parser.stringifyEntry(parsed[0]);
        let reparsed = parser.parseString(stringified);
        
        expect(reparsed[0].type).toBe(parsed[0].type);
        expect(reparsed[0].metatype).toBe(parsed[0].metatype);
        expect(reparsed[0].fields.content).toBe(parsed[0].fields.content);
      }
      
      // Test string definition
      {
        const parser = new Parser();
        let original = '@string{testjournal = "Journal Name"}';
        let parsed = parser.parseString(original);
        let stringified = parser.stringifyEntry(parsed[0]);
        
        // Use a new parser for reparsing
        const newParser = new Parser();
        let reparsed = newParser.parseString(stringified);
        
        expect(reparsed[0].type).toBe(parsed[0].type);
        expect(reparsed[0].metatype).toBe(parsed[0].metatype);
        expect(reparsed[0].fields.testjournal).toBe(parsed[0].fields.testjournal);
      }
    });

    test('should correctly round-trip multiple entries', () => {
      const parser = new Parser();
      parser.clearMacros(); // Clear any macros from previous tests
      
      // Original BibTeX with multiple entries
      const original = `
        @article{key1,
          title = {Title 1},
          author = {Author 1}
        }

        @book{key2,
          title = {Title 2},
          author = {Author 2},
          year = {2023}
        }
      `;
      
      // Parse, stringify, and reparse
      const parsed = parser.parseString(original);
      expect(parsed.length).toBe(2);
      
      const stringified = parser.stringifyEntries(parsed);
      
      const newParser = new Parser(); // Use a fresh parser for reparsing
      const reparsed = newParser.parseString(stringified);
      
      // Check that we have the same number of entries
      expect(reparsed.length).toBe(parsed.length);
      
      // Check each entry
      for (let i = 0; i < parsed.length; i++) {
        expect(reparsed[i].type).toBe(parsed[i].type);
        expect(reparsed[i].key).toBe(parsed[i].key);
        expect(reparsed[i].metatype).toBe(parsed[i].metatype);
        expect(reparsed[i].fields).toEqual(parsed[i].fields);
      }
    });
  });
}); 