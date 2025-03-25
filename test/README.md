# Tests

This directory contains the test suite for the library, which provides BibTeX parsing functionality.

## Test Organization

The tests are organized according to the aspects of the parser being tested:

### Core Tests

- **parser.test.ts**: Primary integration tests for the parser, testing complex BibTeX input with multiple entry types and features combined.

### Feature-Specific Tests

- **basic-parsing.test.ts**: Tests for fundamental parsing functionality, including basic entries, field parsing, and structure handling.
- **advanced-parsing.test.ts**: Tests for more complex functionality like macro expansion, string concatenation, and combined features.
- **entry-types.test.ts**: Tests specifically for parsing different entry types (article, book, etc.).
- **entry-key.test.ts**: Tests specifically for entry key parsing with various formats and characters.
- **field-parsing.test.ts**: Tests for field name and value parsing with different delimiters and handling.
- **value-parsing.test.ts**: Tests for complex value parsing including macros, concatenation, and special characters.
- **grammar-diagnostics.test.ts**: Tests to validate grammar parsing behavior in specific edge cases.

### Test Files

- **sample.bib**: A sample BibTeX file used for testing.
- **simple-bibtex.pegjs**: A simplified PEG.js grammar for testing.

## Running Tests

To run all tests:

```bash
npm run test
```

To run a specific test file:

```bash
npm run test basic-parsing
```

## Test Structure

Each test file follows a similar structure:

1. Library initialization and cleanup
2. Test group organization by feature or behavior
3. Specific test cases that validate expected behavior

Most tests use the `parseString` function to test parsing BibTeX content and then validate the resulting structure. 