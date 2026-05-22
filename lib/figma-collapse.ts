import { resolveLayout } from "@/lib/figma-mappers";
import type { FigmaNode } from "@/lib/figma-tree";

type HiddenRange = { yStart: number; yEnd: number };

const HIDDEN_RANGES: HiddenRange[] = [
  { yStart: 4739, yEnd: 9516 },   // People@hh → Sponsors → Friends → Venue + inter-section gaps
  { yStart: 11965, yEnd: 15137 }, // Tracks → Bounties → Agenda + gap after Hackers
];

export const TOTAL_HIDDEN_HEIGHT = HIDDEN_RANGES.reduce(
  (sum, r) => sum + (r.yEnd - r.yStart),
  0,
);

function getNodeY(node: FigmaNode): number {
  const layout = resolveLayout(node.layout) as Record<string, unknown> | undefined;
  const location = layout?.locationRelativeToParent as Record<string, unknown> | undefined;
  return (location?.y as number) ?? 0;
}

function isNodeHidden(y: number): boolean {
  return HIDDEN_RANGES.some((r) => y >= r.yStart && y < r.yEnd);
}

export function getCollapseOffset(y: number): number {
  let offset = 0;
  for (const range of HIDDEN_RANGES) {
    if (y >= range.yEnd) {
      offset += range.yEnd - range.yStart;
    } else if (y > range.yStart) {
      offset += y - range.yStart;
    } else {
      break;
    }
  }
  return offset;
}

export function computeCollapseInfo(children: readonly FigmaNode[]): {
  hiddenIds: Set<string>;
  offsets: Map<string, number>;
} {
  const hiddenIds = new Set<string>();
  const offsets = new Map<string, number>();

  for (const child of children) {
    const y = getNodeY(child);
    if (isNodeHidden(y)) {
      hiddenIds.add(child.id);
    }
  }

  for (const child of children) {
    if (hiddenIds.has(child.id)) continue;
    const y = getNodeY(child);
    offsets.set(child.id, getCollapseOffset(y));
  }

  return { hiddenIds, offsets };
}
