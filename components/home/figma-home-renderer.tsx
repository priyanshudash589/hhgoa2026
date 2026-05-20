"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { figmaHomeTree } from "@/lib/figma-home-tree";
import { getFigmaAsset } from "@/lib/figma-assets";
import {
  effectToStyle,
  fillToStyle,
  fillToTextStyle,
  layoutToStyle,
  solidFillColor,
  strokeToStyle,
  textStyleToStyle,
} from "@/lib/figma-mappers";

type FigmaNode = {
  id: string;
  name: string;
  type: string;
  layout?: string;
  fills?: string;
  strokes?: string;
  strokeWeight?: string;
  text?: string;
  textStyle?: string;
  effects?: string;
  borderRadius?: string;
  children?: readonly FigmaNode[];
};

const rootNode = figmaHomeTree.rootNode as FigmaNode;
const FIGMA_WIDTH = 1440;
const FIGMA_HEIGHT = 16024;

type RasterLayer = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  objectFit?: React.CSSProperties["objectFit"];
};

const rasterLayerMap = {
  "54:3": { src: "/assets/Sun rise.png", alt: "", width: 1440, height: 1438 },
  "54:426": { src: "/assets/Hacker house.png", alt: "Hacker house", width: 1148, height: 237 },
  "54:3471": { src: "/assets/details.png", alt: "", width: 1440, height: 937 },
  "54:3480": { src: "/assets/agenda.png", alt: "", width: 1440, height: 872 },
  "54:3935": { src: "/assets/people row.png", alt: "People at HH Goa", width: 1282, height: 242 },
  "54:17605": { src: "/assets/people row.png", alt: "People at HH Goa", width: 1282, height: 242 },
  "54:22178": { src: "/assets/people row.png", alt: "People at HH Goa", width: 1282, height: 242 },
  "54:433": { src: "/assets/tracks.png", alt: "Tracks", width: 1440, height: 1160 },
  "54:8508": { src: "/assets/team.png", alt: "Friends at HH Goa", width: 1282, height: 966 },
  "54:26751": { src: "/assets/sponsor.png", alt: "Sponsors", width: 1440, height: 1236 },
  "54:26834": { src: "/assets/Venue pin.png", alt: "", width: 1441, height: 911 },
  "54:27342": { src: "/assets/hackers.png", alt: "", width: 1440, height: 804 },
  "54:27763": { src: "/assets/Bounties.png", alt: "Bounties", width: 1440, height: 973 },
  "54:30943": { src: "/assets/footer trees.png", alt: "", width: 1485, height: 941 },
} satisfies Record<string, RasterLayer>;

const HERO_BUTTON_ID = "54:12";
const VENUE_BUTTON_ID = "54:26841";
const DEVFOLIO_BUTTON_ID = "54:27349";
const buttonFrameIds = new Set([HERO_BUTTON_ID, VENUE_BUTTON_ID, DEVFOLIO_BUTTON_ID]);
const INSIDE_ROOM_SCENE_ID = "54:3480";
const INSIDE_ROOM_TITLE_FRAME_ID = "54:3481";
const INSIDE_ROOM_KICKER_ID = "54:3482";
const INSIDE_ROOM_HEADING_ID = "54:3483";
const GOA_PEOPLE_HEADING_ID = "54:3484";
const INSIDE_ROOM_STRIP_ID = "54:3485";
const VENUE_SCENE_ID = "54:26834";
const VENUE_BUTTON_TEXT_ID = "54:26842";
const VENUE_BUTTON_EXTENSION_IDS = new Set(["54:26945", "54:26997"]);
const HERO_BUTTON_EXTENSION_IDS = new Set(["54:116", "54:168"]);
const DEVFOLIO_BUTTON_EXTENSION_IDS = new Set(["54:27453", "54:27505"]);
const BUTTON_TOP_BORDER_SEGMENT_IDS = new Set(["54:14", "54:65", "54:26843", "54:26894", "54:27351", "54:27402"]);
const BUTTON_BOTTOM_BORDER_SEGMENT_IDS = new Set(["54:324", "54:375", "54:27153", "54:27204", "54:27661", "54:27712"]);
const BUTTON_CORNER_SEGMENT_IDS = new Set(["54:220", "54:272", "54:27049", "54:27101", "54:27557", "54:27609"]);
const BUTTON_EXTENSION_IDS_BY_FRAME: Readonly<Record<string, ReadonlySet<string>>> = {
  [HERO_BUTTON_ID]: HERO_BUTTON_EXTENSION_IDS,
  [VENUE_BUTTON_ID]: VENUE_BUTTON_EXTENSION_IDS,
  [DEVFOLIO_BUTTON_ID]: DEVFOLIO_BUTTON_EXTENSION_IDS,
};
const BUTTON_TOP_BORDER_TILE_NODE_BY_FRAME: Readonly<Record<string, string>> = {
  [HERO_BUTTON_ID]: "54:14",
  [VENUE_BUTTON_ID]: "54:26843",
  [DEVFOLIO_BUTTON_ID]: "54:27351",
};
const BUTTON_BOTTOM_BORDER_TILE_NODE_BY_FRAME: Readonly<Record<string, string>> = {
  [HERO_BUTTON_ID]: "54:324",
  [VENUE_BUTTON_ID]: "54:27153",
  [DEVFOLIO_BUTTON_ID]: "54:27661",
};
const HERO_BUTTON_TEXT_ID = "54:13";
const DEVFOLIO_BUTTON_TEXT_ID = "54:27350";
const INSIDE_ROOM_DAY_HEADING_IDS = new Set(["54:3862", "54:3863", "54:3864", "54:3865"]);
const INSIDE_ROOM_DAY_CARD_BODY_IDS = new Set([
  "54:3870",
  "54:3874",
  "54:3878",
  "54:3882",
  "54:3887",
  "54:3891",
  "54:3895",
  "54:3899",
  "54:3903",
  "54:3908",
  "54:3912",
  "54:3916",
  "54:3920",
  "54:3925",
  "54:3929",
  "54:3933",
]);

