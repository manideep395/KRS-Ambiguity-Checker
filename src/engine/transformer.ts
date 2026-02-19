import { Grammar, Symbol, TransformationResult, TransformationStep } from './types';
import { grammarToString } from './parser';

export function transformGrammar(grammar: Grammar): TransformationResult {
  const steps: TransformationStep[] = [];
  let current = cloneGrammar(grammar);
  let modified = false;

  // 1. Try operator precedence restructuring
  const precResult = applyOperatorPrecedence(current);
  if (precResult.changed) {
    steps.push({
      name: 'Operator Precedence & Associativity',
      description: 'Restructured grammar to enforce operator precedence and left associativity by introducing new non-terminals for each precedence level.',
      before: grammarToString(current),
      after: grammarToString(precResult.grammar)
    });
    current = precResult.grammar;
    modified = true;
  }

  // 2. Eliminate left recursion
  const lrResult = eliminateLeftRecursion(current);
  if (lrResult.changed) {
    steps.push({
      name: 'Left Recursion Elimination',
      description: 'Eliminated direct left recursion by introducing new non-terminals with right-recursive epsilon productions.',
      before: grammarToString(current),
      after: grammarToString(lrResult.grammar)
    });
    current = lrResult.grammar;
    modified = true;
  }

  // 3. Left factoring
  const lfResult = leftFactor(current);
  if (lfResult.changed) {
    steps.push({
      name: 'Left Factoring',
      description: 'Factored common prefixes into shared non-terminals to eliminate prefix conflicts.',
      before: grammarToString(current),
      after: grammarToString(lfResult.grammar)
    });
    current = lfResult.grammar;
    modified = true;
  }

  // 4. Dangling else resolution
  const deResult = resolveDanglingElse(current);
  if (deResult.changed) {
    steps.push({
      name: 'Dangling Else Resolution',
      description: 'Resolved dangling else by separating matched and unmatched statement non-terminals.',
      before: grammarToString(current),
      after: grammarToString(deResult.grammar)
    });
    current = deResult.grammar;
    modified = true;
  }

  if (!modified) {
    return {
      success: false,
      grammar: current,
      steps: [],
      explanation: 'No applicable transformations were found. The grammar may be inherently ambiguous, ' +
        'or it may require manual restructuring that is beyond automated heuristic transformation.'
    };
  }

  return {
    success: true,
    grammar: current,
    steps,
    explanation: `Applied ${steps.length} transformation(s) to reduce ambiguity. ` +
      'Review the converted grammar to verify language preservation.'
  };
}

function applyOperatorPrecedence(grammar: Grammar): { grammar: Grammar; changed: boolean } {
  let changed = false;
  const newProductions = new Map(grammar.productions);
  const newNonTerminals = new Set(grammar.nonTerminals);

  for (const [head, bodies] of grammar.productions) {
    // Find E -> E op E patterns with multiple operators
    const opPatterns: { op: string; body: Symbol[] }[] = [];
    const nonOpBodies: Symbol[][] = [];

    for (const body of bodies) {
      if (body.length === 3 &&
          body[0].type === 'nonterminal' && body[0].value === head &&
          body[2].type === 'nonterminal' && body[2].value === head &&
          body[1].type === 'terminal') {
        opPatterns.push({ op: body[1].value, body });
      } else {
        nonOpBodies.push(body);
      }
    }

    if (opPatterns.length >= 2) {
      changed = true;
      // Assign precedence: *, / higher than +, -
      const highPrec = opPatterns.filter(p => ['*', '/', '%'].includes(p.op));
      const lowPrec = opPatterns.filter(p => !['*', '/', '%'].includes(p.op));

      if (highPrec.length > 0 && lowPrec.length > 0) {
        const termName = head + "T"; // Term
        const factName = head + "F"; // Factor
        newNonTerminals.add(termName);
        newNonTerminals.add(factName);

        // E -> E + T | T  (low precedence)
        const eBodies: Symbol[][] = lowPrec.map(p => [
          { type: 'nonterminal', value: head },
          { type: 'terminal', value: p.op },
          { type: 'nonterminal', value: termName }
        ]);
        eBodies.push([{ type: 'nonterminal', value: termName }]);

        // T -> T * F | F  (high precedence)
        const tBodies: Symbol[][] = highPrec.map(p => [
          { type: 'nonterminal', value: termName },
          { type: 'terminal', value: p.op },
          { type: 'nonterminal', value: factName }
        ]);
        tBodies.push([{ type: 'nonterminal', value: factName }]);

        // F -> base cases
        const fBodies: Symbol[][] = nonOpBodies.map(body =>
          body.map(s => s.type === 'nonterminal' && s.value === head
            ? { ...s, value: factName } : s)
        );
        if (fBodies.length === 0) {
          fBodies.push([{ type: 'terminal', value: 'id' }]);
        }

        newProductions.set(head, eBodies);
        newProductions.set(termName, tBodies);
        newProductions.set(factName, fBodies);
      }
    }
  }

  return {
    grammar: { ...grammar, productions: newProductions, nonTerminals: newNonTerminals },
    changed
  };
}

