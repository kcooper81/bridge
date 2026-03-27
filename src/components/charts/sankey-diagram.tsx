"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SankeyNode {
  id: string;
  name: string;
  type: "source" | "target";
  color?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  height?: number;
  className?: string;
}

const SOURCE_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#f97316", // orange
];

const TARGET_COLORS: Record<string, string> = {
  ChatGPT: "#10b981",
  Claude: "#f97316",
  Gemini: "#3b82f6",
  Copilot: "#8b5cf6",
  Perplexity: "#06b6d4",
  Other: "#6b7280",
};

export function SankeyDiagram({
  nodes,
  links,
  height = 400,
  className,
}: SankeyDiagramProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const sourceNodes = nodes.filter((n) => n.type === "source");
  const targetNodes = nodes.filter((n) => n.type === "target");

  if (sourceNodes.length === 0 || targetNodes.length === 0 || links.length === 0) {
    return (
      <div className={cn("flex items-center justify-center text-muted-foreground text-sm", className)} style={{ height }}>
        No interaction data available yet
      </div>
    );
  }

  const maxValue = Math.max(...links.map((l) => l.value), 1);
  const svgWidth = 800;
  const svgHeight = height;
  const padding = { top: 20, bottom: 20, left: 120, right: 120 };
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Calculate source node positions
  const totalSourceValue = sourceNodes.reduce((sum, node) => {
    const nodeValue = links.filter((l) => l.source === node.id).reduce((s, l) => s + l.value, 0);
    return sum + nodeValue;
  }, 0);

  let sourceY = padding.top;
  const sourcePositions: Record<string, { y: number; height: number; color: string }> = {};
  sourceNodes.forEach((node, i) => {
    const nodeValue = links.filter((l) => l.source === node.id).reduce((s, l) => s + l.value, 0);
    const nodeHeight = Math.max((nodeValue / totalSourceValue) * innerHeight * 0.85, 20);
    sourcePositions[node.id] = {
      y: sourceY,
      height: nodeHeight,
      color: node.color || SOURCE_COLORS[i % SOURCE_COLORS.length],
    };
    sourceY += nodeHeight + 8;
  });

  // Calculate target node positions
  const totalTargetValue = targetNodes.reduce((sum, node) => {
    const nodeValue = links.filter((l) => l.target === node.id).reduce((s, l) => s + l.value, 0);
    return sum + nodeValue;
  }, 0);

  let targetY = padding.top;
  const targetPositions: Record<string, { y: number; height: number; color: string }> = {};
  targetNodes.forEach((node) => {
    const nodeValue = links.filter((l) => l.target === node.id).reduce((s, l) => s + l.value, 0);
    const nodeHeight = Math.max((nodeValue / totalTargetValue) * innerHeight * 0.85, 20);
    targetPositions[node.id] = {
      y: targetY,
      height: nodeHeight,
      color: TARGET_COLORS[node.name] || "#6b7280",
    };
    targetY += nodeHeight + 8;
  });

  // Track cumulative offsets for stacked links per node
  const sourceOffsets: Record<string, number> = {};
  const targetOffsets: Record<string, number> = {};

  // Sort links by value descending for better visual layering
  const sortedLinks = [...links].sort((a, b) => b.value - a.value);

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" style={{ minHeight: height }}>
        {/* Source node labels */}
        {sourceNodes.map((node) => {
          const pos = sourcePositions[node.id];
          if (!pos) return null;
          return (
            <g key={`src-${node.id}`}>
              <rect
                x={padding.left - 8}
                y={pos.y}
                width={8}
                height={pos.height}
                rx={4}
                fill={pos.color}
              />
              <text
                x={padding.left - 16}
                y={pos.y + pos.height / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-foreground text-[11px] font-medium"
              >
                {node.name}
              </text>
            </g>
          );
        })}

        {/* Target node labels */}
        {targetNodes.map((node) => {
          const pos = targetPositions[node.id];
          if (!pos) return null;
          return (
            <g key={`tgt-${node.id}`}>
              <rect
                x={svgWidth - padding.right}
                y={pos.y}
                width={8}
                height={pos.height}
                rx={4}
                fill={pos.color}
              />
              <text
                x={svgWidth - padding.right + 16}
                y={pos.y + pos.height / 2}
                textAnchor="start"
                dominantBaseline="middle"
                className="fill-foreground text-[11px] font-medium"
              >
                {node.name}
              </text>
            </g>
          );
        })}

        {/* Flow paths */}
        {sortedLinks.map((link) => {
          const src = sourcePositions[link.source];
          const tgt = targetPositions[link.target];
          if (!src || !tgt) return null;

          const linkId = `${link.source}-${link.target}`;
          const strokeWidth = Math.max((link.value / maxValue) * 40, 2);

          // Calculate stacked position within each node
          const srcOffset = sourceOffsets[link.source] || 0;
          const tgtOffset = targetOffsets[link.target] || 0;
          const srcY = src.y + srcOffset + strokeWidth / 2;
          const tgtY = tgt.y + tgtOffset + strokeWidth / 2;
          sourceOffsets[link.source] = srcOffset + strokeWidth + 1;
          targetOffsets[link.target] = tgtOffset + strokeWidth + 1;

          const x1 = padding.left;
          const x2 = svgWidth - padding.right;
          const midX = (x1 + x2) / 2;

          const isHovered = hoveredLink === linkId;

          return (
            <g key={linkId}>
              <path
                d={`M ${x1} ${srcY} C ${midX} ${srcY}, ${midX} ${tgtY}, ${x2} ${tgtY}`}
                fill="none"
                stroke={src.color}
                strokeWidth={strokeWidth}
                opacity={hoveredLink ? (isHovered ? 0.7 : 0.1) : 0.35}
                className="transition-opacity duration-200"
                onMouseEnter={() => setHoveredLink(linkId)}
                onMouseLeave={() => setHoveredLink(null)}
              />
              {isHovered && (
                <text
                  x={midX}
                  y={(srcY + tgtY) / 2 - 8}
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-semibold pointer-events-none"
                >
                  {link.value.toLocaleString()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
