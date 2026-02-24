import React, { useState, useCallback, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
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
import { Play, BarChart3, ArrowRightLeft, BookOpen, TreePine, Copy, Download, Sparkles } from 'lucide-react';
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
          <div className="flex items-center justify-between px-4 py-2.5 glass-strong border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grammar Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(grammarText); toast.success('Copied'); }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
                title="Copy grammar"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAnalyze}
                disabled={!grammarText.trim() || isAnalyzing}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                style={{ boxShadow: '0 4px 14px hsl(var(--primary) / 0.3)' }}
              >
                {isAnalyzing ? (
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isAnalyzing ? 'Analyzing…' : 'Analyze'}
              </motion.button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <GrammarEditor value={grammarText} onChange={setGrammarText} errors={errors} />
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col min-h-0">
          {/* Tab bar */}
          <div className="flex items-center justify-between px-2 glass-strong border-b border-border">
            <div className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
            {ambiguityResult && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground glass rounded-lg transition-all duration-200 mr-2 hover:shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
            )}
          </div>

          {/* Analyzing overlay */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center glass"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center gap-4 p-8 rounded-2xl card-3d-deep glass-strong"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary animate-analyze-pulse" />
                    </div>
                    <div className="absolute -inset-2 rounded-3xl border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Analyzing Grammar</p>
                    <p className="text-xs text-muted-foreground mt-1">Detecting ambiguity patterns…</p>
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
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

      <Footer />
    </div>
  );
};

export default Index;
