"use client";

import { FigmaPageShell, useViewportWidth } from "@/components/figma-page-shell";
import { figmaRootNode, FigmaLayer } from "@/components/home/figma-home-renderer";
import { findNodeById } from "@/lib/figma-tree";

const NAV_BOTTOM = 150;
const SECTION_Y = 14178;
const SECTION_HEIGHT = 959;
const yShift = SECTION_Y - NAV_BOTTOM;
const canvasHeight = NAV_BOTTOM + SECTION_HEIGHT;

export default function AgendaPage() {
  const viewportWidth = useViewportWidth();
  const navNode = findNodeById(figmaRootNode, "54:5");
  const logoNode = findNodeById(figmaRootNode, "54:4");
  const sectionNode = findNodeById(figmaRootNode, "54:29998");

  if (!navNode || !logoNode || !sectionNode) return null;

  return (
    <FigmaPageShell canvasHeight={canvasHeight}>
      <FigmaLayer node={logoNode} depth={1} viewportWidth={viewportWidth} />
      <FigmaLayer node={navNode} depth={1} viewportWidth={viewportWidth} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${-yShift}px)` }}>
        <FigmaLayer node={sectionNode} depth={1} viewportWidth={viewportWidth} />
      </div>
    </FigmaPageShell>
  );
}
