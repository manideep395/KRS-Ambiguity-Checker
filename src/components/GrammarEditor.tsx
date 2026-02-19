import React, { useRef, useEffect, useCallback } from 'react';
import { ValidationError } from '@/engine/types';

interface GrammarEditorProps {
  value: string;
  onChange: (value: string) => void;
  errors: ValidationError[];
}

const EXAMPLE_GRAMMARS = {
  'Expression (Ambiguous)': `E -> E + E | E * E | ( E ) | id`,
  'Dangling Else': `S -> if cond then S else S | if cond then S | other`,
  'Left Recursive': `E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id`,
  'Simple Unambiguous': `S -> a S b | ε`,
};

const GrammarEditor: React.FC<GrammarEditorProps> = ({ value, onChange, errors }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 10);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', syncScroll);
      return () => textarea.removeEventListener('scroll', syncScroll);
    }
  }, [syncScroll]);

  const errorLines = new Set(errors.map(e => e.line));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
        <span className="text-xs font-mono text-muted-foreground">grammar.cfg</span>
        <select
          className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground font-mono cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          onChange={(e) => {
            const key = e.target.value;
            if (key && EXAMPLE_GRAMMARS[key as keyof typeof EXAMPLE_GRAMMARS]) {
              onChange(EXAMPLE_GRAMMARS[key as keyof typeof EXAMPLE_GRAMMARS]);
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>Load Example…</option>
          {Object.keys(EXAMPLE_GRAMMARS).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 overflow-hidden bg-editor-bg relative">
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="flex-shrink-0 overflow-hidden select-none bg-editor-gutter border-r border-border py-3 px-2 text-right"
          style={{ width: '3rem' }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className={`text-xs leading-6 font-mono ${
                errorLines.has(i + 1) ? 'text-destructive font-bold' : 'text-editor-line-number'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editor area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full bg-transparent text-foreground font-mono text-sm leading-6 p-3 resize-none focus:outline-none placeholder:text-muted-foreground/40 caret-primary"
            placeholder="Enter your grammar here...&#10;&#10;Example:&#10;E -> E + E | E * E | ( E ) | id"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      </div>

      {/* Error panel */}
      {errors.length > 0 && (
        <div className="border-t border-destructive/30 bg-destructive/5 px-4 py-2 max-h-24 overflow-y-auto">
          {errors.map((err, i) => (
            <div key={i} className="text-xs font-mono text-destructive flex items-start gap-2 py-0.5">
              <span className="text-destructive/70 flex-shrink-0">
                {err.line > 0 ? `Ln ${err.line}:` : '⚠'}
              </span>
              <span>{err.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrammarEditor;
