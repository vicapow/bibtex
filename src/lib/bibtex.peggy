{
  const BtMetatype = {
    COMMENT: 'COMMENT',
    PREAMBLE: 'PREAMBLE',
    MACRODEF: 'MACRODEF',
    REGULAR: 'REGULAR'
  };
}

// Start rule for a complete BibTeX file
BibFile
  = entries:(Entry / Comment / Junk)* { 
      return entries.filter(e => e !== null); 
    }

// Standalone comment (starts with %)
Comment
  = '%' [^\n]* ('\n' / EOF) { return null; }

// End of file
EOF
  = !.

// Anything that's not part of an entry or comment
Junk
  = [^@%]+ { return null; }

// A single BibTeX entry - unified approach
Entry
  = _ '@' type:EntryTypeWord _ '{' _ key:EntryKey? _ '}' _ {
      return {
        type: type.toLowerCase(),
        key: key || '',
        metatype: BtMetatype.REGULAR,
        fields: {}
      };
    }
  / _ '@' type:EntryTypeWord _ '(' _ key:EntryKey? _ ')' _ {
      return {
        type: type.toLowerCase(),
        key: key || '',
        metatype: BtMetatype.REGULAR,
        fields: {}
      };
    }
  / _ '@' type:EntryTypeWord _ '{' _ key:EntryKey? _ ',' _ fields:FieldList _ '}' _ {
      const entry = {
        type: type.toLowerCase(),
        key: key || '',
        metatype: BtMetatype.REGULAR,
        fields: {}
      };
      
      // Process field assignments
      for (const field of fields) {
        if (field) {
          const [name, value] = field;
          entry.fields[name.toLowerCase()] = value;
        }
      }
      
      return entry;
    }
  / _ '@' type:EntryTypeWord _ '(' _ key:EntryKey? _ ',' _ fields:FieldList _ ')' _ {
      const entry = {
        type: type.toLowerCase(),
        key: key || '',
        metatype: BtMetatype.REGULAR,
        fields: {}
      };
      
      // Process field assignments
      for (const field of fields) {
        if (field) {
          const [name, value] = field;
          entry.fields[name.toLowerCase()] = value;
        }
      }
      
      return entry;
    }
  / _ '@' s:StringType _ EntryOpen _ name:Name _ '=' _ value:Value _ EntryClose _ {
      const fieldName = name.toLowerCase();
      const entry = {
        type: "string",
        key: "",
        metatype: BtMetatype.MACRODEF,
        fields: {}
      };
      
      entry.fields[fieldName] = value;
      return entry;
    }
  / _ '@' s:StringType _ EntryOpen _ fields:StringFieldList _ EntryClose _ {
      const entry = {
        type: "string",
        key: "",
        metatype: BtMetatype.MACRODEF,
        fields: {}
      };
      
      // Process multiple macros in the same @string entry
      for (const field of fields) {
        if (field) {
          const [name, value] = field;
          const fieldName = name.toLowerCase();
          entry.fields[fieldName] = value;
        }
      }
      
      return entry;
    }
  / _ '@' p:PreambleType _ EntryOpen _ value:Value _ EntryClose _ {
      return {
        type: "preamble",
        key: "",
        metatype: BtMetatype.PREAMBLE,
        fields: { content: value }
      };
    }
  / _ '@' c:CommentType _ EntryOpen _ content:CommentContent _ EntryClose _ {
      return {
        type: "comment",
        key: "",
        metatype: BtMetatype.COMMENT,
        fields: { content: content }
      };
    }

// Delimiters for entries - supporting both braces and parentheses
EntryOpen
  = '{' / '('

EntryClose
  = '}' / ')'

// Entry key (allows more characters than Name)
EntryKey
  = chars:[a-zA-Z0-9_\-:.+/]+ { return chars.join(''); }
  / '' { return ''; }  // Empty entry key

// Entry type word
EntryTypeWord
  = chars:[a-zA-Z]+ { return chars.join('').toLowerCase(); }

// Case insensitive string matching
StringType
  = [sS][tT][rR][iI][nN][gG] { return "string"; }

PreambleType
  = [pP][rR][eE][aA][mM][bB][lL][eE] { return "preamble"; }

CommentType
  = [cC][oO][mM][mM][eE][nN][tT] { return "comment"; }

// Comment content
CommentContent
  = '{' chars:[^}]* '}' { return chars.join(''); }
  / '(' chars:[^)]* ')' { return chars.join(''); }
  / chars:[^})]* { return chars.join(''); }

// String field list for multi-field @string entries
StringFieldList
  = field:Field? rest:(_ ',' _ Field?)* {
      const fields = field ? [field] : [];
      for (const r of rest) {
        if (r[3]) fields.push(r[3]);
      }
      return fields;
    }

// Field list
FieldList
  = field:Field? rest:(_ ',' _ Field?)* {
      const fields = field ? [field] : [];
      for (const r of rest) {
        if (r[3]) fields.push(r[3]);
      }
      return fields;
    }

// Single field
Field
  = name:Name _ '=' _ value:Value { return [name, value]; }

// Value with possible concatenation
Value
  = head:SimpleValue tail:(_ '#' _ SimpleValue)* {
      if (tail.length === 0) return head;
      // For concatenation, return a node representing the operation
      const parts = [head];
      for (const t of tail) {
        parts.push(t[3]);
      }
      return ['concat', ...parts];
    }

// Basic values
SimpleValue
  = QuotedString
  / BracedString
  / NumberRange
  / Number
  / name:Name {
      // Return a node for macro reference instead of immediately resolving
      return ['macro', name];
    }

// Quoted string
QuotedString
  = '"' content:(EscapedQuote / [^"])* '"' { 
      return content.join(''); 
    }
  / '""' { return ''; }  // Handle empty string case

// Escaped quote (backslash quote)
EscapedQuote
  = '\\"' { return '"'; }

// Braced string - fixed to handle nested braces correctly
BracedString
  = '{' content:BracedContent '}' { return content; }

// Content with balanced braces - recursive definition to handle nesting
BracedContent
  = parts:(NestedBraces / SingleChar)* { return parts.join(''); }

// Handle nested braces
NestedBraces
  = '{' content:BracedContent '}' { return '{' + content + '}'; }

// Single character that's not a brace
SingleChar
  = char:[^{}] { return char; }

// Number range for page numbers etc.
NumberRange
  = first:[0-9]+ dash:'-'+ second:[0-9]+ rest:[^,}]* { 
      return first.join('') + dash.join('') + second.join('') + rest.join('');
    }

// Number
Number
  = digits:[0-9]+ { return digits.join(''); }

// Name (identifier)
// Be sure to escape the backtick character.
Name
  = chars:[a-zA-Z0-9!$&*+\-./:<>?[\]^_`|]+ { return chars.join(''); }

// Whitespace with optional comments
_
  = ([ \t\n\r] / InlineComment)* { return null; }

// Inline comment that can appear anywhere whitespace can
InlineComment
  = '%' [^\n]* ('\n' / EOF) { return null; } 