/**
 * Basic parsing functionality tests
 * 
 * These tests verify the most fundamental functionality of the parser:
 * - Parsing basic entries of different types
 * - Simple field parsing
 * - Special entries (string, comment, preamble)
 * - Basic structure handling (parentheses vs braces)
 * 
 * For more specific tests, see the dedicated test files.
 */

import { Parser } from '../src/lib/parser';
import { BtMetatype } from '../src/lib/types';

describe('Basic Parsing Functionality', () => {

  describe('Entry Structure', () => {
    test('should parse entry with no fields using braces', () => {
      let parser = new Parser();
      const result = parser.parseString('@article{key123}');
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        type: 'article',
        key: 'key123',
        metatype: BtMetatype.REGULAR
      });
      expect(Object.keys(result[0].fields).length).toBe(0);
    });
    
    test('should parse entry with no fields using parentheses', () => {
      let parser = new Parser();
      const result = parser.parseString('@article(key123)');
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        type: 'article',
        key: 'key123',
        metatype: BtMetatype.REGULAR
      });
      expect(Object.keys(result[0].fields).length).toBe(0);
    });
    
    test('should parse entry with a single field', () => {
      let parser = new Parser();
      const result = parser.parseString('@article{key123, title = {Some Title}}');
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        type: 'article',
        key: 'key123',
        metatype: BtMetatype.REGULAR
      });
      expect(result[0].fields.title).toBe('Some Title');
    });
    
    test('should parse entry with multiple fields', () => {
      let parser = new Parser();
      const result = parser.parseString('@book{key123, title = {Book Title}, author = {Some Author}, year = {2023}}');
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        type: 'book',
        key: 'key123',
        metatype: BtMetatype.REGULAR
      });
      expect(result[0].fields.title).toBe('Book Title');
      expect(result[0].fields.author).toBe('Some Author');
      expect(result[0].fields.year).toBe('2023');
    });
    
    test('should handle trailing comma in fields', () => {
      let parser = new Parser();
      const result = parser.parseString('@article{key123, title = {Title},}');
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        type: 'article',
        key: 'key123',
        metatype: BtMetatype.REGULAR
      });
      expect(result[0].fields.title).toBe('Title');
    });
  });

  describe('Special Entry Types', () => {
    test('should parse string definition', () => {
      let parser = new Parser();
      const result = parser.parseString('@string{journal = "Journal Name"}');
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        type: 'string',
        metatype: BtMetatype.MACRODEF
      });
      expect(result[0].fields.journal).toBe('Journal Name');
    });
    
    test('should parse preamble entry', () => {
      let parser = new Parser();
      const result = parser.parseString('@preamble{"Some preamble"}');
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        type: 'preamble',
        metatype: BtMetatype.PREAMBLE
      });
      expect(result[0].fields.content).toBe('Some preamble');
    });
    
    test('should parse comment entry', () => {
      let parser = new Parser();
      const result = parser.parseString('@comment{Some comment}');
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        type: 'comment',
        metatype: BtMetatype.COMMENT
      });
      expect(result[0].fields.content).toBe('Some comment');
    });
  });
  
  describe('Field Values', () => {
    test('should handle quoted strings in fields', () => {
      let parser = new Parser();
      const result = parser.parseString('@article{key123, title = "Quoted Title"}');
      expect(result.length).toBe(1);
      expect(result[0].fields.title).toBe('Quoted Title');
    });
    
    test('should handle braced strings in fields', () => {
      let parser = new Parser();
      const result = parser.parseString('@article{key123, title = {Braced Title}}');
      expect(result.length).toBe(1);
      expect(result[0].fields.title).toBe('Braced Title');
    });
    
    test('should handle numeric values in fields', () => {
      let parser = new Parser();
      const result = parser.parseString('@article{key123, year = 2023}');
      expect(result.length).toBe(1);
      expect(result[0].fields.year).toBe('2023');
    });
    
    test('should handle nested braces in field values', () => {
      let parser = new Parser();
      const result = parser.parseString('@article{key123, title = {Title with {nested} braces}}');
      expect(result.length).toBe(1);
      expect(result[0].fields.title).toBe('Title with {nested} braces');
    });
  });
  
  describe('Multiple Entries', () => {
    test('should parse multiple entries', () => {
      const input = `
        @article{key1, title = {Title1}}
        @book{key2, title = {Title2}}
      `;
      let parser = new Parser();
      const result = parser.parseString(input);
      
      expect(result.length).toBe(2);
      expect(result[0]).toMatchObject({
        type: 'article',
        key: 'key1',
        metatype: BtMetatype.REGULAR
      });
      expect(result[0].fields.title).toBe('Title1');
      
      expect(result[1]).toMatchObject({
        type: 'book',
        key: 'key2',
        metatype: BtMetatype.REGULAR
      });
      expect(result[1].fields.title).toBe('Title2');
    });
  });
  
  describe('Whitespace Handling', () => {
    test('should handle whitespace in entries', () => {
      let parser = new Parser();
      const result = parser.parseString('@article{key123,   title  =  {Title with Spaces}  }');
      expect(result.length).toBe(1);
      expect(result[0].fields.title).toBe('Title with Spaces');
    });
    
    test('should handle whitespace and formatting in entries', () => {
      let parser = new Parser();
      const input = `
        @article { key123,
          title = {Multiline 
            Title},
          author = "Some Author"
        }
      `;
      const result = parser.parseString(input);
      
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        type: 'article',
        key: 'key123',
        metatype: BtMetatype.REGULAR
      });
      expect(result[0].fields.title).toBe('Multiline \n            Title');
      expect(result[0].fields.author).toBe('Some Author');
    });
  });
}); 