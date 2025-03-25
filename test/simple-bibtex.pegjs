/**
 * Simplified BibTeX grammar for testing
 */

{
  // Store macros
  const macros = {};

  // Define a macro
  function defineMacro(name, value) {
    macros[name.toLowerCase()] = value;
  }

  // Look up a macro
  function lookupMacro(name) {
    return macros[name.toLowerCase()];
  }
}

// Start rule - a BibTeX database
BibFile
  = entries:Entry* { return entries.filter(e => e !== null); }

// Entry types
Entry
  = _ '@' type:EntryType _ open:OpenDelim _ contents:EntryContents _ close:CloseDelim _ {
      return contents;
    }
  / _ Junk { return null; }

// Junk between entries
Junk
  = [^@]+ 

// Entry type
EntryType
  = chars:[a-zA-Z]+ { return chars.join('').toLowerCase(); }

// Opening delimiter
OpenDelim
  = '{' / '('

// Closing delimiter
CloseDelim
  = '}' / ')'

// Entry contents based on type
EntryContents
  = type:"string" _ fields:FieldList {
      const entry = {
        type: "string",
        key: "",
        metatype: "MACRODEF",
        fields: {}
      };
      
      // Process field assignments
      for (const field of fields) {
        if (field) {
          const [name, value] = field;
          entry.fields[name.toLowerCase()] = value;
          defineMacro(name, value);
        }
      }
      
      return entry;
    }
  / type:"preamble" _ value:Value {
      return {
        type: "preamble",
        key: "",
        metatype: "PREAMBLE",
        fields: { content: value }
      };
    }
  / type:"comment" _ content:BracedContent {
      return {
        type: "comment",
        key: "",
        metatype: "COMMENT",
        fields: { content }
      };
    }
  / type:Name _ key:(Name / Number) _ ',' _ fields:FieldList {
      const entry = {
        type: type.toLowerCase(),
        key: key,
        metatype: "REGULAR",
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
  / type:Name _ key:(Name / Number) {
      return {
        type: type.toLowerCase(),
        key: key,
        metatype: "REGULAR",
        fields: {}
      };
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

// Value (possibly concatenated)
Value
  = first:SimpleValue rest:(_ '#' _ SimpleValue)* {
      if (rest.length === 0) return first;
      return [first].concat(rest.map(r => r[3])).join('');
    }

// Simple value types
SimpleValue
  = QuotedString
  / BracedString
  / Number
  / name:Name {
      const value = lookupMacro(name);
      return value !== undefined ? value : name;
    }

// Quoted string
QuotedString
  = '"' chars:[^"]* '"' { return chars.join(''); }

// Braced string
BracedString
  = '{' content:BracedContent '}' { return content; }

// Braced content (handles nested braces)
BracedContent
  = chars:BracedChar* { return chars.join(''); }

BracedChar
  = [^{}]
  / '{' content:BracedContent '}' { return '{' + content + '}'; }

// Name (entry key, field name, or macro name)
Name
  = chars:[a-zA-Z0-9_\-:.+/]+ { return chars.join(''); }

// Number
Number
  = digits:[0-9]+ { return digits.join(''); }

// Whitespace
_
  = [ \t\r\n]* 