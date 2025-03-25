import { BtEntry, EXPAND_MACROS } from './types';

// Import the pre-generated parser instead of generating at runtime
import parseAst from './generated-parser';

export class Parser {
  private macroTable: Record<string, string> = {};

  constructor() {
    // No need to generate parser at runtime
  }

  /**
   * Define a macro. used in the parser.
   */
  public defineMacro(name: string, text: string, filename?: string, line: number = 0): boolean {
    if (!name) {
      throw new Error(`Attempt to define macro with empty/null name ${filename}, ${line}`);
    }
    
    // Check if macro already exists
    if (this.macroTable[name] !== undefined) {
      throw new Error(`Overriding existing definition of macro "${name}" ${filename}, ${line}`);
    }
    
    // Add or replace the macro
    this.macroTable[name] = text || '';
    return true;
  }

  /**
   * Look up a macro. used in the parser.
   */
  public lookupMacro(name: string): string | undefined {
    if (!name) return undefined;
    return this.macroTable[name.toLowerCase()];
  }

  /**
   * Clear all macros
   */
  public clearMacros(): void {
    this.macroTable = Object.create(null);
  }

  public deleteMacro(name: string): boolean {
    if (!name) return false;
    const lowerName = name.toLowerCase();
    if (this.macroTable[lowerName] === undefined) return false;
    delete this.macroTable[lowerName];
    return true;
  }

  /**
   * Get all macro names
   */
  public getMacroNames(): string[] {
    return Object.keys(this.macroTable);
  }

  /**
   * Check if a macro exists
   */
  public macroExists(name: string): boolean {
    return this.macroTable[name.toLowerCase()] !== undefined;
  }

  /**
   * Expand macros in a string. used in the parser.
   */
  private expandMacrosInValue(text: string | any[], filename?: string, line: number = 0): string {
    if (!text) return '';
    
    // Handle concatenation node
    if (Array.isArray(text) && text[0] === 'concat') {
      const parts = text.slice(1).map((part: any) => this.expandMacrosInValue(part, filename, line));
      return parts.join('');
    }
    
    // Handle macro reference node
    if (Array.isArray(text) && text[0] === 'macro') {
      const macroName = text[1].toLowerCase();
      const macroValue = this.macroTable[macroName];
      return macroValue !== undefined ? macroValue : macroName;
    }
    
    // Simple word - check if it's a macro
    if (typeof text === 'string' && /^[a-zA-Z0-9!$&*+\-./:<>?[\]^_`|]+$/.test(text)) {
      const lowerText = text.toLowerCase();
      if (this.macroTable[lowerText] !== undefined) {
        return this.macroTable[lowerText];
      }
    }
    
    return String(text);
  }

  /**
   * Parse a BibTeX string
   */
  public parseString(content: string, filename: string = 'string input', options: number = 0): BtEntry[] {
    try {
      // Use the pre-generated parser with appropriate options
      const ast = parseAst(content, { startRule: 'BibFile' });
      
      // Process the AST into BtEntry objects
      const entries = this.processAst(ast);
      
      // Apply any additional processing
      if (options & EXPAND_MACROS) {
        // Expand macros in fields
        for (const entry of entries) {
          for (const [key, value] of Object.entries(entry.fields)) {
            entry.fields[key] = this.expandMacrosInValue(value);
          }
        }
      }
      
      return entries;
    } catch (error) {
      console.error(`Error parsing BibTeX: ${error}`);
      return [];
    }
  }

  // Process the AST to BtEntry objects
  private processAst(ast: any[]): BtEntry[] {
    if (!ast || !Array.isArray(ast)) {
      return [];
    }

    return ast.map(entry => {
      if (!entry) return null;
      
      // Handle macro definitions
      if (entry.metatype === 'MACRODEF') {
        // Process each field in the macro definition
        Object.entries(entry.fields).forEach(([name, value]) => {
          // Don't expand macros in the string definition itself, 
          // just store the raw value to avoid double expansion
          if (typeof value === 'string') {
            this.defineMacro(name, value);
          } else if (Array.isArray(value) && value[0] === 'macro') {
            this.defineMacro(name, value[1]);
          } else if (Array.isArray(value) && value[0] === 'concat') {
            // For concatenation, we need to expand macros
            const expandedValue = this.expandMacrosInValue(value);
            this.defineMacro(name, expandedValue);
          }
        });
      }
      
      // Process fields for regular entries
      if (entry.fields) {
        const processedFields: Record<string, string> = {};
        
        Object.entries(entry.fields).forEach(([name, value]) => {
          if (typeof value === 'string') {
            processedFields[name.toLowerCase()] = value;
          } else if (Array.isArray(value) && value[0] === 'concat') {
            // Handle concatenation expressions from the AST
            const expandedParts = value.slice(1).map(part => {
              if (typeof part === 'string') {
                return part;
              } else if (part[0] === 'macro') {
                return this.lookupMacro(part[1]) || part[1];
              }
              return part;
            });
            processedFields[name.toLowerCase()] = expandedParts.join('');
          } else if (Array.isArray(value) && value[0] === 'macro') {
            // For macro references, look up the value
            processedFields[name.toLowerCase()] = this.lookupMacro(value[1]) || value[1];
          }
        });
        
        entry.fields = processedFields;
      }
      
      return entry;
    }).filter(entry => entry !== null) as BtEntry[];
  }
} 