const NAV_LINKS: Record<string, string> = {
  "54:6": "#about",
  "54:7": "#agenda",
  "54:8": "#tracks",
  "54:9": "#bounties",
  "54:10": "#team",
  "54:11": "#venue",
  "54:13": "https://hacker-house-goa-2026.devfolio.co/", // CTA link
};

const SECTION_IDS: Record<string, string> = {
  "54:426": "about",
  "54:30922": "agenda",
  "54:433": "tracks",
  "54:27763": "bounties",
  "54:8508": "team",
  "54:26834": "venue",
};

const FAQ_CARD_ID_ORDER = ["54:27256", "54:27278", "54:27294", "54:27310", "54:27326"] as const;
const FAQ_CARD_IDS: ReadonlySet<string> = new Set(FAQ_CARD_ID_ORDER);
const FAQ_STRIP_NODE_IDS = new Set(["54:27257", "54:27273", "54:27289", "54:27305", "54:27321", "54:27337"]);
const FAQ_STRIP_TOP_ASSET_ID = "54:27257";
const FAQ_STRIP_BOTTOM_ASSET_ID = "54:27273";
const DEFAULT_OPEN_FAQ_CARD_ID: string | null = null;

type FaqAccordionContextValue = {
  openFaqCardId: string | null;
  toggleFaqCard: (id: string) => void;
};

const FaqAccordionContext = createContext<FaqAccordionContextValue | null>(null);

type AgendaContextValue = {
  activeAgendaDay: "Day 1" | "Day 2" | "Day 3";
  setActiveAgendaDay: (day: "Day 1" | "Day 2" | "Day 3") => void;
};

const AgendaContext = createContext<AgendaContextValue | null>(null);

const faqEntries = [
  {
    question: "Who can participate in Hacker House Goa?",
    answer:
      "Anyone with a passion for building! Whether you're a developer, designer, product manager, or just someone with great ideas - you're welcome here. Teams of 2-4 people are encouraged, but solo participants are also accepted.",
  },
  {
    question: "What should I bring to the event?",
    answer:
      "Bring your laptop, charger, any hardware you might need for your project, and your creative energy. We'll provide workspace, power outlets, WiFi, meals, and caffeine to keep you going.",
  },
  {
    question: "Is there a registration fee?",
    answer:
      "No! Participation in Hacker House Goa is completely free. We'll provide accommodation, meals, and all amenities during the 4-day event. You just need to get yourself to Goa!",
  },
  {
    question: "How are teams formed?",
    answer:
      "You can come with a pre-formed team or find teammates during our team formation session on Day 1. We'll have networking activities and a team matching board to help you find the perfect collaborators.",
  },
  {
    question: "What are the judging criteria?",
    answer:
      "Projects will be judged based on: Innovation & creativity (30%), Technical implementation (25%), Business potential (20%), Presentation quality (15%), and Impact (10%).",
  },
  {
    question: "Can I start working on my project before the event?",
    answer:
      "You can brainstorm and plan, but all code must be written during the hackathon. Using existing libraries, APIs, and frameworks is encouraged - just don't bring pre-built solutions.",
  },
] as const;

const faqQuestionTextById = Object.fromEntries(
  FAQ_CARD_ID_ORDER.map((id, index) => [id, faqEntries[index % faqEntries.length].question]),
) as Record<string, string>;
const faqAnswerTextByCardId = Object.fromEntries(
  FAQ_CARD_ID_ORDER.map((id, index) => [id, faqEntries[index % faqEntries.length].answer]),
) as Record<string, string>;

const AGENDA_SECTION_FRAME_ID = "54:29998";
const AGENDA_BACKGROUND_ASSET_ID = "54:29999";
const AGENDA_OBJECTS_ASSET_ID = "54:30001";
const AGENDA_TITLE_TEXT_ID = "54:30924";
const AGENDA_DAY_TAB_FRAME_IDS = {
  "Day 1": "54:30926",
  "Day 2": "54:30928",
  "Day 3": "54:30930",
} as const;

const agendaRowsByDay = {
  "Day 1": [
    { time: "10 AM", activity: "Check In" },
    { time: "11 AM", activity: "Opening Circle" },
    { time: "12 PM", activity: "Build Briefing" },
    { time: "2 PM", activity: "Mentor Hours" },
    { time: "6 PM", activity: "Community Dinner" },
  ],
  "Day 2": [
    { time: "9 AM", activity: "Standup + Goals" },
    { time: "11 AM", activity: "Product Checkpoint" },
    { time: "1 PM", activity: "Workshop Track" },
    { time: "4 PM", activity: "Build Sprint" },
    { time: "9 PM", activity: "Night Hacking" },
  ],
  "Day 3": [
    { time: "9 AM", activity: "Final Sprint" },
    { time: "12 PM", activity: "Demo Rehearsals" },
    { time: "2 PM", activity: "Project Demos" },
    { time: "4 PM", activity: "Jury Deliberation" },
    { time: "6 PM", activity: "Closing Ceremony" },
  ],
} as const;

const agendaDayOrder = ["Day 1", "Day 2", "Day 3"] as const;

type StyleMode = "box" | "text" | "raster" | "asset";

const findText = (node: FigmaNode): string | undefined => {
  if (node.text) return node.text;
  for (const child of node.children ?? []) {
    const value = findText(child);
    if (value) return value;
  }
  return undefined;
};

