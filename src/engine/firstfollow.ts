import { Grammar, FirstFollowSets, Symbol } from './types';

export function computeFirstFollow(grammar: Grammar): FirstFollowSets {
  const first = new Map<string, Set<string>>();
  const follow = new Map<string, Set<string>>();

  // Initialize
  for (const nt of grammar.nonTerminals) {
    first.set(nt, new Set());
    follow.set(nt, new Set());
  }
  for (const t of grammar.terminals) {
    first.set(t, new Set([t]));
  }

  // Compute FIRST sets
  let changed = true;
  while (changed) {
    changed = false;
    for (const [head, bodies] of grammar.productions) {
      for (const body of bodies) {
        const result = computeFirstOfString(body, first);
        const headFirst = first.get(head)!;
        for (const sym of result) {
          if (!headFirst.has(sym)) {
            headFirst.add(sym);
            changed = true;
          }
        }
      }
    }
  }

  // Compute FOLLOW sets
  follow.get(grammar.startSymbol)!.add('$');
  changed = true;
  while (changed) {
    changed = false;
    for (const [head, bodies] of grammar.productions) {
      for (const body of bodies) {
        for (let i = 0; i < body.length; i++) {
          const sym = body[i];
          if (sym.type !== 'nonterminal') continue;

          const rest = body.slice(i + 1);
          const firstOfRest = computeFirstOfString(rest, first);

          const symFollow = follow.get(sym.value)!;
          for (const f of firstOfRest) {
            if (f !== 'ε' && !symFollow.has(f)) {
              symFollow.add(f);
              changed = true;
            }
          }

          if (firstOfRest.has('ε') || rest.length === 0) {
            const headFollow = follow.get(head)!;
            for (const f of headFollow) {
              if (!symFollow.has(f)) {
                symFollow.add(f);
                changed = true;
              }
            }
          }
        }
      }
    }
  }

  return { first, follow };
}

function computeFirstOfString(symbols: Symbol[], first: Map<string, Set<string>>): Set<string> {
  const result = new Set<string>();
  if (symbols.length === 0) {
    result.add('ε');
    return result;
  }

  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    if (sym.type === 'epsilon') {
      result.add('ε');
      return result;
    }
    if (sym.type === 'terminal') {
      result.add(sym.value);
      return result;
    }
    const symFirst = first.get(sym.value);
    if (!symFirst) {
      result.add(sym.value);
      return result;
    }
    for (const f of symFirst) {
      if (f !== 'ε') result.add(f);
    }
    if (!symFirst.has('ε')) return result;
    if (i === symbols.length - 1) result.add('ε');
  }

  return result;
}

export function checkLL1Conflicts(grammar: Grammar, ff: FirstFollowSets): string[] {
  const conflicts: string[] = [];

  for (const [head, bodies] of grammar.productions) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const firstI = computeFirstOfString(bodies[i], ff.first);
        const firstJ = computeFirstOfString(bodies[j], ff.first);

        // Check FIRST/FIRST conflict
        const intersection = new Set([...firstI].filter(x => firstJ.has(x) && x !== 'ε'));
        if (intersection.size > 0) {
          conflicts.push(
            `FIRST/FIRST conflict in ${head}: alternatives ${i + 1} and ${j + 1} share {${[...intersection].join(', ')}}`
          );
        }

        // Check FIRST/FOLLOW conflict
        if (firstI.has('ε')) {
          const headFollow = ff.follow.get(head) || new Set();
          const fIntersect = new Set([...firstJ].filter(x => headFollow.has(x)));
          if (fIntersect.size > 0) {
            conflicts.push(
              `FIRST/FOLLOW conflict in ${head}: alternative ${j + 1} FIRST intersects FOLLOW on {${[...fIntersect].join(', ')}}`
            );
          }
        }
      }
    }
  }

  return conflicts;
}
