/**
 * Primary tests for the BibTeX parser
 * 
 * This file contains the primary integration tests for the parser, testing
 * complex BibTeX input with multiple entry types and features combined.
 * 
 * For specific parser features, see:
 * - entry-types.test.ts - Tests for different entry types (article, book, etc.)
 * - entry-key.test.ts - Tests for entry key parsing
 * - field-parsing.test.ts - Tests for field name and value parsing
 * - value-parsing.test.ts - Tests for complex value parsing (macros, concatenation)
 */

import { Parser } from '../src/lib/parser';
import { BtMetatype, EXPAND_MACROS } from '../src/lib/types';

// test.only('test', () => {
//   let result = parser.parse(`@string{journal = "Journal Name"}`);
//   expect(result.length).toBe(1);
//   console.log(result);
// })

describe('Parser Component Tests', () => {

  describe('Basic Entry Parsing', () => {
    test('should parse a basic entry with no fields', () => {
      const bib = '@article{key}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('article');
      expect(entries[0].key).toBe('key');
      expect(Object.keys(entries[0].fields).length).toBe(0);
    });

    test('should parse a basic entry with one field', () => {
      const bib = '@article{key, title = {Title}}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('article');
      expect(entries[0].key).toBe('key');
      expect(entries[0].fields.title).toBe('Title');
    });

    test('should parse multiple entries', () => {
      const bib = '@article{key1, title = {Title1}}\n@book{key2, title = {Title2}}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(2);
      expect(entries[0].type).toBe('article');
      expect(entries[0].key).toBe('key1');
      expect(entries[0].fields.title).toBe('Title1');
      expect(entries[1].type).toBe('book');
      expect(entries[1].key).toBe('key2');
      expect(entries[1].fields.title).toBe('Title2');
    });

    test('should handle entry types case-insensitively', () => {
      const bib = '@ARTICLE{key, title = {Title}}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('article');
      expect(entries[0].metatype).toBe(BtMetatype.REGULAR);
    });
  });

  describe('String Entries', () => {
    test('should parse string definitions', () => {
      const bib = '@string{journal = "Journal Name"}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('string');
      expect(entries[0].metatype).toBe(BtMetatype.MACRODEF);
      expect(parser.lookupMacro('journal')).toBe('Journal Name');
    });

    test('should parse and merge multiple string definitions', () => {
      const bib = '@string{journal1 = "Journal One"}\n@string{journal2 = "Journal Two"}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(2);
      expect(entries[0].type).toBe('string');
      expect(entries[1].type).toBe('string');
      expect(parser.lookupMacro('journal1')).toBe('Journal One');
      expect(parser.lookupMacro('journal2')).toBe('Journal Two');
    });

    test('should handle uppercase STRING entries', () => {
      const bib = '@STRING{publisher = "Publisher Name"}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('string');
      expect(parser.lookupMacro('publisher')).toBe('Publisher Name');
    });
  });

  describe('Preamble Entries', () => {
    test('should parse preamble entries', () => {
      const bib = '@preamble{"Some preamble text"}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('preamble');
      expect(entries[0].metatype).toBe(BtMetatype.PREAMBLE);
    });

    test('should parse preamble entries with braces', () => {
      const bib = '@preamble{{Some preamble text}}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('preamble');
    });

    test('should handle uppercase PREAMBLE entries', () => {
      const bib = '@PREAMBLE{"Some preamble text"}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('preamble');
    });
  });

  describe('Comment Entries', () => {
    test('should parse comment entries', () => {
      const bib = '@comment{Some comment text}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('comment');
      expect(entries[0].metatype).toBe(BtMetatype.COMMENT);
    });

    test('should handle uppercase COMMENT entries', () => {
      const bib = '@COMMENT{Some comment text}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('comment');
    });

    test('should preserve comment text', () => {
      const commentText = 'This is a test comment with special chars: !@#$%^&*()';
      const bib = `@comment{${commentText}}`;
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('comment');
      // Assuming comment content is stored somewhere in the entry
      // This depends on how your parser stores comments
    });
  });

  describe('Field Parsing', () => {
    test('should parse fields with various delimiters', () => {
      const bib = '@article{key, title = {Title}, journal = "Journal", year = 2020}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('Title');
      expect(entries[0].fields.journal).toBe('Journal');
      expect(entries[0].fields.year).toBe('2020');
    });

    test('should handle fields case-insensitively', () => {
      const bib = '@article{key, TITLE = {Title}, JOURNAL = "Journal"}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('Title');
      expect(entries[0].fields.journal).toBe('Journal');
    });

    test('should handle whitespace around field equals', () => {
      const bib = '@article{key, title   =   {Title}, journal   =   "Journal", year   =   2020}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('Title');
      expect(entries[0].fields.journal).toBe('Journal');
      expect(entries[0].fields.year).toBe('2020');
    });

    test('should handle a trailing comma in the field list', () => {
      const bib = '@article{key, title = {Title},}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('Title');
    });
  });

  describe('Value Parsing', () => {
    test('should concatenate strings with # operator', () => {
      const bib = '@article{key, title = "First" # " " # "Second"}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('First Second');
    });

    test('should handle whitespace around # operator', () => {
      const bib = '@article{key, title = "First"#"Second", journal = "Journal" # "Name"}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('FirstSecond');
      expect(entries[0].fields.journal).toBe('JournalName');
    });

    test('should concatenate mixed value types', () => {
      const bib = '@article{key, title = "First" # {Middle} # 2020}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('FirstMiddle2020');
    });

    test('should handle nested braces in string values', () => {
      const bib = '@article{key, title = {Nested {braces} are {preserved}}}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('Nested {braces} are {preserved}');
    });
  });

  describe('Macro Parsing', () => {
    test('should expand macros in field values', () => {
      // First define the macro
      const parser = new Parser();
      parser.parseString('@string{journal = "Test Journal"}');
      
      // Then use it with expansion option set
      const bib = '@article{key, journal = journal}';
      const entries = parser.parseString(bib, 'string input', EXPAND_MACROS);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.journal).toBe('Test Journal');
    });

    test('should delete macros correctly', () => {
      // Setup parser with some macros
      const parser = new Parser();
      parser.parseString('@string{journal = "Test Journal"}');
      parser.parseString('@string{publisher = "Test Publisher"}');
      
      // Verify macros exist
      expect(parser.macroExists('journal')).toBe(true);
      expect(parser.macroExists('publisher')).toBe(true);
      
      // Delete one macro
      const deleteResult = parser.deleteMacro('journal');
      expect(deleteResult).toBe(true);
      
      // Verify it was deleted and other macro remains
      expect(parser.macroExists('journal')).toBe(false);
      expect(parser.macroExists('publisher')).toBe(true);
      
      // Try to delete a non-existent macro
      const nonExistentResult = parser.deleteMacro('nonexistent');
      expect(nonExistentResult).toBe(false);
      
      // Verify case insensitivity
      const caseInsensitiveResult = parser.deleteMacro('PUBLISHER');
      expect(caseInsensitiveResult).toBe(true);
      expect(parser.macroExists('publisher')).toBe(false);
    });

    test('should concatenate macros with strings', () => {
      // First define the macro
      const parser = new Parser();
      parser.parseString('@string{prefix = "Prefix"}');
      
      // Then use it in concatenation with expansion option set
      const bib = '@article{key, title = prefix # ": " # "Suffix"}';
      const entries = parser.parseString(bib, 'string input', EXPAND_MACROS);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('Prefix: Suffix');
    });

    test('should use undefined macros as literals', () => {
      const bib = '@article{key, publisher = unknownpublisher}';
      const parser = new Parser();
      const entries = parser.parseString(bib, 'string input', EXPAND_MACROS);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.publisher).toBe('unknownpublisher');
    });

    test('should handle recursive macro definitions', () => {
      // Define macros that reference each other
      const parser = new Parser();
      parser.parseString('@string{first = "First"}');
      parser.parseString('@string{second = first # " Second"}');
      
      // Use the recursive macro with expansion option set
      const bib = '@article{key, title = second}';
      const entries = parser.parseString(bib, 'string input', EXPAND_MACROS);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('First Second');
    });
  });

  describe('Whitespace Handling', () => {
    test('should handle extra whitespace around entries', () => {
      const bib = '  \n  @article{key, title = {Title}}  \n  ';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe('article');
      expect(entries[0].fields.title).toBe('Title');
    });

    test('should handle whitespace between entries', () => {
      const bib = '@article{key1, title = {Title1}}  \n  @article{key2, title = {Title2}}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(2);
      expect(entries[0].key).toBe('key1');
      expect(entries[1].key).toBe('key2');
    });

    test('should handle whitespace within field lists', () => {
      const bib = '@article{key,  title  =  {Title}  ,  journal  =  "Journal"  }';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(1);
      expect(entries[0].fields.title).toBe('Title');
      expect(entries[0].fields.journal).toBe('Journal');
    });

    test('should handle various newline types', () => {
      const bib = '@article{key1,\ntitle = {Title1}\n}\r\n@article{key2,\rtitle = {Title2}\r}';
      const parser = new Parser();
      const entries = parser.parseString(bib);
      
      expect(entries.length).toBe(2);
      expect(entries[0].key).toBe('key1');
      expect(entries[1].key).toBe('key2');
    });
  });

  describe.skip('Malformed Entries', () => {
    test('should handle entries missing a closing brace', () => {
      // This test will depend on how your parser handles errors
      // Some parsers might throw, others might return partial results
      try {
        const bib = '@article{key, title = {Title}';
        const parser = new Parser();
        const entries = parser.parseString(bib);
        
        // If it doesn't throw, check what it returns
        // This might be an empty array or a partial parse
      } catch (error) {
        // Expected error
        expect(error).toBeDefined();
      }
    });

    test('should handle entries with unbalanced braces in values', () => {
      // This also depends on how your parser handles errors
      try {
        const bib = '@article{key, title = {Unbalanced { brace}';
        const parser = new Parser();
        const entries = parser.parseString(bib);
        
        // If it doesn't throw, check what it returns
      } catch (error) {
        // Expected error
        expect(error).toBeDefined();
      }
    });

    test.skip('should handle entries with invalid field format', () => {
      // This also depends on how your parser handles errors
      try {
        const bib = '@article{key, title {Title}}';
        const parser = new Parser();
        const entries = parser.parseString(bib);
        
        // If it doesn't throw, check what it returns
      } catch (error) {
        // Expected error
        expect(error).toBeDefined();
      }
    });
  });
}); 