const styleOverrideFor = (
  node: FigmaNode,
  mode: StyleMode,
  viewportWidth: number,
): React.CSSProperties => {
  const isCompact = viewportWidth < 1280;
  const isNarrow = viewportWidth < 920;

  // Nav links frame — shift left and tighten gap to prevent overlapping the Apply button
  if (node.id === "54:5" && mode === "box") {
    return {
      left: "540px",
      gap: "24px",
    };
  }

  if (node.id === INSIDE_ROOM_SCENE_ID && mode === "raster") {
    return {
      left: "0px",
      width: `${FIGMA_WIDTH}px`,
      height: "872px",
    };
  }

  if (node.id === VENUE_SCENE_ID && mode === "raster") {
    return {
      left: "0px",
      width: `${FIGMA_WIDTH}px`,
      height: "911px",
      objectFit: "cover",
      objectPosition: "center",
      maxWidth: "none",
    };
  }

  if (node.id === INSIDE_ROOM_STRIP_ID && mode === "asset") {
    return {
      left: "0px",
      width: `${FIGMA_WIDTH}px`,
      height: "74px",
      objectFit: "cover",
      objectPosition: "center",
      maxWidth: "none",
    };
  }

  if (node.id === INSIDE_ROOM_TITLE_FRAME_ID && mode === "box") {
    const titleWidth = isNarrow ? 980 : isCompact ? 1020 : 1060;
    return {
      width: `${titleWidth}px`,
      left: `calc(50% - ${titleWidth / 2}px)`,
      top: isNarrow ? "3281px" : "3277px",
    };
  }

  if (node.id === INSIDE_ROOM_KICKER_ID && mode === "text") {
    return {
      width: "100%",
      textAlign: "center",
      lineHeight: "0.84em",
      letterSpacing: "-0.01em",
    };
  }

  if (node.id === INSIDE_ROOM_HEADING_ID && mode === "text") {
    return {
      width: `${isNarrow ? 980 : isCompact ? 1020 : 1060}px`,
      maxWidth: "1060px",
      textAlign: "center",
      lineHeight: isNarrow ? "1.05" : "1.1",
      letterSpacing: isNarrow ? "-0.015em" : "-0.02em",
      marginInline: "auto",
    };
  }

  if (node.id === GOA_PEOPLE_HEADING_ID && mode === "text") {
    const headingWidth = isNarrow ? 700 : isCompact ? 710 : 720;
    return {
      width: `${headingWidth}px`,
      maxWidth: `${headingWidth}px`,
      left: `calc(50% - ${headingWidth / 2}px)`,
      textAlign: "center",
      whiteSpace: "nowrap",
      overflowWrap: "normal",
      wordBreak: "keep-all",
      lineHeight: "1.1",
      letterSpacing: "-0.02em",
    };
  }

  if (INSIDE_ROOM_DAY_HEADING_IDS.has(node.id) && mode === "text") {
    const headingWidth =
      node.id === "54:3863"
        ? isNarrow
          ? "292px"
          : "304px"
        : node.id === "54:3865"
          ? isNarrow
            ? "286px"
            : "300px"
          : isNarrow
            ? "258px"
            : "274px";

    const fontSize =
      node.id === "54:3863"
        ? isNarrow
          ? "18px"
          : "20px"
        : node.id === "54:3865"
          ? isNarrow
            ? "17px"
            : "19px"
          : isNarrow
            ? "20px"
            : "22px";

    return {
      width: headingWidth,
      fontSize,
      whiteSpace: "nowrap",
      overflowWrap: "normal",
      wordBreak: "keep-all",
      lineHeight: "0.88em",
      letterSpacing: "-0.015em",
    };
  }

  if (INSIDE_ROOM_DAY_CARD_BODY_IDS.has(node.id) && mode === "text") {
    return {
      lineHeight: isNarrow ? "1.05em" : "1.1em",
      letterSpacing: "-0.01em",
    };
  }

  if (node.id === HERO_BUTTON_TEXT_ID && mode === "text") {
    return {
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      whiteSpace: "nowrap",
    };
  }

  if (node.id === VENUE_BUTTON_TEXT_ID && mode === "text") {
    return {
      whiteSpace: "nowrap",
      overflowWrap: "normal",
      wordBreak: "keep-all",
      letterSpacing: "0",
      lineHeight: "1",
      fontSize: "34px",
      left: "22px",
      top: "15px",
    };
  }

  if (node.id === DEVFOLIO_BUTTON_TEXT_ID && mode === "text") {
    return {
      whiteSpace: "nowrap",
      overflowWrap: "normal",
      wordBreak: "keep-all",
      letterSpacing: "0",
      lineHeight: "1",
    };
  }

  return {};
};

const applyStyleOverride = (
  node: FigmaNode,
  style: React.CSSProperties,
  mode: StyleMode,
  viewportWidth: number,
): React.CSSProperties => ({
  ...style,
  ...styleOverrideFor(node, mode, viewportWidth),
});

const baseStyleFor = (node: FigmaNode): React.CSSProperties => ({
  ...layoutToStyle(node.layout),
  ...effectToStyle(node.effects),
  borderRadius: node.borderRadius,
});

const boxStyleFor = (node: FigmaNode, viewportWidth: number): React.CSSProperties => {
  const style: React.CSSProperties = {
    ...baseStyleFor(node),
    ...fillToStyle(node.fills),
  };

  if ((node.children?.length ?? 0) > 0 && !style.position) {
    style.position = "relative";
  }

  return applyStyleOverride(node, style, "box", viewportWidth);
};

const textStyleFor = (node: FigmaNode, viewportWidth: number): React.CSSProperties =>
  applyStyleOverride(
    node,
    {
      ...baseStyleFor(node),
      ...fillToTextStyle(node.fills),
      ...strokeToStyle(node.strokes, node.strokeWeight),
      ...textStyleToStyle(node.textStyle),
      margin: 0,
      overflow: "visible",
      whiteSpace: "pre-line",
    },
    "text",
    viewportWidth,
  );

const rasterStyleFor = (
  node: FigmaNode,
  layer: RasterLayer,
  viewportWidth: number,
): React.CSSProperties =>
  applyStyleOverride(
    node,
    {
      ...baseStyleFor(node),
      display: "block",
      width: baseStyleFor(node).width ?? `${layer.width}px`,
      height: baseStyleFor(node).height ?? `${layer.height}px`,
      objectFit: layer.objectFit ?? "fill",
    },
    "raster",
    viewportWidth,
  );

