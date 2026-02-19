import { Grammar, ParseTreeNode, Symbol } from './types';

let nodeCounter = 0;

function createNode(label: string, isTerminal: boolean): ParseTreeNode {
  return { id: `node_${nodeCounter++}`, label, isTerminal, children: [] };
}

export function generateParseTrees(
  grammar: Grammar,
  input: string[],
  maxTrees: number = 2,
  maxDepth: number = 10
): ParseTreeNode[] {
  nodeCounter = 0;
  const trees: ParseTreeNode[] = [];

  function derive(
    symbols: Symbol[],
    remaining: string[],
    depth: number
  ): { node: ParseTreeNode; rest: string[] }[] | null {
    if (depth > maxDepth) return null;
    if (symbols.length === 0) {
      if (remaining.length === 0) return [{ node: createNode('', false), rest: [] }];
      return null;
    }

    const first = symbols[0];
    const restSymbols = symbols.slice(1);

    if (first.type === 'epsilon') {
      const sub = derive(restSymbols, remaining, depth);
      if (!sub) return null;
      return sub.map(s => {
        const epNode = createNode('ε', true);
        return { node: epNode, rest: s.rest };
      });
    }

    if (first.type === 'terminal') {
      if (remaining.length === 0 || remaining[0] !== first.value) return null;
      const sub = derive(restSymbols, remaining.slice(1), depth);
      if (!sub) return null;
      return sub.map(s => {
        const tNode = createNode(first.value, true);
        return { node: tNode, rest: s.rest };
      });
    }

    // Nonterminal
    const bodies = grammar.productions.get(first.value);
    if (!bodies) return null;

    const results: { node: ParseTreeNode; rest: string[] }[] = [];

    for (const body of bodies) {
      const expanded = [...body, ...restSymbols];
      const sub = derive(expanded, remaining, depth + 1);
      if (!sub) continue;

      for (const s of sub) {
        if (results.length >= maxTrees) break;
        const ntNode = createNode(first.value, false);
        // Reconstruct children from the derivation
        ntNode.children = body.map(sym => {
          if (sym.type === 'epsilon') return createNode('ε', true);
          if (sym.type === 'terminal') return createNode(sym.value, true);
          return createNode(sym.value, false);
        });
        results.push({ node: ntNode, rest: s.rest });
      }
      if (results.length >= maxTrees) break;
    }

    return results.length > 0 ? results : null;
  }

  // Simple BFS-based tree generation
  const startBodies = grammar.productions.get(grammar.startSymbol);
  if (!startBodies) return trees;

  for (const body of startBodies) {
    if (trees.length >= maxTrees) break;
    nodeCounter = 0;
    const root = createNode(grammar.startSymbol, false);
    root.children = buildTreeFromBody(grammar, body, 0, maxDepth);
    trees.push(root);
  }

  return trees;
}

function buildTreeFromBody(grammar: Grammar, body: Symbol[], depth: number, maxDepth: number): ParseTreeNode[] {
  if (depth > maxDepth) return [];

  return body.map(sym => {
    if (sym.type === 'epsilon') {
      return createNode('ε', true);
    }
    if (sym.type === 'terminal') {
      return createNode(sym.value, true);
    }
    const node = createNode(sym.value, false);
    const bodies = grammar.productions.get(sym.value);
    if (bodies && bodies.length > 0 && depth < maxDepth) {
      // Use first production for visualization
      node.children = buildTreeFromBody(grammar, bodies[0], depth + 1, maxDepth);
    }
    return node;
  });
}

export function generateSampleStrings(grammar: Grammar, maxLength: number = 5, maxSamples: number = 5): string[] {
  const samples = new Set<string>();

  function generate(symbols: Symbol[], depth: number): string[] {
    if (depth > maxLength * 2) return [];
    if (symbols.length === 0) return [''];

    const first = symbols[0];
    const rest = symbols.slice(1);

    if (first.type === 'epsilon') {
      return generate(rest, depth);
    }

    if (first.type === 'terminal') {
      const suffixes = generate(rest, depth);
      return suffixes.map(s => first.value + (s ? ' ' + s : '')).filter(s => s.split(' ').length <= maxLength);
    }

    const bodies = grammar.productions.get(first.value);
    if (!bodies) return [];

    const results: string[] = [];
    for (const body of bodies) {
      if (results.length >= maxSamples) break;
      const expanded = [...body, ...rest];
      const strs = generate(expanded, depth + 1);
      results.push(...strs);
    }
    return results;
  }

  const startBodies = grammar.productions.get(grammar.startSymbol);
  if (!startBodies) return [];

  for (const body of startBodies) {
    const strs = generate(body, 0);
    for (const s of strs) {
      if (samples.size >= maxSamples) break;
      if (s.trim()) samples.add(s.trim());
    }
  }

  return [...samples];
}
