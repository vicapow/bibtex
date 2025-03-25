/**
 * Advanced parsing functionality tests
 * 
 * These tests verify the more complex functionality of the parser:
 * - Macro expansion
 * - String concatenation
 * - Value parsing with mixed types
 * - Combined features
 * 
 * For basic functionality tests, see basic-parsing.test.ts
 */

import { BtMetatype, EXPAND_MACROS } from '../src/lib/types';
import { Parser } from '../src/lib/parser';

describe('Advanced Parsing Functionality', () => {  
  describe('String Concatenation', () => {
    test('should handle basic string concatenation', () => {
      const parser = new Parser();
      const result = parser.parseString('@article{key123, title = "First" # " " # "Second"}');
      expect(result.length).toBe(1);
      expect(result[0].fields.title).toBe('First Second');
    });
    
    test('should concatenate values of different types', () => {
      const parser = new Parser();
      const result = parser.parseString('@article{key123, title = "First" # 123 # {Last}}');
      expect(result.length).toBe(1);
      expect(result[0].fields.title).toBe('First123Last');
    });
    
    test('should handle whitespace around # operator', () => {
      const parser = new Parser();
      const result = parser.parseString('@article{key123, title = "First"#"Second", author = "First" # "Second"}');
      expect(result.length).toBe(1);
      expect(result[0].fields.title).toBe('FirstSecond');
      expect(result[0].fields.author).toBe('FirstSecond');
    });
  });
  
  describe('Macro Definition and Expansion', () => {
    test('should define and use macros in the same file', () => {
      const parser = new Parser();
      const input = `
        @string{journal = "Journal of Testing"}
        @article{key123, journal = journal, title = {Title}}
      `;
      const result = parser.parseString(input, 'string input', EXPAND_MACROS);
      expect(result.length).toBe(2);
      expect(result[0]).toMatchObject({
        type: 'string',
        metatype: BtMetatype.MACRODEF
      });
      expect(result[1]).toMatchObject({
        type: 'article',
        key: 'key123',
        metatype: BtMetatype.REGULAR
      });
      // The parser's macro expansion behavior produces this result
      expect(result[1].fields.journal).toBe('Journal of Testing');
      expect(result[1].fields.title).toBe('Title');
    });
    
    test('should use predefined macros', () => {
      const parser = new Parser();
      parser.defineMacro('journal', 'Journal of Science');
      const input = '@article{key123, journal = journal, title = {Title}}';
      const result = parser.parseString(input, 'string input', EXPAND_MACROS);
      expect(result.length).toBe(1);
      expect(result[0].fields.journal).toBe('Journal of Science');
    });
    
    test('should handle complex macro expansion with concatenation', () => {
      const input = `
        @string{first = "First"}
        @string{second = "Second"}
        @article{key123, title = first # " " # second}
      `;
      const parser = new Parser();
      const result = parser.parseString(input, 'string input', EXPAND_MACROS);
      expect(result.length).toBe(3);
      expect(result[2].fields.title).toBe('First Second');
    });
  });
  
  describe('Complex Mixed Content', () => {
    test('should parse a mixture of entry types', () => {
      const input = `
        @string{publisher = "Test Publisher"}
        @preamble{"Some preamble"}
        @comment{Some comment}
        @article{key1, title = {Article Title}}
        @book{key2, title = {Book Title}, publisher = publisher}
      `;
      const parser = new Parser();
      const result = parser.parseString(input, 'string input', EXPAND_MACROS);
      
      expect(result.length).toBe(5);
      
      // String definition
      expect(result[0]).toMatchObject({
        type: 'string',
        metatype: BtMetatype.MACRODEF
      });
      expect(result[0].fields.publisher).toBe('Test Publisher');
      
      // Preamble
      expect(result[1]).toMatchObject({
        type: 'preamble',
        metatype: BtMetatype.PREAMBLE
      });
      expect(result[1].fields.content).toBe('Some preamble');
      
      // Comment
      expect(result[2]).toMatchObject({
        type: 'comment',
        metatype: BtMetatype.COMMENT
      });
      expect(result[2].fields.content).toBe('Some comment');
      
      // Article
      expect(result[3]).toMatchObject({
        type: 'article',
        key: 'key1',
        metatype: BtMetatype.REGULAR
      });
      expect(result[3].fields.title).toBe('Article Title');
      
      // Book with expanded macro
      expect(result[4]).toMatchObject({
        type: 'book',
        key: 'key2',
        metatype: BtMetatype.REGULAR
      });
      expect(result[4].fields.title).toBe('Book Title');
      // The parser's macro expansion behavior produces this result
      expect(result[4].fields.publisher).toBe('Test Publisher');
    });
    
    test('should handle complex inputs with nested braces and concatenation', () => {
      const input = `
        @string{prefix = "The "}
        @article{complex,
          title = prefix # {Journal of {Complex} Parsing},
          author = {Smith, John},
          year = 2023,
          note = {With some {nested} braces andsymbols}
        }
      `;
      const parser = new Parser();
      const result = parser.parseString(input, 'string input', EXPAND_MACROS);
      expect(result.length).toBe(2);
      expect(result[1].type).toBe('article');
      expect(result[1].fields.title).toBe('The Journal of {Complex} Parsing');
      expect(result[1].fields.note).toBe('With some {nested} braces andsymbols');
    });
  });
}); 