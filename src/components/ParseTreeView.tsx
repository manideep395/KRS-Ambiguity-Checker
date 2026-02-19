import React, { useMemo } from 'react';
import { ParseTreeNode, Grammar } from '@/engine/types';
import { motion } from 'framer-motion';
import { TreePine } from 'lucide-react';

interface ParseTreeViewProps {
  grammar: Grammar | null;
  convertedGrammar: Grammar | null;
}

const ParseTreeView: React.FC<ParseTreeViewProps> = ({ grammar, convertedGrammar }) => {
  const originalTrees = useMemo(() => {
    if (!grammar) return [];
    return buildDisplayTrees(grammar);
  }, [grammar]);

  const convertedTrees = useMemo(() => {
    if (!convertedGrammar) return [];
    return buildDisplayTrees(convertedGrammar);
  }, [convertedGrammar]);

  if (!grammar) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center card-3d">
          <TreePine className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-sm">Run analysis to see parse tree visualization.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 space-y-5 overflow-y-auto h-full"
    >
      {/* Original Trees */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-destructive" />
          Original Parse Tree{originalTrees.length > 1 ? 's' : ''}
          {originalTrees.length > 1 && (
            <span className="ml-1 text-xs badge-ambiguous px-2 py-0.5 rounded-full">
              {originalTrees.length} trees — ambiguous
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {originalTrees.map((tree, i) => (
            <TreeCard
              key={i}
              index={i}
              title={originalTrees.length > 1 ? `Parse Tree ${i + 1}` : 'Parse Tree'}
              variant="original"
              tree={tree}
              productionHint={originalTrees.length > 1 ? getTopProduction(tree) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Converted Trees */}
      {convertedTrees.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-success" />
            Converted Parse Tree{convertedTrees.length > 1 ? 's' : ''}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {convertedTrees.map((tree, i) => (
              <TreeCard
                key={i}
                index={i}
                title={convertedTrees.length > 1 ? `Converted Tree ${i + 1}` : 'Converted Parse Tree'}
                variant="converted"
                tree={tree}
              />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-6 py-3 rounded-xl glass card-3d"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md" style={{ background: 'hsl(var(--primary) / 0.2)', border: '1.5px solid hsl(var(--primary) / 0.5)', boxShadow: '0 2px 4px hsl(var(--primary) / 0.15)' }} />
          <span className="text-xs text-muted-foreground font-medium">Non-terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full" style={{ background: 'hsl(var(--warning) / 0.2)', border: '1.5px solid hsl(var(--warning) / 0.5)', boxShadow: '0 2px 4px hsl(var(--warning) / 0.15)' }} />
          <span className="text-xs text-muted-foreground font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md" style={{ background: 'hsl(var(--destructive) / 0.15)', border: '1.5px dashed hsl(var(--destructive) / 0.4)', boxShadow: '0 2px 4px hsl(var(--destructive) / 0.1)' }} />
          <span className="text-xs text-muted-foreground font-medium">Epsilon (ε)</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

function getTopProduction(tree: ParseTreeNode): string {
  if (tree.children.length === 0) return '';
  const childLabels = tree.children.map(c => c.label).join(' ');
  return `${tree.label} → ${childLabels}`;
}

const TreeCard: React.FC<{ 
  title: string; 
  variant: 'original' | 'converted'; 
  tree: ParseTreeNode | null;
  productionHint?: string;
  index: number;
}> = ({ title, variant, tree, productionHint, index }) => {
  const isOriginal = variant === 'original';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, rotateX: -3 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl overflow-hidden card-3d glass"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className={`px-4 py-2.5 border-b flex items-center gap-2 ${
        isOriginal ? 'bg-destructive/6 border-destructive/15' : 'bg-success/6 border-success/15'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isOriginal ? 'bg-destructive' : 'bg-success'}`} />
        <span className={`text-xs font-semibold ${isOriginal ? 'text-destructive' : 'text-success'}`}>{title}</span>
        {productionHint && (
          <span className="text-xs text-muted-foreground font-mono ml-auto">({productionHint})</span>
        )}
      </div>
      <div className="p-5 overflow-x-auto min-h-[220px] flex items-center justify-center">
        {tree ? (
          <TreeSVG node={tree} />
        ) : (
          <p className="text-xs text-muted-foreground">Could not generate tree.</p>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Build multiple parse trees by using different top-level productions.
 * For ambiguous grammars, this shows how the same start symbol
 * can derive different tree structures.
 */
function buildDisplayTrees(grammar: Grammar, maxDepth: number = 4): ParseTreeNode[] {
  const startBodies = grammar.productions.get(grammar.startSymbol);
  if (!startBodies || startBodies.length === 0) return [];

  const trees: ParseTreeNode[] = [];
  let idCounter = 0;

  for (const body of startBodies) {
    const tree = buildOneTree(grammar, grammar.startSymbol, body, maxDepth, () => idCounter++);
    trees.push(tree);
  }

  return trees;
}

function buildOneTree(
  grammar: Grammar,
  rootLabel: string,
  body: import('@/engine/types').Symbol[],
  maxDepth: number,
  nextId: () => number
): ParseTreeNode {
  const root: ParseTreeNode = {
    id: `n${nextId()}`,
    label: rootLabel,
    isTerminal: false,
    children: []
  };

  root.children = body.map(sym => buildSubtree(grammar, sym, 1, maxDepth, nextId));
  return root;
}

function buildSubtree(
  grammar: Grammar,
  sym: import('@/engine/types').Symbol,
  depth: number,
  maxDepth: number,
  nextId: () => number
): ParseTreeNode {
  if (sym.type === 'epsilon') {
    return { id: `n${nextId()}`, label: 'ε', isTerminal: true, children: [] };
  }
  if (sym.type === 'terminal') {
    return { id: `n${nextId()}`, label: sym.value, isTerminal: true, children: [] };
  }

  const node: ParseTreeNode = {
    id: `n${nextId()}`,
    label: sym.value,
    isTerminal: false,
    children: []
  };

  if (depth >= maxDepth) return node;

  const bodies = grammar.productions.get(sym.value);
  if (bodies && bodies.length > 0) {
    const body = [...bodies].sort((a, b) => a.length - b.length)[0];
    node.children = body.map(s => buildSubtree(grammar, s, depth + 1, maxDepth, nextId));
  }

  return node;
}

// SVG Tree renderer with 3D-style nodes
const NODE_W = 56;
const NODE_H = 32;
const H_GAP = 18;
const V_GAP = 60;

interface LayoutNode {
  node: ParseTreeNode;
  x: number;
  y: number;
  width: number;
  children: LayoutNode[];
}

function layoutTree(node: ParseTreeNode, depth: number = 0): LayoutNode {
  if (node.children.length === 0) {
    return { node, x: 0, y: depth * V_GAP, width: NODE_W, children: [] };
  }

  const childLayouts = node.children.map(c => layoutTree(c, depth + 1));
  const totalWidth = childLayouts.reduce((sum, c) => sum + c.width, 0) + (childLayouts.length - 1) * H_GAP;

  let offsetX = -totalWidth / 2;
  for (const child of childLayouts) {
    child.x = offsetX + child.width / 2;
    offsetX += child.width + H_GAP;
  }

  return {
    node,
    x: 0,
    y: depth * V_GAP,
    width: Math.max(totalWidth, NODE_W),
    children: childLayouts
  };
}

function getTreeBounds(layout: LayoutNode, parentX: number = 0): { minX: number; maxX: number; maxY: number } {
  const absX = parentX + layout.x;
  let minX = absX - NODE_W / 2;
  let maxX = absX + NODE_W / 2;
  let maxY = layout.y + NODE_H;

  for (const child of layout.children) {
    const cb = getTreeBounds(child, absX);
    minX = Math.min(minX, cb.minX);
    maxX = Math.max(maxX, cb.maxX);
    maxY = Math.max(maxY, cb.maxY);
  }

  return { minX, maxX, maxY };
}

const TreeSVG: React.FC<{ node: ParseTreeNode }> = ({ node }) => {
  const layout = layoutTree(node);
  const bounds = getTreeBounds(layout);
  const padding = 28;
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY + padding * 2;
  const offsetX = -bounds.minX + padding;
  const offsetY = padding;

  return (
    <svg
      width={Math.min(width, 600)}
      height={Math.min(height, 450)}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto"
    >
      <defs>
        <filter id="node-shadow-3d" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="hsl(var(--foreground))" floodOpacity="0.08" />
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="hsl(var(--foreground))" floodOpacity="0.05" />
        </filter>
        <linearGradient id="nt-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="term-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity="0.22" />
          <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="eps-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        <RenderNode layout={layout} parentX={0} parentY={0} isRoot />
      </g>
    </svg>
  );
};

const RenderNode: React.FC<{ layout: LayoutNode; parentX: number; parentY: number; isRoot?: boolean }> = ({
  layout, parentX, parentY, isRoot
}) => {
  const x = parentX + layout.x;
  const y = layout.y;
  const isEpsilon = layout.node.label === 'ε';
  const isTerminal = layout.node.isTerminal;

  let fillUrl: string;
  let strokeColor: string;
  let textColor: string;

  if (isEpsilon) {
    fillUrl = 'url(#eps-gradient)';
    strokeColor = 'hsl(var(--destructive) / 0.4)';
    textColor = 'hsl(var(--destructive))';
  } else if (isTerminal) {
    fillUrl = 'url(#term-gradient)';
    strokeColor = 'hsl(var(--warning) / 0.5)';
    textColor = 'hsl(var(--warning))';
  } else {
    fillUrl = 'url(#nt-gradient)';
    strokeColor = 'hsl(var(--primary) / 0.45)';
    textColor = 'hsl(var(--primary))';
  }

  return (
    <g>
      {!isRoot && (
        <path
          d={`M ${parentX} ${parentY + NODE_H / 2} C ${parentX} ${(parentY + NODE_H / 2 + y - NODE_H / 2) / 2 + 12}, ${x} ${(parentY + NODE_H / 2 + y - NODE_H / 2) / 2 + 12}, ${x} ${y - NODE_H / 2}`}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={1.5}
          strokeDasharray={isEpsilon ? '4 3' : 'none'}
        />
      )}

      <rect
        x={x - NODE_W / 2}
        y={y - NODE_H / 2}
        width={NODE_W}
        height={NODE_H}
        rx={isTerminal ? 16 : 8}
        fill={fillUrl}
        stroke={strokeColor}
        strokeWidth={1.5}
        filter="url(#node-shadow-3d)"
      />
      {/* 3D highlight on top edge */}
      <rect
        x={x - NODE_W / 2 + 2}
        y={y - NODE_H / 2 + 1}
        width={NODE_W - 4}
        height={2}
        rx={1}
        fill="white"
        opacity={0.15}
      />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontSize={11}
        fontFamily="var(--font-mono)"
        fontWeight={700}
      >
        {layout.node.label.length > 6 ? layout.node.label.slice(0, 5) + '…' : layout.node.label}
      </text>

      {layout.children.map((child, i) => (
        <RenderNode key={i} layout={child} parentX={x} parentY={y} />
      ))}
    </g>
  );
};

export default ParseTreeView;
