"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { figmaHomeTree } from "@/lib/figma-home-tree";
import { solidFillColor } from "@/lib/figma-mappers";
import {
  FaqAccordionContext,
  AgendaContext,
} from "@/components/home/figma-home-renderer";

const FIGMA_WIDTH = 1440;

const rootNode = figmaHomeTree.rootNode as { fills?: string };

export function useViewportWidth() {
  const [viewportWidth, setViewportWidth] = useState(1440);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return viewportWidth;
}

export function FigmaPageShell({
  children,
  canvasHeight,
}: {
  children: ReactNode;
  canvasHeight: number;
}) {
  const viewportWidth = useViewportWidth();
  const [openFaqCardId, setOpenFaqCardId] = useState<string | null>(null);
  const [activeAgendaDay, setActiveAgendaDay] = useState<"Day 1" | "Day 2" | "Day 3">("Day 1");

  const scale = useMemo(() => viewportWidth / FIGMA_WIDTH, [viewportWidth]);

  const toggleFaqCard = useCallback((id: string) => {
    setOpenFaqCardId((current) => (current === id ? null : id));
  }, []);

  const faqAccordionValue = useMemo(
    () => ({ openFaqCardId, toggleFaqCard }),
    [openFaqCardId, toggleFaqCard],
  );
  const agendaValue = useMemo(
    () => ({ activeAgendaDay, setActiveAgendaDay }),
    [activeAgendaDay],
  );

  const rootStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: 0,
    overflow: "visible",
    width: `${FIGMA_WIDTH}px`,
    height: `${canvasHeight}px`,
    transform: `translateX(-50%) scale(${scale})`,
    transformOrigin: "top center",
    background: solidFillColor(rootNode.fills) ?? "#0B6839",
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-brand-primary"
      style={{
        height: `${canvasHeight * scale}px`,
        minHeight: `${canvasHeight * scale}px`,
      }}
    >
      <main style={rootStyle}>
        <AgendaContext.Provider value={agendaValue}>
          <FaqAccordionContext.Provider value={faqAccordionValue}>
            {children}
          </FaqAccordionContext.Provider>
        </AgendaContext.Provider>
      </main>
    </section>
  );
}
