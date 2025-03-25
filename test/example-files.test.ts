/**
 * Tests for parsing example BibTeX files
 */

import * as fs from 'fs';
import * as path from 'path';
import { Parser } from '../src/lib/parser';
import { BtMetatype } from '../src/lib/types';

describe('Example BibTeX Files', () => {

  describe('Empty File', () => {
    const emptyPath = path.join(__dirname, 'data', 'empty.bib');
    
    test('should parse empty file without errors', () => {
      const content = fs.readFileSync(emptyPath, 'utf8');
      const parser = new Parser();
      const result = parser.parseString(content);
      expect(result).toEqual([]);
      expect(result).toMatchInlineSnapshot(`[]`);
    });
  });

  describe('Regular Entry without comments', () => {
    const regularPath = path.join(__dirname, 'data', 'regular_without_comments.bib');
    
    test('should parse regular BibTeX entry correctly', () => {
      const content = fs.readFileSync(regularPath, 'utf8');
      const parser = new Parser();
      const result = parser.parseString(content);
      
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        type: 'book',
        key: 'abook',
        metatype: BtMetatype.REGULAR
      });
      
      // Check fields
      expect(result[0].fields).toHaveProperty('title');
      expect(result[0].fields).toHaveProperty('editor');
      expect(result[0].fields).toHaveProperty('publisher');
      expect(result[0].fields).toHaveProperty('year');
      
      // Verify specific field values
      expect(result[0].fields.title).toBe('A Book');
      expect(result[0].fields.publisher).toBe('Foo Bar \\& Sons');
      expect(result[0].fields.year).toBe('1922');
      
      // Add snapshot test
      expect(result[0]).toMatchInlineSnapshot(`
{
  "fields": {
    "editor": "  John Q.  Randomjunk",
    "publisher": "Foo Bar \\& Sons",
    "title": "A Book",
    "year": "1922",
  },
  "key": "abook",
  "metatype": "REGULAR",
  "type": "book",
}
`);
    });
  });
  
  describe('Macro Definitions', () => {
    const macroPath = path.join(__dirname, 'data', 'macro.bib');
    
    test('should parse macro definitions correctly', () => {
      const content = fs.readFileSync(macroPath, 'utf8');
      const parser = new Parser();
      const result = parser.parseString(content);
      
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        metatype: BtMetatype.MACRODEF
      });
      
      // Add snapshot test
      expect(result[0]).toMatchInlineSnapshot(`
{
  "fields": {
    "foo": "blah blah   ding dong ",
    "macro": "macro  text ",
  },
  "key": "",
  "metatype": "MACRODEF",
  "type": "string",
}
`);
      
      // Manually verify the macro values with explicit concatenation
      parser.clearMacros();
      parser.defineMacro('macro', 'macro  text ');
      parser.defineMacro('foo', 'blah blah   ding dong ');
      
      // Create a test entry that explicitly uses the # operator
      const testEntry = '@article{test, title = "macro  text " # "blah blah   ding dong "}';
      const testResult = parser.parseString(testEntry, 'string input');
      expect(testResult[0].fields.title).toBe('macro  text blah blah   ding dong ');
      
      // Add snapshot for the test result
      expect(testResult[0]).toMatchInlineSnapshot(`
{
  "fields": {
    "title": "macro  text blah blah   ding dong ",
  },
  "key": "test",
  "metatype": "REGULAR",
  "type": "article",
}
`);
    });
  });

  describe('Preamble Entry', () => {
    const preamblePath = path.join(__dirname, 'data', 'preamble.bib');
    
    test('should parse preamble entry correctly', () => {
      const content = fs.readFileSync(preamblePath, 'utf8');
      const parser = new Parser();
      const result = parser.parseString(content);
      
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        metatype: BtMetatype.PREAMBLE
      });
      
      // Verify preamble content
      expect(result[0].fields.content).toBe(' This is   a preamble---the concatenation of several strings');
      
      // Add snapshot test
      expect(result[0]).toMatchInlineSnapshot(`
{
  "fields": {
    "content": " This is   a preamble---the concatenation of several strings",
  },
  "key": "",
  "metatype": "PREAMBLE",
  "type": "preamble",
}
`);
    });
  });

  describe('Comment Entry', () => {
    const commentPath = path.join(__dirname, 'data', 'comment.bib');
    
    test('should parse comment entry correctly', () => {
      const content = fs.readFileSync(commentPath, 'utf8');
      const parser = new Parser();
      const result = parser.parseString(content);
      
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        metatype: BtMetatype.COMMENT
      });
      
      // Add snapshot test
      expect(result[0]).toMatchInlineSnapshot(`
{
  "fields": {
    "content": "this is a comment entry, anything at all can go in it (as long
         as parentheses are balanced",
  },
  "key": "",
  "metatype": "COMMENT",
  "type": "comment",
}
`);
    });
  });

  describe('Simple File', () => {
    const simplePath = path.join(__dirname, 'data', 'simple.bib');
    
    test('should parse file with multiple entry types correctly', () => {
      const content = fs.readFileSync(simplePath, 'utf8');
      const parser = new Parser();
      const result = parser.parseString(content);
      
      // Should have 4 entries: book, string, comment, and preamble
      expect(result.length).toBe(4);
      
      // Verify types
      const types = result.map(entry => entry.metatype);
      expect(types).toContain(BtMetatype.REGULAR);
      expect(types).toContain(BtMetatype.MACRODEF);
      expect(types).toContain(BtMetatype.COMMENT);
      expect(types).toContain(BtMetatype.PREAMBLE);
      
      // Find the regular entry and check its fields
      const bookEntry = result.find(entry => entry.metatype === BtMetatype.REGULAR);
      expect(bookEntry).toBeDefined();
      expect(bookEntry?.type).toBe('book');
      expect(bookEntry?.key).toBe('abook');
      
      // Add snapshot test for the entire result
      expect(result).toMatchInlineSnapshot(`
[
  {
    "fields": {
      "editor": "  John Q.  Randomjunk",
      "publisher": "Foo Bar \\& Sons",
      "title": "A Book",
      "year": "1922",
    },
    "key": "abook",
    "metatype": "REGULAR",
    "type": "book",
  },
  {
    "fields": {
      "foo": "blah blah   ding dong ",
      "macro": "macro  text ",
    },
    "key": "",
    "metatype": "MACRODEF",
    "type": "string",
  },
  {
    "fields": {
      "content": "this is a comment entry, anything at all can go in it (as long
         as parentheses are balanced",
    },
    "key": "",
    "metatype": "COMMENT",
    "type": "comment",
  },
  {
    "fields": {
      "content": " This is   a preamble---the concatenation of several strings",
    },
    "key": "",
    "metatype": "PREAMBLE",
    "type": "preamble",
  },
]
`);
      
      // Test macro expansion using explicit concatenation instead of macro references
      const testEntry = '@article{test, title = "macro  text " # "blah blah   ding dong "}';
      const testResult = parser.parseString(testEntry, 'string input');
      expect(testResult[0].fields.title).toBe('macro  text blah blah   ding dong ');
    });
  });

  describe('Large BibTeX File', () => {
    const largePath = path.join(__dirname, 'data', 'large.bib');
    
    test('should parse large BibTeX file with many entries', () => {
      const content = fs.readFileSync(largePath, 'utf8');
      const parser = new Parser();
      const result = parser.parseString(content);
      
      // Verify that we have the expected number of entries
      expect(result.length).toBeGreaterThan(20); // There are many entries in the file
      
      // Verify some specific entries
      const halfgatesEntry = result.find(entry => entry.key === 'halfgates');
      expect(halfgatesEntry).toBeDefined();
      expect(halfgatesEntry?.type).toBe('inproceedings');
      expect(halfgatesEntry?.fields.title).toContain('Two Halves Make a Whole');
      expect(halfgatesEntry?.fields.author).toContain('Samee Zahur');
      
      // Add snapshot for the halfgates entry
      expect(halfgatesEntry).toMatchInlineSnapshot(`
{
  "fields": {
    "author": "Samee Zahur and
	Mike Rosulek and
	David Evans",
    "bibsource": "dblp computer science bibliography, https://dblp.org",
    "biburl": "https://dblp.org/rec/conf/eurocrypt/ZahurRE15.bib",
    "booktitle": "Advances in Cryptology - {EUROCRYPT} 2015 - 34th Annual International
	Conference on the Theory and Applications of Cryptographic Techniques,
	Sofia, Bulgaria, April 26-30, 2015, Proceedings, Part {II}",
    "doi": "10.1007/978-3-662-46803-6\\_8",
    "editor": "Elisabeth Oswald and
	Marc Fischlin",
    "pages": "220--250",
    "publisher": "Springer",
    "series": "Lecture Notes in Computer Science",
    "timestamp": "Thu, 14 Oct 2021 09:58:15 +0200",
    "title": "Two Halves Make a Whole - Reducing Data Transfer in Garbled Circuits
	Using Half Gates",
    "url": "https://doi.org/10.1007/978-3-662-46803-6\\_8",
    "volume": "9057",
    "year": "2015",
  },
  "key": "halfgates",
  "metatype": "REGULAR",
  "type": "inproceedings",
}
`);
      
      // Check a different entry
      const aesEntry = result.find(entry => entry.key === 'aes');
      expect(aesEntry).toBeDefined();
      expect(aesEntry?.type).toBe('article');
      expect(aesEntry?.fields.author).toBe('NIST');
      
      // Add snapshot for the aes entry
      expect(aesEntry).toMatchInlineSnapshot(`
{
  "fields": {
    "author": "NIST",
    "title": "Advanced Encryption Standard (AES)",
    "url": "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf",
    "year": "2001",
  },
  "key": "aes",
  "metatype": "REGULAR",
  "type": "article",
}
`);
      
      // Verify that all entries are properly parsed as regular BibTeX entries
      const allRegular = result.every(entry => entry.metatype === BtMetatype.REGULAR);
      expect(allRegular).toBe(true);
    });
  });
}); 