import React from 'react';
import { AmbiguityResult, TransformationResult } from '@/engine/types';
import { motion } from 'framer-motion';
import { BookOpen, AlertTriangle, Lightbulb, GraduationCap, Wrench, CheckCircle2, XCircle, Info } from 'lucide-react';

interface ExplanationTabProps {
  ambiguityResult: AmbiguityResult | null;
  transformResult: TransformationResult | null;
}

const ExplanationTab: React.FC<ExplanationTabProps> = ({ ambiguityResult, transformResult }) => {
  if (!ambiguityResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <BookOpen className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm">Run analysis to see step-by-step explanations.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 space-y-6 overflow-y-auto h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <BookOpen className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Step-by-Step Explanation</h2>
          <p className="text-xs text-muted-foreground">Detailed reasoning behind the analysis</p>
        </div>
      </div>

      {/* Section 1: Ambiguity Analysis */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
          <h3 className="text-sm font-semibold text-foreground">Ambiguity Analysis</h3>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-foreground leading-relaxed font-medium">Summary</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{ambiguityResult.explanation}</p>
            </div>
          </div>
        </div>

        {ambiguityResult.reasons.length > 0 && (
          <div className="space-y-3 ml-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detected Issues</p>
            {ambiguityResult.reasons.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    reason.severity === 'high' ? 'badge-ambiguous' :
                    reason.severity === 'medium' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {reason.severity === 'high' ? '⚠ High' : reason.severity === 'medium' ? '⚡ Medium' : 'ℹ Low'}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{reason.type}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>

                {/* Detailed academic explanation per type */}
                <div className="bg-muted/50 rounded-md p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-warning" />
                    <span className="text-xs font-semibold text-foreground">Why this matters</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {getDetailedExplanation(reason.type)}
                  </p>
                </div>

                {reason.involvedRules.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Affected Productions:</p>
                    {reason.involvedRules.map((rule, j) => (
                      <code key={j} className="block text-xs font-mono text-primary bg-primary/8 px-2.5 py-1.5 rounded border border-primary/15">
                        {rule}
                      </code>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Transformation Resolution */}
      {transformResult && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
            <h3 className="text-sm font-semibold text-foreground">Transformation Resolution</h3>
          </div>

          <div className={`border rounded-lg p-4 space-y-2 ${
            transformResult.success
              ? 'bg-success/5 border-success/20'
              : 'bg-destructive/5 border-destructive/20'
          }`}>
            <div className="flex items-start gap-2.5">
              {transformResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {transformResult.success ? 'Transformation Successful' : 'Transformation Not Available'}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{transformResult.explanation}</p>
              </div>
            </div>
          </div>

          {transformResult.steps.length > 0 && (
            <div className="space-y-3 ml-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applied Steps</p>
              {transformResult.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-success/15 text-success text-xs font-bold px-2 py-0.5 rounded-full">
                      Step {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{step.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                  <div className="bg-muted/50 rounded-md p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">How this works</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {getTransformExplanation(step.name)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Section 3: Educational context */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
          <h3 className="text-sm font-semibold text-foreground">Theoretical Background</h3>
        </div>

        <div className="bg-primary/5 border border-primary/15 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Key Concepts in CFG Ambiguity</span>
          </div>

          <div className="grid gap-3">
            <ConceptCard
              icon={<Info className="w-3.5 h-3.5 text-info" />}
              title="Undecidability"
              text="General CFG ambiguity detection is undecidable — no algorithm can determine ambiguity for all grammars. This was proven by showing a reduction from Post's Correspondence Problem. Our tool uses heuristic detection for common, well-known ambiguity patterns."
            />
            <ConceptCard
              icon={<AlertTriangle className="w-3.5 h-3.5 text-warning" />}
              title="Inherent Ambiguity"
              text={`Some context-free languages are inherently ambiguous — no unambiguous grammar exists for them. A classic example is L = {aⁿbⁿcᵐdᵐ : n,m ≥ 1} ∪ {aⁿbᵐcᵐdⁿ : n,m ≥ 1}. For such languages, every CFG that generates them will be ambiguous.`}
            />
            <ConceptCard
              icon={<Wrench className="w-3.5 h-3.5 text-success" />}
              title="Disambiguation Techniques"
              text="Common techniques include: (1) Introducing precedence levels via grammar layering (e.g., E → T, T → F for +/*), (2) Enforcing associativity by making recursion one-sided, (3) Left factoring to eliminate prefix conflicts, (4) The matched/unmatched statement technique for dangling else."
            />
            <ConceptCard
              icon={<Lightbulb className="w-3.5 h-3.5 text-primary" />}
              title="Language Preservation"
              text="All transformations in this tool are designed to preserve the generated language L(G). The transformed grammar G' satisfies L(G) = L(G'), meaning every string derivable in the original grammar is also derivable in the transformed grammar, and vice versa."
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const ConceptCard: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="bg-card/60 border border-border/50 rounded-md p-3 space-y-1.5">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs font-semibold text-foreground">{title}</span>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
  </div>
);

function getDetailedExplanation(type: string): string {
  const explanations: Record<string, string> = {
    'Expression Ambiguity':
      'When a non-terminal A has a production A → A op A, the string "x op y op z" can be parsed as either (x op y) op z (left-associative) or x op (y op z) (right-associative). This creates two distinct parse trees, making the grammar definitively ambiguous. In compilers, this is resolved by introducing separate non-terminals for each precedence level.',
    'Dangling Else':
      'The classic dangling else problem occurs when both "if-then" and "if-then-else" productions exist for the same non-terminal. For nested conditionals like "if c1 then if c2 then s1 else s2", the "else" clause can bind to either "if". This is typically resolved using the matched/unmatched statement technique, creating separate rules for statements where all if-then have matching else clauses.',
    'Prefix Conflict':
      'When two productions for the same non-terminal share a common prefix, a top-down parser cannot determine which alternative to use until the distinguishing symbols are reached. While this doesn\'t always indicate ambiguity, it causes parsing conflicts and is resolved through left factoring.',
    'FIRST/FOLLOW Conflict':
      'When the FIRST sets of two alternatives for the same non-terminal overlap, or when a nullable alternative\'s FIRST set overlaps with the FOLLOW set of the non-terminal, an LL(1) parser cannot make a deterministic choice. This may indicate structural issues in the grammar that could lead to ambiguity.',
    'Mixed Recursion':
      'Having both left-recursive (A → A α) and right-recursive (A → α A) productions for the same non-terminal can create ambiguity because certain strings may be derived using different combinations of these recursive rules, leading to multiple distinct parse trees.',
  };
  return explanations[type] || 'This pattern is a known source of ambiguity in context-free grammars. It allows multiple distinct parse trees for the same input string.';
}

function getTransformExplanation(name: string): string {
  const explanations: Record<string, string> = {
    'Operator Precedence':
      'Operator precedence is enforced by creating a hierarchy of non-terminals, one per precedence level. Higher-precedence operators are pushed deeper in the grammar. For example, E → E+E | E*E | id becomes E → E+T | T, T → T*F | F, F → id. This forces * to bind tighter than +, eliminating the ambiguity.',
    'Left Recursion Elimination':
      'Direct left recursion (A → Aα | β) is eliminated by introducing a new non-terminal A\'. The production becomes A → βA\' and A\' → αA\' | ε. This preserves the language but changes the derivation from left-recursive to right-recursive, which is necessary for top-down parsing methods like LL(1).',
    'Left Factoring':
      'When two alternatives share a common prefix (A → αβ₁ | αβ₂), left factoring extracts the common prefix: A → αA\', A\' → β₁ | β₂. This allows a top-down parser to defer the choice until after consuming the shared prefix, resolving the parsing conflict.',
    'Dangling Else Resolution':
      'The dangling else is resolved by splitting the statement non-terminal into "matched" and "unmatched" variants. Matched statements require every "if" to have an "else" clause, while unmatched statements allow the outermost "if" to lack an "else". This forces the "else" to bind to the nearest unmatched "if".',
  };
  return explanations[name] || 'This transformation restructures the grammar to remove a specific source of ambiguity while preserving the generated language.';
}

export default ExplanationTab;
