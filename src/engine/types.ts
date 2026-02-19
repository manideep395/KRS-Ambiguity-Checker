export interface Symbol {
  type: 'terminal' | 'nonterminal' | 'epsilon';
  value: string;
}

export interface Production {
  head: string;
  body: Symbol[][];
}

export interface Grammar {
  startSymbol: string;
  nonTerminals: Set<string>;
  terminals: Set<string>;
  productions: Map<string, Symbol[][]>;
}

export type AmbiguityStatus = 'ambiguous' | 'possibly-ambiguous' | 'no-ambiguity-detected';

export interface AmbiguityReason {
  type: string;
  description: string;
  involvedRules: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface AmbiguityResult {
  status: AmbiguityStatus;
  reasons: AmbiguityReason[];
  explanation: string;
}

export interface TransformationStep {
  name: string;
  description: string;
  before: string;
  after: string;
}

export interface TransformationResult {
  success: boolean;
  grammar: Grammar | null;
  steps: TransformationStep[];
  explanation: string;
}

export interface FirstFollowSets {
  first: Map<string, Set<string>>;
  follow: Map<string, Set<string>>;
}

export interface ParseTreeNode {
  id: string;
  label: string;
  isTerminal: boolean;
  children: ParseTreeNode[];
}

export interface ValidationError {
  line: number;
  column: number;
  message: string;
}