// Hero section node IDs (above the fold, should not use whileInView)
const HERO_NODE_IDS = new Set([
  "54:3",   // Sun rise bg
  "54:4",   // Logo
  "54:5",   // Nav links frame
  "54:12",  // CTA button
  "54:426", // Hacker house image
  "54:427", // गोवा badge
  "54:428", // GOA, INDIA text
  "54:429", // 2:47 pm Studio text
  "54:430", // YouTube video frame
]);

// Animation group IDs for targeted scroll transitions
const STAT_NUMBER_IDS = new Set(["54:3472", "54:3473", "54:3474", "54:3475"]);
const STAT_LABEL_IDS = new Set(["54:3476", "54:3477", "54:3478", "54:3479"]);
const PEOPLE_ROW_IDS = new Set(["54:3935", "54:17605", "54:22178"]);
const CONTENT_RASTER_IDS = new Set(["54:8508", "54:26751", "54:27342", "54:30943"]);

const SMOOTH_EASE = [0.22, 1, 0.36, 1] as const;
const SPRING_EASE = [0.16, 1, 0.3, 1] as const;

// Staggered hero entrance — each element has a cascading delay
const HERO_STAGGER_DELAYS: Readonly<Record<string, number>> = {
  "54:3": 0,        // Sun rise bg
  "54:4": 0.08,     // Logo
  "54:5": 0.18,     // Nav links
  "54:426": 0.12,   // Hacker house text
  "54:428": 0.28,   // GOA, INDIA text
  "54:429": 0.35,   // 2:47 pm Studio
  "54:430": 0.42,   // YouTube video
  "54:12": 0.5,     // CTA button (last — draws eye)
};

// FAQ cards — stagger by position
const FAQ_CARD_STAGGER_DELAYS: Readonly<Record<string, number>> = Object.fromEntries(
  FAQ_CARD_ID_ORDER.map((id, i) => [id, i * 0.1]),
);

