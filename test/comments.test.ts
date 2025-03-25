import { BtMetatype } from "../src/lib/types";
import { Parser } from "../src/lib/parser";

const regular = String.raw`
% a sample "regular" entry (ie. not a @comment, @preamble, or @string

@book{abook, 
title = {A } # "Book",                   % an in-entry comment
editor = {  John Q.  Random} # junk,
publisher = {Foo Bar \& Sons}, 
year = 1922
}
`;

describe('Regular Entry', () => {
    
    test('should parse regular BibTeX entry correctly', () => {
      const parser = new Parser();
      const result = parser.parseString(regular);
      
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
    //   expect(result[0].fields.title).toBe('A Book');
      expect(result[0].fields.publisher).toBe(`Foo Bar \\& Sons`);
      expect(result[0].fields.year).toBe('1922');
    });
  });
