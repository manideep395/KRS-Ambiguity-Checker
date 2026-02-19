import React from 'react';
import { TransformationResult } from '@/engine/types';
import { motion } from 'framer-motion';
import { ArrowRight, Copy, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ConversionTabProps {
  result: TransformationResult | null;
  originalGrammar: string;
  convertedGrammar: string;
}

const ConversionTab: React.FC<ConversionTabProps> = ({ result, originalGrammar, convertedGrammar }) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center card-3d">
          <ArrowRight className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-sm">Run analysis first to see conversion results.</p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 space-y-5 overflow-y-auto h-full"
    >
      {/* Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl card-3d glass"
      >
        {result.success ? (
          <>
            <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center shadow-md">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <span className="badge-fixed px-3 py-1 rounded-full text-sm font-semibold">Transformation Applied</span>
              <p className="text-xs text-muted-foreground mt-1">{result.explanation}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center shadow-md">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <span className="badge-ambiguous px-3 py-1 rounded-full text-sm font-semibold">No Transformation Available</span>
              <p className="text-xs text-muted-foreground mt-1">{result.explanation}</p>
            </div>
          </>
        )}
      </motion.div>

      {result.success && (
        <>
          {/* Before / After comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl overflow-hidden card-3d glass"
            >
              <div className="flex items-center justify-between px-4 py-2.5 bg-destructive/8 border-b border-destructive/15">
                <span className="text-xs font-semibold text-destructive">Original Grammar</span>
                <button onClick={() => copyToClipboard(originalGrammar)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/50">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">{originalGrammar}</pre>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl overflow-hidden card-3d glass"
            >
              <div className="flex items-center justify-between px-4 py-2.5 bg-success/8 border-b border-success/15">
                <span className="text-xs font-semibold text-success">Converted Grammar</span>
                <button onClick={() => copyToClipboard(convertedGrammar)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/50">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">{convertedGrammar}</pre>
            </motion.div>
          </div>

          {/* Transformation Steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-primary" />
              Transformation Steps
            </h3>
            {result.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.15 }}
                className="rounded-xl p-4 space-y-3 card-3d glass"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary text-xs font-bold shadow-sm">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{step.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                <div className="flex items-center gap-3">
                  <pre className="flex-1 text-xs font-mono bg-secondary/30 p-3 rounded-lg border border-border/50 text-foreground/70 whitespace-pre-wrap">
                    {step.before}
                  </pre>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                  <pre className="flex-1 text-xs font-mono bg-success/5 p-3 rounded-lg border border-success/20 text-foreground/70 whitespace-pre-wrap">
                    {step.after}
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ConversionTab;
