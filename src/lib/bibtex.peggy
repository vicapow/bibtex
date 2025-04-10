{
  const BtMetatype = {
    COMMENT: 'COMMENT',
    PREAMBLE: 'PREAMBLE',
    MACRODEF: 'MACRODEF',
    REGULAR: 'REGULAR'
  };
}

BibFile
  = entries:(Entry / Comment / Junk)* { 
      return entries.filter(e => e !== null); 
    }

Comment
  = '%' [^\n]* ('\n' / EOF) { return null; }

EOF
  = !.

Junk
  = [^@%]+ { return null; }

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

EntryOpen
  = '{' / '('

EntryClose
  = '}' / ')'

EntryKey
  = chars:[^ \t\n\r,@{}()]+ { return chars.join(''); }
  / '' { return ''; }

EntryTypeWord
  = chars:[^ \t\n\r,@{}()0-9]+ { return chars.join('').toLowerCase(); }

StringType
  = [sS][tT][rR][iI][nN][gG] { return "string"; }

PreambleType
  = [pP][rR][eE][aA][mM][bB][lL][eE] { return "preamble"; }

CommentType
  = [cC][oO][mM][mM][eE][nN][tT] { return "comment"; }

CommentContent
  = '{' chars:[^}]* '}' { return chars.join(''); }
  / '(' chars:[^)]* ')' { return chars.join(''); }
  / chars:[^})]* { return chars.join(''); }

StringFieldList
  = field:Field? rest:(_ ',' _ Field?)* {
      const fields = field ? [field] : [];
      for (const r of rest) {
        if (r[3]) fields.push(r[3]);
      }
      return fields;
    }

FieldList
  = field:Field? rest:(_ ',' _ Field?)* {
      const fields = field ? [field] : [];
      for (const r of rest) {
        if (r[3]) fields.push(r[3]);
      }
      return fields;
    }

Field
  = name:Name _ '=' _ value:Value { return [name, value]; }

Value
  = head:SimpleValue tail:(_ '#' _ SimpleValue)* {
      if (tail.length === 0) return head;
      const parts = [head];
      for (const t of tail) {
        parts.push(t[3]);
      }
      return ['concat', ...parts];
    }

SimpleValue
  = QuotedString
  / BracedString
  / NumberRange
  / Number
  / name:Name { return ['macro', name]; }

QuotedString
  = '"' content:(EscapedQuote / [^"])* '"' { return content.join(''); }
  / '""' { return ''; }

EscapedQuote
  = '\\"' { return '"'; }

BracedString
  = '{' content:BracedContent '}' { return content; }

BracedContent
  = parts:(NestedBraces / SingleChar)* { return parts.join(''); }

NestedBraces
  = '{' content:BracedContent '}' { return '{' + content + '}'; }

SingleChar
  = char:[^{}] { return char; }

NumberRange
  = first:[0-9]+ dash:'-'+ second:[0-9]+ rest:[^,}]* { 
      return first.join('') + dash.join('') + second.join('') + rest.join('');
    }

Number
  = digits:[0-9]+ { return digits.join(''); }

Name
  = chars:[^ \t\n\r=,@{}()]+ { return chars.join(''); }

_
  = ([ \t\n\r] / InlineComment)* { return null; }

InlineComment
  = '%' [^\n]* ('\n' / EOF) { return null; }