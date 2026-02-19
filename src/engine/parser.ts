import { Grammar, Symbol, ValidationError } from './types';

export function parseGrammar(input: string): { grammar: Grammar | null; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const lines = input.split('\n');
  const productions = new Map<string, Symbol[][]>();
  const nonTerminals = new Set<string>();
  const terminals = new Set<string>();
  let startSymbol = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) continue;

    // Support both spaced and compact arrow notation: "S -> ..." or "S→..."
    const arrowMatch = line.match(/^([A-Z][A-Za-z0-9'_]*)\s*(?:->|→)\s*(.+)$/) 
      || line.match(/^(\S+?)\s*(?:->|→)\s*(.+)$/);
    if (!arrowMatch) {
      errors.push({ line: i + 1, column: 1, message: `Invalid production format. Expected: NonTerminal -> Production1 | Production2` });
      continue;
    }

    const head = arrowMatch[1];
    const bodyStr = arrowMatch[2];

    if (!/^[A-Z][A-Za-z0-9'_]*$/.test(head)) {
      errors.push({ line: i + 1, column: 1, message: `Non-terminal "${head}" must start with uppercase letter` });
      continue;
    }

    nonTerminals.add(head);
    if (!startSymbol) startSymbol = head;

    const alternatives = bodyStr.split('|').map(s => s.trim());
    const bodies: Symbol[][] = [];

    for (const alt of alternatives) {
      if (!alt) {
        errors.push({ line: i + 1, column: 1, message: `Empty alternative in production for ${head}` });
        continue;
      }
      const symbols = parseSymbols(alt);
      bodies.push(symbols);
    }

    const existing = productions.get(head) || [];
    productions.set(head, [...existing, ...bodies]);
  }

  if (productions.size === 0 && errors.length === 0) {
    errors.push({ line: 1, column: 1, message: 'No productions found' });
  }

  // Classify terminals
  for (const [, bodies] of productions) {
    for (const body of bodies) {
      for (const sym of body) {
        if (sym.type === 'nonterminal') {
          nonTerminals.add(sym.value);
        } else if (sym.type === 'terminal') {
          terminals.add(sym.value);
        }
      }
    }
  }

  // Check for undefined non-terminals
  for (const nt of nonTerminals) {
    if (!productions.has(nt) && nt !== 'ε') {
      errors.push({ line: 0, column: 0, message: `Non-terminal "${nt}" is used but never defined` });
    }
  }

  if (errors.length > 0) {
    return { grammar: null, errors };
  }

  return {
    grammar: { startSymbol, nonTerminals, terminals, productions },
    errors: []
  };
}

function parseSymbols(body: string): Symbol[] {
  const trimmed = body.trim();
  
  // Check if already space-separated
  if (trimmed.includes(' ')) {
    const tokens = trimmed.split(/\s+/);
    return tokens.map(tokenToSymbol);
  }
  
  // Handle compact notation like "aS" "Sa" "(E)" by splitting on boundaries
  // between uppercase (nonterminal start) and lowercase/special chars (terminals)
  const parts = tokenizeCompact(trimmed);
  return parts.map(tokenToSymbol);
}

function tokenToSymbol(token: string): Symbol {
  if (token === 'ε' || token === 'epsilon' || token === 'eps') {
    return { type: 'epsilon' as const, value: 'ε' };
  }
  if (/^[A-Z][A-Za-z0-9'_]*$/.test(token)) {
    return { type: 'nonterminal' as const, value: token };
  }
  return { type: 'terminal' as const, value: token };
}

function tokenizeCompact(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/[A-Z]/.test(ch)) {
      // Consume a nonterminal: uppercase letter followed by optional primes/digits/underscores
      let nt = ch;
      i++;
      while (i < input.length && /[a-z0-9'_]/i.test(input[i]) && !/[A-Z]/.test(input[i])) {
        // Only continue if it's a valid nonterminal suffix (lowercase, digit, prime, underscore)
        // But stop if next char is uppercase (new nonterminal)
        if (/[a-z]/.test(input[i])) {
          // Check if this lowercase could be a terminal on its own
          // Heuristic: if the nonterminal so far is just one uppercase letter,
          // a following lowercase is likely a separate terminal
          break;
        }
        nt += input[i];
        i++;
      }
      tokens.push(nt);
    } else if (ch === 'ε') {
      tokens.push('ε');
      i++;
    } else {
      // Terminal: consume one character (or known multi-char terminals like 'id')
      // For compact notation, each lowercase letter or special char is its own terminal
      tokens.push(ch);
      i++;
    }
  }
  return tokens;
}

export function grammarToString(grammar: Grammar): string {
  const lines: string[] = [];
  // Start symbol first
  const startBodies = grammar.productions.get(grammar.startSymbol);
  if (startBodies) {
    lines.push(formatProduction(grammar.startSymbol, startBodies));
  }
  for (const [head, bodies] of grammar.productions) {
    if (head === grammar.startSymbol) continue;
    lines.push(formatProduction(head, bodies));
  }
  return lines.join('\n');
}

function formatProduction(head: string, bodies: Symbol[][]): string {
  const alts = bodies.map(body => body.map(s => s.value).join(' ')).join(' | ');
  return `${head} -> ${alts}`;
}

export function detectUnreachable(grammar: Grammar): string[] {
  const reachable = new Set<string>();
  const queue = [grammar.startSymbol];
  reachable.add(grammar.startSymbol);

  while (queue.length > 0) {
    const nt = queue.shift()!;
    const bodies = grammar.productions.get(nt) || [];
    for (const body of bodies) {
      for (const sym of body) {
        if (sym.type === 'nonterminal' && !reachable.has(sym.value)) {
          reachable.add(sym.value);
          queue.push(sym.value);
        }
      }
    }
  }

  const unreachable: string[] = [];
  for (const nt of grammar.nonTerminals) {
    if (!reachable.has(nt)) unreachable.push(nt);
  }
  return unreachable;
}