const motionFor = (node: FigmaNode, depth: number, reduceMotion: boolean) => {
  if (reduceMotion) return {};

  // गोवा badge — perpetual float
  if (node.id === "54:427") {
    return {
      initial: { opacity: 1 },
      animate: { y: [-8, 8, -8], rotate: [-2, 2, -2] },
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  // Hero nodes — staggered entrance on page load
  if (HERO_NODE_IDS.has(node.id)) {
    const delay = HERO_STAGGER_DELAYS[node.id] ?? 0;
    return {
      initial: { opacity: 0, y: 24, scale: 0.97 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: {
        duration: 0.7,
        delay,
        ease: SMOOTH_EASE,
        scale: { duration: 0.8, delay, ease: SPRING_EASE },
      },
    };
  }

  // Stat numbers — dramatic scale pop-in
  if (STAT_NUMBER_IDS.has(node.id)) {
    return {
      initial: { opacity: 0, scale: 0.5, y: 40 },
      whileInView: { opacity: 1, scale: 1, y: 0 },
      viewport: { once: true, amount: 0.3 },
      transition: {
        duration: 0.8,
        ease: SPRING_EASE,
        scale: { type: "spring" as const, stiffness: 180, damping: 14 },
      },
    };
  }

  // Stat labels — delayed fade-up after numbers
  if (STAT_LABEL_IDS.has(node.id)) {
    return {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.3 },
      transition: { duration: 0.5, delay: 0.25, ease: SMOOTH_EASE },
    };
  }

  // People row images — slide in from left
  if (PEOPLE_ROW_IDS.has(node.id)) {
    return {
      initial: { opacity: 0, x: -60 },
      whileInView: { opacity: 1, x: 0 },
      viewport: { once: true, amount: 0.15 },
      transition: { duration: 0.8, ease: SMOOTH_EASE },
    };
  }

  // Content raster sections — scale-up reveal
  if (CONTENT_RASTER_IDS.has(node.id)) {
    return {
      initial: { opacity: 0, scale: 0.94 },
      whileInView: { opacity: 1, scale: 1 },
      viewport: { once: true, amount: 0.1 },
      transition: { duration: 0.9, ease: SMOOTH_EASE },
    };
  }

  // Day headings — slide in from right
  if (INSIDE_ROOM_DAY_HEADING_IDS.has(node.id)) {
    return {
      initial: { opacity: 0, x: 50 },
      whileInView: { opacity: 1, x: 0 },
      viewport: { once: true, amount: 0.3 },
      transition: { duration: 0.65, ease: SMOOTH_EASE },
    };
  }

  // "Inside the room" title frame — enhanced entrance with scale
  if (node.id === INSIDE_ROOM_TITLE_FRAME_ID) {
    return {
      initial: { opacity: 0, y: 44, scale: 0.96 },
      whileInView: { opacity: 1, y: 0, scale: 1 },
      viewport: { once: true, amount: 0.15 },
      transition: { duration: 0.75, ease: SMOOTH_EASE },
    };
  }

  // FAQ cards — staggered entrance with scale
  if (FAQ_CARD_IDS.has(node.id)) {
    const faqDelay = FAQ_CARD_STAGGER_DELAYS[node.id] ?? 0;
    return {
      initial: { opacity: 0, y: 32, scale: 0.97 },
      whileInView: { opacity: 1, y: 0, scale: 1 },
      viewport: { once: true, amount: 0.1 },
      transition: { duration: 0.6, delay: faqDelay, ease: SMOOTH_EASE },
    };
  }

  // Day card body texts — subtle stagger from left
  if (INSIDE_ROOM_DAY_CARD_BODY_IDS.has(node.id)) {
    return {
      initial: { opacity: 0, x: -20 },
      whileInView: { opacity: 1, x: 0 },
      viewport: { once: true, amount: 0.3 },
      transition: { duration: 0.45, ease: SMOOTH_EASE },
    };
  }

  // Top-level sections (depth ≤ 1) — standard reveal
  if (depth <= 1) {
    return {
      initial: { opacity: 0, y: 28 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.12 },
      transition: { duration: 0.55, ease: SMOOTH_EASE },
    };
  }

  // Depth 2 frames — subtle fade-up for inner content (day card items, etc.)
  if (depth === 2 && node.type === "FRAME") {
    return {
      initial: { opacity: 0, y: 18 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.15 },
      transition: { duration: 0.45, ease: SMOOTH_EASE },
    };
  }

  // Depth 3 text — very subtle fade
  if (depth === 3 && node.type === "TEXT") {
    return {
      initial: { opacity: 0, y: 10 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.2 },
      transition: { duration: 0.4, ease: SMOOTH_EASE },
    };
  }

  return {};
};

// --- Animated counter for stat numbers ---
function AnimatedCounter({
  node,
  depth,
  viewportWidth,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion() ?? false;
  const raw = node.text ?? "0";
  const match = raw.match(/^([^0-9]*)(\d+)(.*)$/);
  const prefix = match?.[1] ?? "";
  const target = parseInt(match?.[2] ?? "0", 10);
  const suffix = match?.[3] ?? "";
  const [display, setDisplay] = useState(() => reduceMotion ? raw : `${prefix}0${suffix}`);

  useEffect(() => {
    if (!isInView || reduceMotion) return;
    const duration = 1600;
    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(`${prefix}${Math.round(target * eased)}${suffix}`);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, reduceMotion, raw, prefix, target, suffix]);

  return (
    <motion.p
      ref={ref}
      style={textStyleFor(node, viewportWidth)}
      {...motionFor(node, depth, reduceMotion)}
    >
      {display}
    </motion.p>
  );
}

function FigmaRasterLayer({
  node,
  layer,
  depth,
  viewportWidth,
}: {
  node: FigmaNode;
  layer: RasterLayer;
  depth: number;
  viewportWidth: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <motion.img
      id={SECTION_IDS[node.id]}
      src={layer.src}
      alt={layer.alt}
      aria-hidden={layer.alt ? undefined : true}
      style={rasterStyleFor(node, layer, viewportWidth)}
      {...motionFor(node, depth, reduceMotion)}
    />
  );
}

function FigmaAssetLayer({
  node,
  depth,
  viewportWidth,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const src = getFigmaAsset(node.id);
  const style = applyStyleOverride(
    node,
    {
      ...boxStyleFor(node, viewportWidth),
      objectFit: "contain",
    },
    "asset",
    viewportWidth,
  );

  if (!src) return <motion.div style={style} {...motionFor(node, depth, reduceMotion)} />;

  return (
    <motion.img
      src={src}
      alt={node.name}
      style={style}
      {...motionFor(node, depth, reduceMotion)}
    />
  );
}

function FigmaButtonLayer({
  node,
  depth,
  viewportWidth,
  faqCardId,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
  faqCardId?: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const children = node.children ?? [];
  const isVenueButton = node.id === VENUE_BUTTON_ID;
  const extensionIds = BUTTON_EXTENSION_IDS_BY_FRAME[node.id];
  const visibleChildren = extensionIds ? children.filter((child) => !extensionIds.has(child.id)) : children;
  const borderlessChildren = visibleChildren.filter(
    (child) => !BUTTON_TOP_BORDER_SEGMENT_IDS.has(child.id) && !BUTTON_BOTTOM_BORDER_SEGMENT_IDS.has(child.id) && !BUTTON_CORNER_SEGMENT_IDS.has(child.id),
  );
  const topBorderTileSrc = getFigmaAsset(BUTTON_TOP_BORDER_TILE_NODE_BY_FRAME[node.id] ?? "");
  const bottomBorderTileSrc = getFigmaAsset(BUTTON_BOTTOM_BORDER_TILE_NODE_BY_FRAME[node.id] ?? "");

  const topBorderOverlay = topBorderTileSrc ? (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "0",
        top: "0",
        width: "100%",
        height: "7px",
        backgroundImage: `url(${topBorderTileSrc})`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "left top",
        backgroundSize: "101px 7px",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  ) : null;

  const bottomBorderOverlay = bottomBorderTileSrc ? (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "0",
        bottom: "0",
        width: "100%",
        height: "7px",
        backgroundImage: `url(${bottomBorderTileSrc})`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "left top",
        backgroundSize: "101px 7px",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  ) : null;

  if (isVenueButton) {
    return (
      <motion.button
        type="button"
        aria-label={findText(node) ?? "Call to action"}
        className="appearance-none overflow-hidden rounded-none border-0 bg-transparent p-0 cursor-pointer"
        style={boxStyleFor(node, viewportWidth)}
        whileHover={reduceMotion ? {} : { scale: 1.05 }}
        whileTap={reduceMotion ? {} : { scale: 0.96 }}
        transition={{ duration: 0.2, ease: SMOOTH_EASE }}
        {...motionFor(node, depth, reduceMotion)}
      >
        {borderlessChildren.map((child) => (
          <FigmaLayer
            key={child.id}
            node={child}
            depth={depth + 1}
            viewportWidth={viewportWidth}
            faqCardId={faqCardId}
          />
        ))}
        {topBorderOverlay}
        {bottomBorderOverlay}
      </motion.button>
    );
  }

  if (node.id === DEVFOLIO_BUTTON_ID) {
    return (
      <motion.a
        href="https://hacker-house-goa-2026.devfolio.co/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={findText(node) ?? "Go to Devfolio"}
        className="block overflow-hidden rounded-none border-0 bg-transparent p-0 hover:opacity-100 cursor-pointer"
        style={boxStyleFor(node, viewportWidth)}
        whileHover={reduceMotion ? {} : { scale: 1.04 }}
        whileTap={reduceMotion ? {} : { scale: 0.97 }}
        transition={{ duration: 0.2, ease: SMOOTH_EASE }}
        {...motionFor(node, depth, reduceMotion)}
      >
        {borderlessChildren.map((child) => (
          <FigmaLayer
            key={child.id}
            node={child}
            depth={depth + 1}
            viewportWidth={viewportWidth}
            faqCardId={faqCardId}
          />
        ))}
        {topBorderOverlay}
        {bottomBorderOverlay}
      </motion.a>
    );
  }

  if (node.id === HERO_BUTTON_ID) {
    return (
      <motion.a
        href="https://hacker-house-goa-2026.devfolio.co/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={findText(node) ?? "Apply to hacker house"}
        className="cta-button-glow block overflow-hidden rounded-none border-0 bg-transparent p-0 hover:opacity-100 cursor-pointer"
        style={boxStyleFor(node, viewportWidth)}
        whileHover={reduceMotion ? {} : { scale: 1.06 }}
        whileTap={reduceMotion ? {} : { scale: 0.96 }}
        transition={{ duration: 0.2, ease: SMOOTH_EASE }}
        {...motionFor(node, depth, reduceMotion)}
      >
        {borderlessChildren.map((child) => (
          <FigmaLayer
            key={child.id}
            node={child}
            depth={depth + 1}
            viewportWidth={viewportWidth}
            faqCardId={faqCardId}
          />
        ))}
        {topBorderOverlay}
        {bottomBorderOverlay}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      aria-label={findText(node) ?? "Call to action"}
      className="cta-button-glow overflow-hidden rounded-none border-0 bg-transparent p-0 tracking-normal shadow-none hover:opacity-100 cursor-pointer"
      style={boxStyleFor(node, viewportWidth)}
      whileHover={reduceMotion ? {} : { scale: 1.06 }}
      whileTap={reduceMotion ? {} : { scale: 0.96 }}
      transition={{ duration: 0.2, ease: SMOOTH_EASE }}
      {...motionFor(node, depth, reduceMotion)}
    >
      {borderlessChildren.map((child) => (
        <FigmaLayer
          key={child.id}
          node={child}
          depth={depth + 1}
          viewportWidth={viewportWidth}
          faqCardId={faqCardId}
        />
      ))}
      {topBorderOverlay}
      {bottomBorderOverlay}
    </motion.button>
  );
}

function FigmaFaqCardLayer({
  node,
  depth,
  viewportWidth,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const faqAccordion = useContext(FaqAccordionContext);
  const children = node.children ?? [];
  const panelId = `faq-panel-${node.id.replace(":", "-")}`;
  const questionText = faqQuestionTextById[node.id] ?? findText(node) ?? "FAQ item";
  const answerText = faqAnswerTextByCardId[node.id];
  const isFirstFaqCard = node.id === FAQ_CARD_ID_ORDER[0];
  const topStripSrc = getFigmaAsset(FAQ_STRIP_TOP_ASSET_ID);
  const bottomStripSrc = getFigmaAsset(FAQ_STRIP_BOTTOM_ASSET_ID);
  const contentNode = children.find((child) => child.type === "FRAME");
  const contentStyle = contentNode ? boxStyleFor(contentNode, viewportWidth) : undefined;
  const contentLayoutStyle: React.CSSProperties | undefined = contentStyle
    ? {
        ...contentStyle,
        display: "block",
      }
    : undefined;
  const isOpen = faqAccordion?.openFaqCardId === node.id;

  return (
    <motion.div style={boxStyleFor(node, viewportWidth)} {...motionFor(node, depth, reduceMotion)}>
      {contentLayoutStyle && (
        <motion.div style={contentLayoutStyle} layout>
          {isFirstFaqCard && topStripSrc && (
            <img
              src={topStripSrc}
              alt=""
              aria-hidden
              style={{ display: "block", width: "100%", height: "auto", marginBottom: "16px" }}
            />
          )}
          <motion.button
            type="button"
            className="w-full appearance-none border-0 bg-transparent p-0 text-left cursor-pointer"
            aria-label={questionText}
            aria-controls={panelId}
            aria-expanded={Boolean(isOpen)}
            onClick={() => faqAccordion?.toggleFaqCard(node.id)}
            whileHover="hover"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <motion.p
              variants={{
                hover: { color: "#fee101", x: 4 }
              }}
              transition={{ duration: 0.2, ease: SMOOTH_EASE }}
              style={{
                ...textStyleToStyle("style_T33QPY"),
                ...fillToTextStyle("fill_3YOX9I"),
                margin: 0,
                flex: 1,
                maxWidth: "none",
              }}
            >
              {questionText}
            </motion.p>
            <motion.span
              aria-hidden
              variants={{
                hover: { scale: 1.1, borderColor: "#fee101", color: "#fee101" }
              }}
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.25, ease: SMOOTH_EASE }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-2xl leading-none text-white"
            >
              +
            </motion.span>
          </motion.button>
          <motion.p
            id={panelId}
            role="region"
            aria-label={questionText}
            initial={false}
            animate={{
              height: isOpen && answerText ? "auto" : 0,
              opacity: isOpen && answerText ? 1 : 0,
              y: isOpen && answerText ? 0 : -4,
            }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
            style={{
              ...textStyleToStyle("style_HLR0I9"),
              ...fillToTextStyle("fill_2MQ4S4"),
              margin: 0,
                marginTop: "14px",
              overflow: "hidden",
              pointerEvents: isOpen ? "auto" : "none",
                maxWidth: "none",
            }}
          >
            {answerText ?? ""}
          </motion.p>
          {bottomStripSrc && (
            <img
              src={bottomStripSrc}
              alt=""
              aria-hidden
              style={{ display: "block", width: "100%", height: "auto", marginTop: "16px" }}
            />
          )}
        </motion.div>
      )}
      {!contentStyle && (
        <div>
          {node.children?.map((child) => (
            <FigmaLayer
              key={child.id}
              node={child}
              depth={depth + 1}
              viewportWidth={viewportWidth}
              faqCardId={node.id}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function FigmaAgendaSectionLayer({
  node,
  depth,
  viewportWidth,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const agenda = useContext(AgendaContext);
  const children = node.children ?? [];
  const titleNode = children.find((child) => child.id === AGENDA_TITLE_TEXT_ID);
  const tabWrapperNode = children.find((child) => child.id === "54:30925");
  const rowsWrapperNode = children.find((child) => child.id === "54:30932");
  const rowTemplateFrame = rowsWrapperNode?.children?.[0];
  const rowTextTemplate = rowTemplateFrame?.children?.find((child) => child.type === "TEXT");
  const activeDay = agenda?.activeAgendaDay ?? "Day 1";
  const rows = agendaRowsByDay[activeDay];

  const tabShellStyle: React.CSSProperties = {
    position: "absolute",
    left: "503px",
    top: "290px",
    width: "434px",
    height: "74px",
    borderRadius: "90px",
    background: "#0C7A4A",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
  };

  const rowStackStyle: React.CSSProperties = {
    position: "absolute",
    left: "394px",
    top: "420px",
    width: "652px",
    display: "flex",
    flexDirection: "column",
    gap: "23px",
  };

  return (
    <motion.div id={SECTION_IDS[node.id]} style={boxStyleFor(node, viewportWidth)} {...motionFor(node, depth, reduceMotion)}>
      {children
        .filter((child) => child.id === AGENDA_BACKGROUND_ASSET_ID || child.id === AGENDA_OBJECTS_ASSET_ID)
        .map((child) => (
          <FigmaAssetLayer key={child.id} node={child} depth={depth + 1} viewportWidth={viewportWidth} />
        ))}

      {titleNode && (
        <p style={textStyleFor(titleNode, viewportWidth)}>
          {titleNode.text ?? "Agenda"}
        </p>
      )}

      <div style={tabShellStyle}>
        {agendaDayOrder.map((day) => {
          const frameId = AGENDA_DAY_TAB_FRAME_IDS[day];
          const frameNode = tabWrapperNode?.children?.find((child) => child.id === frameId);
          const textNode = frameNode?.children?.find((child) => child.type === "TEXT");
          const isActive = activeDay === day;

          return (
            <motion.button
              key={day}
              type="button"
              aria-pressed={isActive}
              onClick={() => agenda?.setActiveAgendaDay(day)}
              whileHover={reduceMotion ? {} : { scale: isActive ? 1 : 1.05 }}
              whileTap={reduceMotion ? {} : { scale: 0.95 }}
              style={{
                position: "relative",
                height: "52px",
                borderRadius: "80px",
                border: "none",
                cursor: "pointer",
                padding: "12px 22px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                color: isActive ? "#0B6839" : "#FFFFFF",
                transition: "color 200ms ease",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBackground"
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "#FFFFFF",
                    borderRadius: "80px",
                    zIndex: 0,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span
                style={{
                  ...(textNode ? textStyleFor(textNode, viewportWidth) : {}),
                  position: "relative",
                  left: "auto",
                  top: "auto",
                  margin: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                  color: "inherit",
                  zIndex: 1,
                }}
              >
                {day}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div style={rowStackStyle}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? {} : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", gap: "23px" }}
          >
            {rows.map((item, i) => (
              <motion.div
                key={`${activeDay}-${item.time}-${item.activity}`}
                initial={reduceMotion ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={reduceMotion ? {} : { scale: 1.02, x: 6, backgroundColor: "#0C8A53" }}
                transition={{
                  scale: { duration: 0.15, ease: "easeOut" },
                  x: { duration: 0.15, ease: "easeOut" },
                  backgroundColor: { duration: 0.15, ease: "easeOut" },
                  default: { duration: 0.4, delay: i * 0.07, ease: SMOOTH_EASE }
                }}
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "90px",
                  background: "#0C7A4A",
                  display: "flex",
                  alignItems: "center",
                  paddingInline: "28px",
                  cursor: "pointer",
                }}
              >
                <p
                  style={{
                    ...(rowTextTemplate ? textStyleFor(rowTextTemplate, viewportWidth) : {}),
                    position: "relative",
                    left: "auto",
                    top: "auto",
                    margin: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                    color: "#FFFFFF",
                  }}
                >
                  {item.time} | {item.activity}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const BOUNTIES = Array(9).fill({ sponsor: "nillion", amount: "$2000" });

function BountiesDivider() {
  return (
    <div style={{ width: "100%", height: "14px", position: "relative" }}>
      <div style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "3px", background: "#FFFFFF" }} />
      <svg width="100%" height="6" style={{ position: "absolute", top: "6px", left: "0" }} preserveAspectRatio="none">
        <defs>
          <pattern id="bounty-triangles" x="0" y="0" width="16" height="6" patternUnits="userSpaceOnUse">
            <polygon points="0,0 16,0 8,6" fill="#FFFFFF" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#bounty-triangles)" />
      </svg>
    </div>
  );
}

function FigmaBountiesSectionLayer({
  node,
  depth,
  viewportWidth,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.div id={SECTION_IDS[node.id]} style={{ ...boxStyleFor(node, viewportWidth), background: "#FF0080" }} {...motionFor(node, depth, reduceMotion)}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", justifyContent: "center", padding: "0 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px", rowGap: "80px" }}>
          {BOUNTIES.map((bounty, i) => (
            <motion.div
              key={i}
              initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={reduceMotion ? {} : { scale: 1.04, y: -6 }}
              transition={{
                layout: { duration: 0.2 },
                scale: { duration: 0.2, ease: "easeOut" },
                y: { duration: 0.2, ease: "easeOut" },
                default: { duration: 0.5, delay: i * 0.06, ease: SMOOTH_EASE }
              }}
              style={{ display: "flex", flexDirection: "column", gap: "24px", cursor: "pointer" }}
            >
              <BountiesDivider />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#FFFFFF" }}>
                <span className="font-sans font-bold" style={{ fontSize: "42px", letterSpacing: "-1px" }}>{bounty.sponsor}</span>
                <span className="font-heading" style={{ fontSize: "64px", letterSpacing: "1px" }}>{bounty.amount}</span>
              </div>
              <BountiesDivider />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const TRACKS = Array(4).fill({
  title: "Privacy",
  description: "Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever Since The 1500s, When An Unknown Printer Took A Galley Of Type And Scrambled It To Make A Type Specimen Book. It Has Survived Not Only Five Centuries",
});

function TracksDivider() {
  return (
    <div style={{ width: "100%", height: "24px", position: "relative", background: "#FF0080" }}>
      <svg width="100%" height="24" preserveAspectRatio="none">
        <defs>
          <pattern id="tracks-floral" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="24" height="24" fill="#0B6839" />
            <circle cx="12" cy="12" r="4" fill="#FF0080" />
            <polygon points="12,2 14,8 20,12 14,16 12,22 10,16 4,12 10,8" fill="#FEE101" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#tracks-floral)" />
      </svg>
    </div>
  );
}

function FigmaTracksSectionLayer({
  node,
  depth,
  viewportWidth,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.div id={SECTION_IDS[node.id]} style={{ ...boxStyleFor(node, viewportWidth), background: "#FEE101" }} {...motionFor(node, depth, reduceMotion)}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", justifyContent: "center", padding: "80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "40px" }}>
          {TRACKS.map((track, i) => (
            <div key={i} style={{ background: "#0B6839", display: "flex", flexDirection: "column" }}>
              <TracksDivider />
              <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
                <h3 className="font-heading" style={{ color: "#FFFFFF", fontSize: "72px", lineHeight: 1, margin: 0 }}>{track.title}</h3>
                <p className="font-sans" style={{ color: "#FFFFFF", fontSize: "24px", lineHeight: 1.4, margin: 0 }}>{track.description}</p>
              </div>
              <TracksDivider />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function FigmaLayer({
  node,
  depth,
  viewportWidth,
  faqCardId,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
  faqCardId?: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const rasterLayer = rasterLayerMap[node.id as keyof typeof rasterLayerMap];
  if (rasterLayer) {
    if (node.id === "54:27763") {
      return <FigmaBountiesSectionLayer node={node} depth={depth} viewportWidth={viewportWidth} />;
    }
    return (
      <FigmaRasterLayer
        node={node}
        layer={rasterLayer}
        depth={depth}
        viewportWidth={viewportWidth}
      />
    );
  }

  if (node.type === "TEXT") {
    const hasFaqPlaceholderText = faqCardId ? /lorem\s+ipsum/i.test(node.text ?? "") : false;
    const faqTextOverride = hasFaqPlaceholderText || (faqCardId && node.id === "54:27265") ? "" : undefined;

    // Stat numbers — render animated counter
    if (STAT_NUMBER_IDS.has(node.id)) {
      return <AnimatedCounter node={node} depth={depth} viewportWidth={viewportWidth} />;
    }
    
    const href = node.id !== "54:13" ? NAV_LINKS[node.id] : undefined;
    if (href) {
      return (
        <motion.a 
          href={href} 
          style={{ ...textStyleFor(node, viewportWidth), textDecoration: "none", cursor: "pointer" }} 
          whileHover={reduceMotion ? {} : { scale: 1.08, color: "#fee101" }}
          transition={{ duration: 0.2 }}
          {...motionFor(node, depth, reduceMotion)}
        >
          {faqTextOverride ?? node.text ?? ""}
        </motion.a>
      );
    }

    return (
      <motion.p style={textStyleFor(node, viewportWidth)} {...motionFor(node, depth, reduceMotion)}>
        {faqTextOverride ?? node.text ?? ""}
      </motion.p>
    );
  }

  if (node.type === "IMAGE-SVG" || node.type === "IMAGE") {
    if (faqCardId && FAQ_STRIP_NODE_IDS.has(node.id)) return null;
    if (faqCardId && node.name.toLowerCase().includes("add")) return null;
    return <FigmaAssetLayer node={node} depth={depth} viewportWidth={viewportWidth} />;
  }

  if (FAQ_CARD_IDS.has(node.id)) {
    return <FigmaFaqCardLayer node={node} depth={depth} viewportWidth={viewportWidth} />;
  }

  if (node.id === AGENDA_SECTION_FRAME_ID) {
    return <FigmaAgendaSectionLayer node={node} depth={depth} viewportWidth={viewportWidth} />;
  }

  if (buttonFrameIds.has(node.id)) {
    return <FigmaButtonLayer node={node} depth={depth} viewportWidth={viewportWidth} faqCardId={faqCardId} />;
  }

  const children = node.children ?? [];
  return (
    <motion.div style={boxStyleFor(node, viewportWidth)} {...motionFor(node, depth, reduceMotion)}>
      {children.map((child) => (
        <FigmaLayer
          key={child.id}
          node={child}
          depth={depth + 1}
          viewportWidth={viewportWidth}
          faqCardId={faqCardId}
        />
      ))}
    </motion.div>
  );
}

export function FigmaHomeRenderer() {
  const [viewportWidth, setViewportWidth] = useState(1440);
  const [openFaqCardId, setOpenFaqCardId] = useState<string | null>(DEFAULT_OPEN_FAQ_CARD_ID);
  const [activeAgendaDay, setActiveAgendaDay] = useState<"Day 1" | "Day 2" | "Day 3">("Day 1");

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
    overflow: "hidden",
    width: `${FIGMA_WIDTH}px`,
    height: `${FIGMA_HEIGHT}px`,
    transform: `translateX(-50%) scale(${scale})`,
    transformOrigin: "top center",
    background: solidFillColor(rootNode.fills) ?? "#0B6839",
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-brand-primary"
      style={{ height: `${FIGMA_HEIGHT * scale}px` }}
    >
      <main style={rootStyle} aria-label="HH Goa home page">
        <AgendaContext.Provider value={agendaValue}>
          <FaqAccordionContext.Provider value={faqAccordionValue}>
            {(rootNode.children ?? []).map((child) => (
              <FigmaLayer key={child.id} node={child} depth={1} viewportWidth={viewportWidth} />
            ))}
          </FaqAccordionContext.Provider>
        </AgendaContext.Provider>
      </main>
    </section>
  );
}
