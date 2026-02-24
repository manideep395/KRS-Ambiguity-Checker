import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, GitBranch, Zap, BarChart3, ArrowRightLeft, TreePine, BookOpen, Users, Mail } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const features = [
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Ambiguity Detection', description: 'Detects expression ambiguity, dangling else, prefix conflicts, and more using heuristic analysis.' },
  { icon: <Zap className="w-6 h-6" />, title: 'FIRST/FOLLOW Sets', description: 'Computes FIRST and FOLLOW sets for all nonterminals and identifies LL(1) parsing conflicts.' },
  { icon: <ArrowRightLeft className="w-6 h-6" />, title: 'Grammar Transformation', description: 'Automated left recursion elimination, left factoring, and operator precedence restructuring.' },
  { icon: <TreePine className="w-6 h-6" />, title: 'Parse Tree Visualization', description: 'Interactive SVG-based parse tree rendering with animated node expansion.' },
  { icon: <BookOpen className="w-6 h-6" />, title: 'Step-by-Step Explanation', description: 'Detailed explanations of detected issues and applied transformations.' },
  { icon: <GitBranch className="w-6 h-6" />, title: 'Export Reports', description: 'Export full analysis reports including grammar, results, and transformation steps.' },
];

const team = [
  { name: 'KRS Innovators', role: 'Development Team', description: 'Building tools for compiler design education and research.' },
];

const About: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <NavBar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Analyzer
          </motion.button>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto border border-primary/25 shadow-lg">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              <span className="text-gradient">KRS Ambiguity Checker</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A powerful web-based tool for detecting and resolving ambiguity in context-free grammars.
              Designed for students, educators, and researchers in compiler design and formal language theory.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-foreground text-center">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="p-5 rounded-xl bg-card border border-border card-3d space-y-3"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* How it works */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-foreground text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Enter Grammar', desc: 'Type or paste your context-free grammar using standard notation (e.g., E → E + T | T).' },
                { step: '2', title: 'Analyze', desc: 'Click Analyze to detect ambiguity patterns, compute FIRST/FOLLOW sets, and check LL(1) conflicts.' },
                { step: '3', title: 'Review Results', desc: 'Explore detailed analysis, transformed grammars, explanations, and parse tree visualizations.' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                  className="text-center space-y-3 p-6 rounded-xl bg-card border border-border card-3d"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto text-primary font-bold text-xl">
                    {item.step}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Disclaimer */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="p-6 rounded-xl bg-accent/50 border border-accent-foreground/10 space-y-2"
          >
            <h2 className="text-lg font-semibold text-foreground">⚠️ Important Note</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              General CFG ambiguity is an <strong className="text-foreground">undecidable problem</strong>. This tool uses heuristic methods to detect
              common ambiguity patterns but cannot guarantee completeness. It is intended as an educational aid and should not be
              relied upon as a formal proof of grammar properties.
            </p>
          </motion.section>

          {/* Team */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center space-y-4 pb-8"
          >
            <h2 className="text-2xl font-bold text-foreground">Built By</h2>
            <div className="flex justify-center">
              <div className="p-6 rounded-xl bg-card border border-border card-3d inline-flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-foreground">KRS Innovators</h3>
                  <p className="text-sm text-muted-foreground">Building tools for compiler design education & research</p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
