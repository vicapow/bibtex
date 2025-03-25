# @vicapow/bibtex

A simple, no-frills parser for BibTex library written in TypeScript and generated from a peggy grammar.

## Overview

This library provides a fast, reliable parser for BibTeX, the bibliography file format commonly used with LaTeX. It supports all standard BibTeX entry types, macros, string concatenation, and proper handling of BibTeX's syntactic features.

## Installation

```bash
npm install @vicapow/bibtex
```

## Usage

### Basic Parsing

```typescript
import { Parser } from '@vicapow/bibtex';

// Create a new parser instance
const parser = new Parser();

// Parse a BibTeX string
const bibtexString = `
@article{smith2020,
  author = {John Smith and Jane Doe},
  title = {A Sample Article},
  journal = {Journal of Important Research},
  year = 2020,
  volume = 123,
  number = 4,
  pages = {100--110}
}`;

const entries = parser.parseString(bibtexString);

// Access the parsed entries
console.log(entries.length);  // 1
console.log(entries[0].type); // 'article'
console.log(entries[0].key);  // 'smith2020'
console.log(entries[0].fields.title); // 'A Sample Article'
```

### Working with Macros

```typescript
import { Parser, EXPAND_MACROS } from '@vicapow/bibtex';

const parser = new Parser();

const bibtexWithMacros = `
@string{jir = "Journal of Important Research"}

@article{smith2020,
  author = {John Smith},
  title = {A Sample Article},
  journal = jir,
  year = 2020
}`;

// Parse with macro expansion
const entries = parser.parseString(bibtexWithMacros, 'input.bib', EXPAND_MACROS);

console.log(entries[1].fields.journal); // 'Journal of Important Research'

// You can also define macros programmatically
parser.defineMacro('publisher', 'Academic Press');

// And check if macros exist
console.log(parser.macroExists('publisher')); // true

// Get all defined macro names
console.log(parser.getMacroNames()); // ['jir', 'publisher']

// Clear all defined macros
parser.clearMacros();
```

### Handling Different Entry Types

The parser supports all standard BibTeX entry types, including:

```bibtex
% Regular entries (article, book, inproceedings, etc.)
% @article, @book, @inproceedings, etc.

% String definitions
% @string{macro = "value"}

% Preamble entries
// @preamble{"LaTeX preamble code"}

% Comments
// @comment{This is a comment}
```

### Entry Structure

Each parsed entry has the following structure:

```typescript
interface BtEntry {
  key: string;       // The citation key (e.g., 'smith2020')
  type: string;      // The entry type (e.g., 'article', 'book')
  metatype: string;  // Meta-type (e.g., 'REGULAR', 'COMMENT')
  fields: Record<string, string>; // Field name/value pairs
}
```

## Features

- **Macro handling**: Supports macro definition and expansion
- **String concatenation**: Supports the BibTeX `#` operator for concatenation
- **Multiple delimiters**: Handles values in braces, quotes, or without delimiters
- **Case insensitivity**: Handles field names and entry types case-insensitively
- **Nested braces**: Preserves nested braces in field values

## Limitations

- **No LaTeX parsing**: This library only parses BibTeX syntax, not LaTeX code within field values
- **No name parsing**: Does not split author names into components (first, last, etc.)
- **No field validation**: Does not validate required or optional fields for different entry types
- **Limited error recovery**: May fail on severely malformed BibTeX input
- **No BibTeX writing**: This is a parser only; it does not generate BibTeX output

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
