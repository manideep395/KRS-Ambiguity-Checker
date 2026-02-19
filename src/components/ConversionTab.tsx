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
      <div className="flex items-center justify-center h-full text-muted-foreground">
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
      className="p-4 space-y-5 overflow-y-auto h-full"
    >
      {/* Status */}
      <div className="flex items-center gap-3">
        {result.success ? (
          <>
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="badge-fixed px-3 py-1 rounded-full text-sm font-medium">Transformation Applied</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5 text-destructive" />
            <span className="badge-ambiguous px-3 py-1 rounded-full text-sm font-medium">No Transformation Available</span>
          </>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{result.explanation}</p>

      {result.success && (
        <>
          {/* Before / After comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-destructive/10 border-b border-border">
                <span className="text-xs font-semibold text-destructive">Original Grammar</span>
                <button onClick={() => copyToClipboard(originalGrammar)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-3 text-xs font-mono text-foreground/80 whitespace-pre-wrap">{originalGrammar}</pre>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-success/10 border-b border-border">
                <span className="text-xs font-semibold text-success">Converted Grammar</span>
                <button onClick={() => copyToClipboard(convertedGrammar)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-3 text-xs font-mono text-foreground/80 whitespace-pre-wrap">{convertedGrammar}</pre>
            </div>
          </div>

          {/* Transformation Steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Transformation Steps</h3>
            {result.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="bg-card border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    Step {i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{step.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                <div className="flex items-center gap-3">
                  <pre className="flex-1 text-xs font-mono bg-secondary/50 p-2 rounded border border-border text-foreground/70 whitespace-pre-wrap">
                    {step.before}
                  </pre>
                  <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                  <pre className="flex-1 text-xs font-mono bg-success/5 p-2 rounded border border-success/20 text-foreground/70 whitespace-pre-wrap">
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
