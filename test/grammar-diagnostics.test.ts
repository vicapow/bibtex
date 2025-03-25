/**
 * Diagnostic tests for the PEG.js grammar (Jest version)
 * These simpler tests will help identify the specific issues
 */

import { Parser } from '../src/lib/parser';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeParsedSuccessfully(): R;
    }
  }
}

describe('PEG.js Grammar Diagnostic Tests', () => {

  // Add custom matcher
  expect.extend({
    toBeParsedSuccessfully(input: string) {
      try {
        const parser = new Parser();
        const result = parser.parseString(input);
        return {
          pass: true,
          message: () => `Expected ${input} to be parsed successfully`
        };
      } catch (err) {
        return {
          pass: false,
          message: () => `Expected ${input} to be parsed successfully, but got error: ${err}`
        };
      }
    }
  });

  // Test cases
  test('Basic entry with no fields', () => {
    expect('@article{key}').toBeParsedSuccessfully();
  });

  test('Entry with single field', () => {
    expect('@article{key, title = {Title}}').toBeParsedSuccessfully();
  });

  test('String definition', () => {
    expect('@string{journal = "Journal Name"}').toBeParsedSuccessfully();
  });

  test('Preamble entry', () => {
    expect('@preamble{"Some preamble"}').toBeParsedSuccessfully();
  });

  test('Comment entry', () => {
    expect('@comment{Some comment}').toBeParsedSuccessfully();
  });

  test('Entry with whitespace', () => {
    expect('  @article{key,  title  =  {Title}  }  ').toBeParsedSuccessfully();
  });

  test('Entry with uppercase type and field', () => {
    expect('@ARTICLE{key, TITLE = {Title}}').toBeParsedSuccessfully();
  });

  test('Entry with parentheses', () => {
    expect('@article(key, title = {Title})').toBeParsedSuccessfully();
  });

  test('Value concatenation', () => {
    expect('@article{key, title = "First" # " " # "Second"}').toBeParsedSuccessfully();
  });

  test('Macro usage', () => {
    expect('@string{journal = "Journal Name"}\n@article{key, journal = journal}').toBeParsedSuccessfully();
  });
}); 