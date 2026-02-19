import React, { useState, useCallback, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import GrammarEditor from '@/components/GrammarEditor';
import AnalysisTab from '@/components/AnalysisTab';
import ConversionTab from '@/components/ConversionTab';
import ExplanationTab from '@/components/ExplanationTab';
import ParseTreeView from '@/components/ParseTreeView';
import { parseGrammar, grammarToString } from '@/engine/parser';
import { detectAmbiguity } from '@/engine/ambiguity';
import { transformGrammar } from '@/engine/transformer';
import { computeFirstFollow, checkLL1Conflicts } from '@/engine/firstfollow';
import { Grammar, AmbiguityResult, TransformationResult, ValidationError } from '@/engine/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, BarChart3, ArrowRightLeft, BookOpen, TreePine, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

type TabId = 'analysis' | 'conversion' | 'explanation' | 'visualization';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'analysis', label: 'Analysis', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: 'conversion', label: 'Conversion', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
  { id: 'explanation', label: 'Explanation', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'visualization', label: 'Visualization', icon: <TreePine className="w-3.5 h-3.5" /> },
];

const Index = () => {
  const [grammarText, setGrammarText] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('analysis');
  const [showAbout, setShowAbout] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cfg-dark-mode') !== 'false';
    }
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('cfg-dark-mode', String(darkMode));
  }, [darkMode]);

  // Results
  const [grammar, setGrammar] = useState<Grammar | null>(null);
  const [ambiguityResult, setAmbiguityResult] = useState<AmbiguityResult | null>(null);
  const [transformResult, setTransformResult] = useState<TransformationResult | null>(null);
  const [convertedGrammarText, setConvertedGrammarText] = useState('');
  const [convertedGrammar, setConvertedGrammar] = useState<Grammar | null>(null);
  const [firstSets, setFirstSets] = useState<Map<string, Set<string>> | null>(null);
  const [followSets, setFollowSets] = useState<Map<string, Set<string>> | null>(null);
  const [ll1Conflicts, setLl1Conflicts] = useState<string[]>([]);

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const { grammar: parsed, errors: parseErrors } = parseGrammar(grammarText);
      setErrors(parseErrors);

      if (!parsed) {
        setIsAnalyzing(false);
        setGrammar(null);
        setAmbiguityResult(null);
        setTransformResult(null);
        toast.error('Grammar has errors. Fix them and try again.');
        return;
      }

      setGrammar(parsed);

      const ambResult = detectAmbiguity(parsed);
      setAmbiguityResult(ambResult);

      const ff = computeFirstFollow(parsed);
      setFirstSets(ff.first);
      setFollowSets(ff.follow);
      setLl1Conflicts(checkLL1Conflicts(parsed, ff));

      const txResult = transformGrammar(parsed);
      setTransformResult(txResult);
      if (txResult.grammar) {
        setConvertedGrammarText(grammarToString(txResult.grammar));
        setConvertedGrammar(txResult.grammar);
      } else {
        setConvertedGrammarText('');
        setConvertedGrammar(null);
      }

      setIsAnalyzing(false);
      toast.success('Analysis complete');
    }, 300);
  }, [grammarText]);

  const handleExport = useCallback(() => {
    if (!ambiguityResult) return;
    let text = '=== CFG Ambiguity Analysis Report ===\n\n';
    text += `Status: ${ambiguityResult.status}\n\n`;
    text += `Original Grammar:\n${grammarText}\n\n`;
    text += `Explanation:\n${ambiguityResult.explanation}\n\n`;
    if (transformResult?.success) {
      text += `Converted Grammar:\n${convertedGrammarText}\n\n`;
      text += `Transformation Steps:\n`;
      transformResult.steps.forEach((s, i) => {
        text += `  ${i + 1}. ${s.name}: ${s.description}\n`;
      });
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cfg-analysis-report.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  }, [ambiguityResult, grammarText, transformResult, convertedGrammarText]);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <NavBar
        showAbout={showAbout}
        onToggleAbout={() => setShowAbout(!showAbout)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col border-r border-border min-h-0">
          <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grammar Editor</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(grammarText); toast.success('Copied'); }}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Copy grammar"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!grammarText.trim() || isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Analyze
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <GrammarEditor value={grammarText} onChange={setGrammarText} errors={errors} />
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col min-h-0">
          {/* Tab bar */}
          <div className="flex items-center justify-between px-2 bg-secondary/30 border-b border-border">
            <div className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
            {ambiguityResult && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors mr-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'analysis' && (
                <AnalysisTab key="analysis" result={ambiguityResult} firstSets={firstSets} followSets={followSets} ll1Conflicts={ll1Conflicts} />
              )}
              {activeTab === 'conversion' && (
                <ConversionTab key="conversion" result={transformResult} originalGrammar={grammarText} convertedGrammar={convertedGrammarText} />
              )}
              {activeTab === 'explanation' && (
                <ExplanationTab key="explanation" ambiguityResult={ambiguityResult} transformResult={transformResult} />
              )}
              {activeTab === 'visualization' && (
                <ParseTreeView key="visualization" grammar={grammar} convertedGrammar={convertedGrammar} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
