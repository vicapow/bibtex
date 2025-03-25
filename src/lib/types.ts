
// Parsing options
export const EXPAND_MACROS = 2;    // expand macros?

// Entry meta types
export enum BtMetatype {
  UNKNOWN = 'UNKNOWN',
  REGULAR = 'REGULAR',
  COMMENT = 'COMMENT',
  PREAMBLE = 'PREAMBLE',
  MACRODEF = 'MACRODEF'
}

// Entry type - represents a complete BibTeX entry
export interface BtEntry {
  key: string;
  type: string;
  metatype: BtMetatype;
  fields: Record<string, string>;
} 