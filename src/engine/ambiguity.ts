import { Grammar, AmbiguityResult, AmbiguityReason } from './types';
import { computeFirstFollow, checkLL1Conflicts } from './firstfollow';

export function detectAmbiguity(grammar: Grammar): AmbiguityResult {
  const reasons: AmbiguityReason[] = [];

  // 1. Check expression ambiguity (E -> E op E patterns)
  checkExpressionAmbiguity(grammar, reasons);

  // 2. Check dangling else ambiguity
  checkDanglingElse(grammar, reasons);

  // 3. Check prefix conflicts
  checkPrefixConflicts(grammar, reasons);

  // 4. Check FIRST/FOLLOW conflicts
  const ff = computeFirstFollow(grammar);
  const ll1Conflicts = checkLL1Conflicts(grammar, ff);
  for (const conflict of ll1Conflicts) {
    reasons.push({
      type: 'FIRST/FOLLOW Conflict',
      description: conflict,
      involvedRules: [],
      severity: 'medium'
    });
  }

  // 5. Check for direct self-recursion on both sides
  checkBothSideRecursion(grammar, reasons);

  // Determine status
  let status: AmbiguityResult['status'];
  let explanation: string;

  if (reasons.some(r => r.severity === 'high')) {
    status = 'ambiguous';
    explanation = 'The grammar contains patterns that are definitively ambiguous. ' +
      'Multiple parse trees can be constructed for the same input string. ' +
      'See the detailed reasons below for specific ambiguity sources.';
  } else if (reasons.length > 0) {
    status = 'possibly-ambiguous';
    explanation = 'The grammar contains patterns that may lead to ambiguity. ' +
      'While we cannot definitively prove ambiguity (the general problem is undecidable), ' +
      'the detected patterns are commonly associated with ambiguous grammars.';
  } else {
    status = 'no-ambiguity-detected';
    explanation = 'No common ambiguity patterns were detected in this grammar. ' +
      'Note: Since general CFG ambiguity detection is undecidable, this does not guarantee ' +
      'the grammar is unambiguous — only that no known heuristic patterns were found.';
  }

  return { status, reasons, explanation };
}

function checkExpressionAmbiguity(grammar: Grammar, reasons: AmbiguityReason[]) {
  for (const [head, bodies] of grammar.productions) {
    for (const body of bodies) {
      // Check for E -> E op E pattern
      if (body.length >= 3) {
        const first = body[0];
        const last = body[body.length - 1];
        if (first.type === 'nonterminal' && first.value === head &&
            last.type === 'nonterminal' && last.value === head) {
          const ops = body.slice(1, -1).map(s => s.value).join(' ');
          reasons.push({
            type: 'Expression Ambiguity',
            description: `Production "${head} -> ${head} ${ops} ${head}" is ambiguous because ` +
              `it allows both left and right association. For input like "a ${ops} b ${ops} c", ` +
              `multiple parse trees exist.`,
            involvedRules: [`${head} -> ${body.map(s => s.value).join(' ')}`],
            severity: 'high'
          });
        }
      }
    }
  }
}

function checkDanglingElse(grammar: Grammar, reasons: AmbiguityReason[]) {
  for (const [head, bodies] of grammar.productions) {
    const hasIfThenElse = bodies.some(body =>
      body.some(s => s.value === 'if') && body.some(s => s.value === 'else')
    );
    const hasIfThen = bodies.some(body =>
      body.some(s => s.value === 'if') && !body.some(s => s.value === 'else')
    );

    if (hasIfThenElse && hasIfThen) {
      reasons.push({
        type: 'Dangling Else',
        description: `Non-terminal "${head}" has both if-then and if-then-else productions, ` +
          `creating the classic dangling else ambiguity. Nested if statements can be parsed ` +
          `in multiple ways.`,
        involvedRules: bodies.map(b => `${head} -> ${b.map(s => s.value).join(' ')}`),
        severity: 'high'
      });
    }
  }
}

function checkPrefixConflicts(grammar: Grammar, reasons: AmbiguityReason[]) {
  for (const [head, bodies] of grammar.productions) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const minLen = Math.min(bodies[i].length, bodies[j].length);
        let prefixLen = 0;
        for (let k = 0; k < minLen; k++) {
          if (bodies[i][k].value === bodies[j][k].value && bodies[i][k].type === bodies[j][k].type) {
            prefixLen++;
          } else break;
        }
        if (prefixLen > 0 && (bodies[i].length !== bodies[j].length || prefixLen < minLen)) {
          reasons.push({
            type: 'Prefix Conflict',
            description: `Productions for "${head}" share a common prefix of length ${prefixLen}. ` +
              `This can cause parsing conflicts and may indicate ambiguity.`,
            involvedRules: [
              `${head} -> ${bodies[i].map(s => s.value).join(' ')}`,
              `${head} -> ${bodies[j].map(s => s.value).join(' ')}`
            ],
            severity: 'low'
          });
        }
      }
    }
  }
}

function checkBothSideRecursion(grammar: Grammar, reasons: AmbiguityReason[]) {
  for (const [head, bodies] of grammar.productions) {
    for (const body of bodies) {
      if (body.length >= 2) {
        const isLeftRec = body[0].type === 'nonterminal' && body[0].value === head;
        const isRightRec = body[body.length - 1].type === 'nonterminal' && body[body.length - 1].value === head;
        // Only flag if it's NOT E -> E op E (already caught above) but has both recursions separately
        if (isLeftRec && !isRightRec) {
          // Check if another production has right recursion
          const hasRightRec = bodies.some(b =>
            b.length >= 2 && b[b.length - 1].type === 'nonterminal' && b[b.length - 1].value === head &&
            b[0].type !== 'nonterminal'
          );
          if (hasRightRec) {
            reasons.push({
              type: 'Mixed Recursion',
              description: `Non-terminal "${head}" has both left-recursive and right-recursive productions, ` +
                `which can lead to ambiguity in certain derivations.`,
              involvedRules: bodies.map(b => `${head} -> ${b.map(s => s.value).join(' ')}`),
              severity: 'medium'
            });
          }
        }
      }
    }
  }
}
