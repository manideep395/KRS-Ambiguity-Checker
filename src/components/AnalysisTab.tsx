import React from 'react';
import { AmbiguityResult } from '@/engine/types';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, HelpCircle, BarChart3 } from 'lucide-react';

interface AnalysisTabProps {
  result: AmbiguityResult | null;
  firstSets: Map<string, Set<string>> | null;
  followSets: Map<string, Set<string>> | null;
  ll1Conflicts: string[];
}

const statusConfig = {
  'ambiguous': { icon: AlertTriangle, label: 'Ambiguous', badgeClass: 'badge-ambiguous', iconColor: 'text-destructive' },
  'possibly-ambiguous': { icon: HelpCircle, label: 'Possibly Ambiguous', badgeClass: 'badge-warning', iconColor: 'text-warning' },
  'no-ambiguity-detected': { icon: CheckCircle, label: 'No Ambiguity Detected', badgeClass: 'badge-fixed', iconColor: 'text-success' },
};

const AnalysisTab: React.FC<AnalysisTabProps> = ({ result, firstSets, followSets, ll1Conflicts }) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center card-3d">
          <BarChart3 className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-sm">Enter a grammar and click Analyze to see results.</p>
      </div>
    );
  }

  const config = statusConfig[result.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 space-y-5 overflow-y-auto h-full"
    >
      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl card-3d glass"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
          result.status === 'ambiguous' ? 'bg-destructive/15' :
          result.status === 'possibly-ambiguous' ? 'bg-warning/15' : 'bg-success/15'
        }`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.badgeClass}`}>
            {config.label}
          </span>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">{result.explanation}</p>
        </div>
      </motion.div>

      {/* Reasons */}
      {result.reasons.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-primary" />
            Detection Details
          </h3>
          {result.reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10, rotateX: -5 }}
              animate={{ opacity: 1, x: 0, rotateX: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl p-4 space-y-2 card-3d glass"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  reason.severity === 'high' ? 'badge-ambiguous' :
                  reason.severity === 'medium' ? 'badge-warning' : 'badge-info'
                }`}>
                  {reason.severity}
                </span>
                <span className="text-sm font-medium text-foreground">{reason.type}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{reason.description}</p>
              {reason.involvedRules.length > 0 && (
                <div className="space-y-1">
                  {reason.involvedRules.map((rule, j) => (
                    <code key={j} className="block text-xs font-mono text-primary bg-primary/8 px-2.5 py-1.5 rounded-lg border border-primary/15">
                      {rule}
                    </code>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* FIRST/FOLLOW Sets */}
      {firstSets && followSets && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-info" />
            FIRST & FOLLOW Sets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl p-4 card-3d glass"
            >
              <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">FIRST Sets</h4>
              {[...firstSets.entries()].map(([nt, set]) => (
                <div key={nt} className="flex gap-2 text-xs font-mono py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-primary font-semibold min-w-[2rem]">{nt}:</span>
                  <span className="text-foreground/80">{`{ ${[...set].join(', ')} }`}</span>
                </div>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl p-4 card-3d glass"
            >
              <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">FOLLOW Sets</h4>
              {[...followSets.entries()].map(([nt, set]) => (
                <div key={nt} className="flex gap-2 text-xs font-mono py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-primary font-semibold min-w-[2rem]">{nt}:</span>
                  <span className="text-foreground/80">{`{ ${[...set].join(', ')} }`}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* LL(1) Conflicts */}
      {ll1Conflicts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-warning" />
            LL(1) Conflicts
          </h3>
          {ll1Conflicts.map((conflict, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="text-xs font-mono badge-warning px-3 py-2.5 rounded-xl card-3d"
            >
              {conflict}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AnalysisTab;
