import { BtMetatype } from "../src/lib/types";
import { Parser } from "../src/lib/parser";

const regular = `@string{publisher = "Foo Bar \\& Sons"}`;

describe('string with quotes', () => {
    
    test('should parse regular BibTeX entry correctly', () => {
      const parser = new Parser();
      const result = parser.parseString(regular);
      
      expect(result.length).toBe(1);
      expect(result[0]).toMatchInlineSnapshot(`
{
  "fields": {
    "publisher": "Foo Bar \\& Sons",
  },
  "key": "",
  "metatype": "MACRODEF",
  "type": "string",
}
`);
    });
  });
