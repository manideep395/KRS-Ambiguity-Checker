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
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <TreePine className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm">Run analysis to see parse tree visualization.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-4 overflow-y-auto h-full"
    >
      {/* Original Trees */}
      <div>
        <h3 className="text-xs font-semibold text-destructive mb-2">
          Original Parse Tree{originalTrees.length > 1 ? 's' : ''} 
          {originalTrees.length > 1 && (
            <span className="ml-2 text-muted-foreground font-normal">
              ({originalTrees.length} trees — grammar is ambiguous)
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {originalTrees.map((tree, i) => (
            <TreeCard
              key={i}
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
          <h3 className="text-xs font-semibold text-success mb-2">
            Converted Parse Tree{convertedTrees.length > 1 ? 's' : ''}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {convertedTrees.map((tree, i) => (
              <TreeCard
                key={i}
                title={convertedTrees.length > 1 ? `Converted Tree ${i + 1}` : 'Converted Parse Tree'}
                variant="converted"
                tree={tree}
              />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: 'hsl(var(--primary) / 0.2)', border: '1.5px solid hsl(var(--primary) / 0.5)' }} />
          <span className="text-xs text-muted-foreground">Non-terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: 'hsl(var(--warning) / 0.2)', border: '1.5px solid hsl(var(--warning) / 0.5)' }} />
          <span className="text-xs text-muted-foreground">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: 'hsl(var(--destructive) / 0.15)', border: '1.5px solid hsl(var(--destructive) / 0.4)' }} />
          <span className="text-xs text-muted-foreground">Epsilon (ε)</span>
        </div>
      </div>
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
}> = ({ title, variant, tree, productionHint }) => {
  const headerColor = variant === 'original' ? 'bg-destructive/8 border-destructive/20' : 'bg-success/8 border-success/20';
  const titleColor = variant === 'original' ? 'text-destructive' : 'text-success';

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className={`px-3 py-2 border-b ${headerColor}`}>
        <span className={`text-xs font-semibold ${titleColor}`}>{title}</span>
        {productionHint && (
          <span className="text-xs text-muted-foreground ml-2 font-mono">({productionHint})</span>
        )}
      </div>
      <div className="p-4 overflow-x-auto min-h-[200px] flex items-center justify-center">
        {tree ? (
          <TreeSVG node={tree} />
        ) : (
          <p className="text-xs text-muted-foreground">Could not generate tree.</p>
        )}
      </div>
    </div>
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
    // Pick the shortest production to keep subtrees compact
    const body = [...bodies].sort((a, b) => a.length - b.length)[0];
    node.children = body.map(s => buildSubtree(grammar, s, depth + 1, maxDepth, nextId));
  }

  return node;
}

// SVG Tree renderer
const NODE_W = 52;
const NODE_H = 30;
const H_GAP = 16;
const V_GAP = 56;

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
  const padding = 24;
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
        <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
        </filter>
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

  let fillColor: string;
  let strokeColor: string;
  let textColor: string;

  if (isEpsilon) {
    fillColor = 'hsl(var(--destructive) / 0.12)';
    strokeColor = 'hsl(var(--destructive) / 0.4)';
    textColor = 'hsl(var(--destructive))';
  } else if (isTerminal) {
    fillColor = 'hsl(var(--warning) / 0.15)';
    strokeColor = 'hsl(var(--warning) / 0.5)';
    textColor = 'hsl(var(--warning))';
  } else {
    fillColor = 'hsl(var(--primary) / 0.12)';
    strokeColor = 'hsl(var(--primary) / 0.45)';
    textColor = 'hsl(var(--primary))';
  }

  return (
    <g>
      {!isRoot && (
        <path
          d={`M ${parentX} ${parentY + NODE_H / 2} C ${parentX} ${(parentY + NODE_H / 2 + y - NODE_H / 2) / 2 + 10}, ${x} ${(parentY + NODE_H / 2 + y - NODE_H / 2) / 2 + 10}, ${x} ${y - NODE_H / 2}`}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={1.5}
        />
      )}

      <rect
        x={x - NODE_W / 2}
        y={y - NODE_H / 2}
        width={NODE_W}
        height={NODE_H}
        rx={isTerminal ? 14 : 7}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
        filter="url(#node-shadow)"
      />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontSize={11}
        fontFamily="var(--font-mono)"
        fontWeight={600}
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