function eliminateLeftRecursion(grammar: Grammar): { grammar: Grammar; changed: boolean } {
  let changed = false;
  const newProductions = new Map(grammar.productions);
  const newNonTerminals = new Set(grammar.nonTerminals);

  for (const [head, bodies] of grammar.productions) {
    const leftRec: Symbol[][] = [];
    const nonLeftRec: Symbol[][] = [];

    for (const body of bodies) {
      if (body.length > 0 && body[0].type === 'nonterminal' && body[0].value === head) {
        leftRec.push(body.slice(1));
      } else {
        nonLeftRec.push(body);
      }
    }

    if (leftRec.length > 0 && nonLeftRec.length > 0) {
      changed = true;
      const primeName = head + "'";
      newNonTerminals.add(primeName);

      // A -> βA' for each non-left-recursive alternative β
      const newBodies = nonLeftRec.map(body => [
        ...body,
        { type: 'nonterminal' as const, value: primeName }
      ]);

      // A' -> αA' | ε for each left-recursive tail α
      const primeBodies: Symbol[][] = leftRec.map(tail => [
        ...tail,
        { type: 'nonterminal' as const, value: primeName }
      ]);
      primeBodies.push([{ type: 'epsilon' as const, value: 'ε' }]);

      newProductions.set(head, newBodies);
      newProductions.set(primeName, primeBodies);
    }
  }

  return {
    grammar: { ...grammar, productions: newProductions, nonTerminals: newNonTerminals },
    changed
  };
}

function leftFactor(grammar: Grammar): { grammar: Grammar; changed: boolean } {
  let changed = false;
  const newProductions = new Map(grammar.productions);
  const newNonTerminals = new Set(grammar.nonTerminals);
  let counter = 1;

  for (const [head, bodies] of grammar.productions) {
    if (bodies.length < 2) continue;

    // Group by first symbol
    const groups = new Map<string, Symbol[][]>();
    for (const body of bodies) {
      if (body.length === 0) continue;
      const key = `${body[0].type}:${body[0].value}`;
      const group = groups.get(key) || [];
      group.push(body);
      groups.set(key, group);
    }

    let needsFactoring = false;
    for (const [, group] of groups) {
      if (group.length > 1) { needsFactoring = true; break; }
    }

    if (!needsFactoring) continue;
    changed = true;

    const newBodies: Symbol[][] = [];
    for (const [, group] of groups) {
      if (group.length === 1) {
        newBodies.push(group[0]);
      } else {
        // Find common prefix length
        let prefixLen = 0;
        const minLen = Math.min(...group.map(b => b.length));
        for (let k = 0; k < minLen; k++) {
          const first = group[0][k];
          if (group.every(b => b[k].value === first.value && b[k].type === first.type)) {
            prefixLen++;
          } else break;
        }

        const newNT = head + counter++;
        newNonTerminals.add(newNT);

        const prefix = group[0].slice(0, prefixLen);
        newBodies.push([...prefix, { type: 'nonterminal', value: newNT }]);

        const suffixes: Symbol[][] = group.map(b => {
          const rest = b.slice(prefixLen);
          return rest.length > 0 ? rest : [{ type: 'epsilon' as const, value: 'ε' }];
        });
        newProductions.set(newNT, suffixes);
      }
    }

    newProductions.set(head, newBodies);
  }

  return {
    grammar: { ...grammar, productions: newProductions, nonTerminals: newNonTerminals },
    changed
  };
}

function resolveDanglingElse(grammar: Grammar): { grammar: Grammar; changed: boolean } {
  let changed = false;
  const newProductions = new Map(grammar.productions);
  const newNonTerminals = new Set(grammar.nonTerminals);

  for (const [head, bodies] of grammar.productions) {
    const hasIfThenElse = bodies.some(body =>
      body.some(s => s.value === 'if') && body.some(s => s.value === 'else')
    );
    const hasIfThen = bodies.some(body =>
      body.some(s => s.value === 'if') && !body.some(s => s.value === 'else')
    );

    if (hasIfThenElse && hasIfThen) {
      changed = true;
      const matchedNT = head + "M";
      const unmatchedNT = head + "U";
      newNonTerminals.add(matchedNT);
      newNonTerminals.add(unmatchedNT);

      // Get non-if bodies (base cases)
      const baseBodies = bodies.filter(b => !b.some(s => s.value === 'if'));

      // S -> M | U
      newProductions.set(head, [
        [{ type: 'nonterminal', value: matchedNT }],
        [{ type: 'nonterminal', value: unmatchedNT }]
      ]);

      // Matched: if cond then M else M | base
      const matchedBodies: Symbol[][] = [
        ...baseBodies,
        [
          { type: 'terminal', value: 'if' },
          { type: 'terminal', value: 'cond' },
          { type: 'terminal', value: 'then' },
          { type: 'nonterminal', value: matchedNT },
          { type: 'terminal', value: 'else' },
          { type: 'nonterminal', value: matchedNT }
        ]
      ];

      // Unmatched: if cond then S | if cond then M else U
      const unmatchedBodies: Symbol[][] = [
        [
          { type: 'terminal', value: 'if' },
          { type: 'terminal', value: 'cond' },
          { type: 'terminal', value: 'then' },
          { type: 'nonterminal', value: head }
        ],
        [
          { type: 'terminal', value: 'if' },
          { type: 'terminal', value: 'cond' },
          { type: 'terminal', value: 'then' },
          { type: 'nonterminal', value: matchedNT },
          { type: 'terminal', value: 'else' },
          { type: 'nonterminal', value: unmatchedNT }
        ]
      ];

      newProductions.set(matchedNT, matchedBodies);
      newProductions.set(unmatchedNT, unmatchedBodies);
    }
  }

  return {
    grammar: { ...grammar, productions: newProductions, nonTerminals: newNonTerminals },
    changed
  };
}

function cloneGrammar(grammar: Grammar): Grammar {
  const newProductions = new Map<string, Symbol[][]>();
  for (const [key, bodies] of grammar.productions) {
    newProductions.set(key, bodies.map(body => body.map(s => ({ ...s }))));
  }
  return {
    startSymbol: grammar.startSymbol,
    nonTerminals: new Set(grammar.nonTerminals),
    terminals: new Set(grammar.terminals),
    productions: newProductions
  };
}
