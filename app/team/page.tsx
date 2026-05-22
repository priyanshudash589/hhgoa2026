"use client";

import { FigmaPageShell, useViewportWidth } from "@/components/figma-page-shell";
import { figmaRootNode, FigmaLayer } from "@/components/home/figma-home-renderer";
import { findNodeById } from "@/lib/figma-tree";

const NAV_BOTTOM = 150;
const TEAM_Y_MIN = 4941;
const TEAM_HEIGHT = 900;
const yShift = TEAM_Y_MIN - NAV_BOTTOM;
const canvasHeight = NAV_BOTTOM + TEAM_HEIGHT;
const TEAM_NODE_IDS = ["54:3935", "54:17605", "54:22178"];

export default function TeamPage() {
  const viewportWidth = useViewportWidth();
  const navNode = findNodeById(figmaRootNode, "54:5");
  const logoNode = findNodeById(figmaRootNode, "54:4");
  const teamNodes = TEAM_NODE_IDS
    .map((id) => findNodeById(figmaRootNode, id))
    .filter(Boolean);

  if (!navNode || !logoNode || teamNodes.length !== 3) return null;

  return (
    <FigmaPageShell canvasHeight={canvasHeight}>
      <FigmaLayer node={logoNode} depth={1} viewportWidth={viewportWidth} />
      <FigmaLayer node={navNode} depth={1} viewportWidth={viewportWidth} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${-yShift}px)` }}>
        {teamNodes.map((node) => (
          <FigmaLayer key={node!.id} node={node!} depth={1} viewportWidth={viewportWidth} />
        ))}
      </div>
    </FigmaPageShell>
  );
}
