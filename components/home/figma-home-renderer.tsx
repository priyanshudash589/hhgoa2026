"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import LogoLoop, { type LogoItem } from "@/components/ui/LogoLoop";
import { figmaHomeTree } from "@/lib/figma-home-tree";
import ScrollFloat from "@/components/ui/ScrollFloat";
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

  "54:26751": { src: "/assets/sponsor.png", alt: "Sponsors", width: 1440, height: 1236 },
  "54:26834": { src: "/assets/Venue pin.png", alt: "", width: 1441, height: 911 },
  "54:27342": { src: "/assets/hackers.png", alt: "", width: 1440, height: 804 },
  "54:27763": { src: "/assets/Bounties.png", alt: "Bounties", width: 1440, height: 973 },
  "54:30943": { src: "/assets/footer trees.png", alt: "", width: 1485, height: 941 },
} satisfies Record<string, RasterLayer>;

const TEAM_SECTION_ID = "54:8508";

// Footer logo SVG node — strip pink background fill
const SVG_NO_BG_NODE_IDS = new Set(["54:30944"]);

const FOOTER_SOCIAL_LINKS: ReadonlyMap<string, { href: string; label: string }> = new Map([
  ["54:30957", { href: "https://t.me/theprayasu", label: "@ThePrayasu on Telegram" }],
  ["54:30961", { href: "mailto:satapathyprayasu@gmail.com", label: "satapathyprayasu@gmail.com" }],
]);

// Individual node links (e.g. for split social handles or icons)
const INDIVIDUAL_NODE_LINKS: ReadonlyMap<string, { href: string; label: string }> = new Map([
  ["54:30952", { href: "https://x.com/247pmstudio", label: "2:47 pm Studio on X" }],
  ["54:30955", { href: "https://x.com/247pmstudio", label: "@247pmstudio on X" }],
  ["54:30956", { href: "https://x.com/theprayashu", label: "@theprayashu on X" }],
  ["54:30960", { href: "https://x.com/theprayashu", label: "@theprayashu on X" }],
]);

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
const DEVFOLIO_BUTTON_TEXT_ID = "54:27350";

const GENERAL_TEXT_OVERRIDES: ReadonlyMap<string, string> = new Map([
  ["54:27344", "Less Noise. More Signal"],
  [
    "54:27347",
    "Most hackathons are just hype and no substance. We’re changing that. From October 28–31, we’re taking over Goa for the country’s biggest build-station.",
  ],
  [
    "54:27348",
    "This is for the developers who live in their terminals and ship things that matter. No fluff, no useless networking—just 500 elite builders, high-speed fiber, and the ocean at your doorstep. If you’re ready to lock in and build your legacy, we’ll see you on the sand.",
  ],
]);

// Nav link nodes — Figma uses generic "page" placeholder text for all 6
const NAV_LINK_NODES: ReadonlyArray<{ id: string; label: string; href: string }> = [
  { id: "54:6", label: "About", href: "#about" },
  { id: "54:7", label: "Tracks", href: "#tracks" },
  { id: "54:8", label: "Agenda", href: "#agenda" },
  { id: "54:9", label: "Venue", href: "#venue" },
  { id: "54:10", label: "Hackers", href: "#hackers" },
  { id: "54:11", label: "Footer", href: "#footer" },
] as const;
const NAV_LINK_NODE_MAP = new Map(NAV_LINK_NODES.map((n) => [n.id, n]));

// Maps Figma section frame node IDs → the HTML anchor id they should receive
const SECTION_ANCHOR_MAP: Readonly<Record<string, string>> = {
  "54:430": "about",     // Hero details / About
  "54:433": "tracks",    // Tracks section
  "54:29998": "agenda",   // Agenda section
  "54:26834": "venue",    // Venue section
  "54:27343": "hackers",  // Hackers section
  "54:26751": "sponsors", // Sponsors section
  "54:30944": "footer",   // Footer section
} as const;

// Helper: smooth-scroll to a section anchor id
function scrollToSection(anchorId: string) {
  const el = document.getElementById(anchorId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Hero CTA route
const HERO_CTA_HREF = "#footer";

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
  "54:3904",
  "54:3908",
  "54:3912",
  "54:3916",
  "54:3921",
  "54:3925",
  "54:3929",
  "54:3933",
]);
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

  if (node.id === "54:4" && mode === "box") {
    return {
      background: "none",
    };
  }

  if (node.id === "54:427" && mode === "box") {
    return {
      background: "none",
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

  // Hero metadata: keep on a single line regardless of the Figma fixed-width box
  if ((node.id === "54:428" || node.id === "54:429") && mode === "text") {
    return {
      whiteSpace: "nowrap",
      overflowWrap: "normal",
      wordBreak: "keep-all",
      overflow: "visible",
      lineHeight: "1",
    };
  }

  // Footer metadata: center under logo, force single line
  if ((node.id === "54:30945" || node.id === "54:30946") && mode === "text") {
    return {
      whiteSpace: "nowrap",
      overflowWrap: "normal",
      wordBreak: "keep-all",
      width: "1440px", // Exact Figma width
      left: "0px",
      overflow: "visible",
      textAlign: "center",
      lineHeight: "1.4",
    };
  }

  // Footer right-col text: no wrapping
  if (
    (node.id === "54:30947" || node.id === "54:30948" || node.id === "54:30949") &&
    mode === "text"
  ) {
    return {
      whiteSpace: "nowrap",
      overflowWrap: "normal",
      wordBreak: "keep-all",
      overflow: "visible",
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

const motionFor = (node: FigmaNode, depth: number, reduceMotion: boolean) => {
  if (reduceMotion) return {};

  if (node.id === "54:427") {
    return {
      initial: { opacity: 1 },
      animate: { y: [-8, 8, -8], rotate: [-2, 2, -2] },
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
    };
  }

  // Hero nodes are above the fold — animate in immediately, not on scroll
  if (HERO_NODE_IDS.has(node.id)) {
    return {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    };
  }

  if (depth <= 1) {
    return {
      initial: { opacity: 0, y: 28 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.12 },
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    };
  }

  return {};
};

function FigmaTeamSection({
  node,
  depth,
  viewportWidth,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  const containerStyle: React.CSSProperties = {
    ...baseStyleFor(node),
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "56px",
  };

  const headingStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: "'Imbue', serif",
    fontWeight: 500,
    fontSize: "132.8px",
    lineHeight: "1.1em",
    letterSpacing: "-0.02em",
    textAlign: "center",
    color: "#FFFFFF",
    textTransform: "capitalize",
    overflow: "visible",
    whiteSpace: "pre-line",
  };

  const svgStackStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "40px",
  };

  const svgRowStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "auto",
  };

  return (
    <motion.div style={containerStyle} {...motionFor(node, depth, reduceMotion)}>
      <p style={headingStyle}>Friends @HH - GOA</p>
      <div style={svgStackStyle}>
        <img
          src="/assets/Frame 1948754923.svg"
          alt="Friends at HH Goa - row 1"
          style={svgRowStyle}
        />
        <img
          src="/assets/Frame 1948754924.svg"
          alt="Friends at HH Goa - row 2"
          style={svgRowStyle}
        />
        <img
          src="/assets/Frame 1948754925.svg"
          alt="Friends at HH Goa - row 3"
          style={svgRowStyle}
        />
      </div>
    </motion.div>
  );
}

function FigmaSponsorsSection({
  node,
  depth,
  viewportWidth,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  const SPONSORS_BG = "#FF0080";

  const containerStyle: React.CSSProperties = {
    ...boxStyleFor(node, viewportWidth),
    overflow: "hidden",
    backgroundColor: SPONSORS_BG,
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: "'Imbue', serif",
    fontWeight: 500,
    fontStyle: "normal",
    fontSize: "132.8px",
    lineHeight: "110.00000000000001%",
    letterSpacing: "-0.02em",
    textAlign: "center",
    verticalAlign: "middle",
    textTransform: "capitalize",
    color: "#FFFFFF",
  };

  const cardHeight = "clamp(64px, 5.8vw, 111px)";
  const cardWidth = `calc(${cardHeight} * 243 / 111)`;

  const cardStyle: React.CSSProperties = {
    width: cardWidth,
    height: cardHeight,
    backgroundColor: "#0C7A4A",
    display: "grid",
    placeItems: "center",
  };

  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    maxWidth: "78%",
    maxHeight: "70%",
    objectFit: "contain",
  };

  const renderSponsorItem = (item: LogoItem, key: React.Key) => {
    if ("node" in item) return <div key={key} style={cardStyle}>{item.node}</div>;
    return (
      <div key={key} style={cardStyle}>
        <img src={item.src} alt={item.alt ?? ""} style={imgStyle} />
      </div>
    );
  };

  const row: ReadonlyArray<LogoItem> = [
    { src: "/assets/Base_lockup_white 1.png", alt: "Base" },
    { src: "/assets/Aptos_Primary_WHT 2.png", alt: "Aptos" },
    { src: "/assets/Logo_white_transparent.png", alt: "HH Goa" },
    { src: "/assets/Layer_1.png", alt: "Layer" },
    { src: "/assets/Base_lockup_white 1.png", alt: "Base" },
  ];

  return (
    <motion.div
      id={SECTION_ANCHOR_MAP[node.id]}
      style={{
        ...containerStyle,
        // Ensure the section is a positioned block so absolute children work,
        // and the flow-based inner wrapper can get its full width
        position: "relative",
      }}
      {...motionFor(node, depth, reduceMotion)}
    >
      {/* Decorative texture overlay */}
      <img
        src="/assets/121-vector-54-26804.svg"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.2,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Content: uses normal flow (not absolute) so LogoLoop gets real clientWidth */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "96px",
          paddingBottom: "96px",
          paddingInline: "96px",
          gap: "48px",
          boxSizing: "border-box",
        }}
      >
        <p style={titleStyle}>Title Sponsors</p>
        <div style={{ width: "100%", maxWidth: "1260px", display: "grid", gap: "22px" }}>
          <LogoLoop
            logos={row}
            speed={100}
            direction="left"
            gap={50}
            pauseOnHover
            ariaLabel="Title sponsors"
            renderItem={renderSponsorItem}
          />
          <LogoLoop
            logos={row}
            speed={100}
            direction="left"
            gap={50}
            pauseOnHover
            ariaLabel="Title sponsors row 2"
            renderItem={renderSponsorItem}
          />
        </div>

        <p style={titleStyle}>Co-Powered By</p>
        <div style={{ width: "100%", maxWidth: "1260px", display: "grid", gap: "22px" }}>
          <LogoLoop
            logos={row}
            speed={100}
            direction="left"
            gap={50}
            pauseOnHover
            ariaLabel="Co-powered by"
            renderItem={renderSponsorItem}
          />
          <LogoLoop
            logos={row}
            speed={100}
            direction="left"
            gap={50}
            pauseOnHover
            ariaLabel="Co-powered by row 2"
            renderItem={renderSponsorItem}
          />
        </div>
      </div>
    </motion.div>
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
      id={SECTION_ANCHOR_MAP[node.id]}
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
      // Strip any Figma-baked background fill for explicitly listed SVG nodes
      ...(SVG_NO_BG_NODE_IDS.has(node.id) ? { background: "none", backgroundColor: "transparent" } : {}),
    },
    "asset",
    viewportWidth,
  );

  if (!src) return <motion.div style={style} {...motionFor(node, depth, reduceMotion)} />;

  return (
    <motion.img
      id={SECTION_ANCHOR_MAP[node.id]}
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
  isInsideLink = false,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
  faqCardId?: string;
  isInsideLink?: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const children = node.children ?? [];
  const isVenueButton = node.id === VENUE_BUTTON_ID;
  const extensionIds = BUTTON_EXTENSION_IDS_BY_FRAME[node.id];
  const visibleChildren = extensionIds ? children.filter((child) => !extensionIds.has(child.id)) : children;
  const borderlessChildren = visibleChildren.filter(
    (child) => !BUTTON_TOP_BORDER_SEGMENT_IDS.has(child.id) && !BUTTON_BOTTOM_BORDER_SEGMENT_IDS.has(child.id),
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
        className="appearance-none overflow-hidden rounded-none border-0 bg-transparent p-0"
        style={boxStyleFor(node, viewportWidth)}
        {...motionFor(node, depth, reduceMotion)}
      >
        {borderlessChildren.map((child) => (
          <FigmaLayer
            key={child.id}
            node={child}
            depth={depth + 1}
            viewportWidth={viewportWidth}
            faqCardId={faqCardId}
            isInsideLink={true} // Inside a button, no anchors allowed
          />
        ))}
        {topBorderOverlay}
        {bottomBorderOverlay}
      </motion.button>
    );
  }

  return (
    <Button
      type="button"
      aria-label={findText(node) ?? "Call to action"}
      className="overflow-hidden rounded-none border-0 bg-transparent p-0 tracking-normal shadow-none hover:opacity-100"
      style={boxStyleFor(node, viewportWidth)}
      {...motionFor(node, depth, reduceMotion)}
    >
      {borderlessChildren.map((child) => (
        <FigmaLayer
          key={child.id}
          node={child}
          depth={depth + 1}
          viewportWidth={viewportWidth}
          faqCardId={faqCardId}
          isInsideLink={true} // Inside a button, no anchors allowed
        />
      ))}
      {topBorderOverlay}
      {bottomBorderOverlay}
    </Button>
  );
}

function FigmaFaqCardLayer({
  node,
  depth,
  viewportWidth,
  isInsideLink = false,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
  isInsideLink?: boolean;
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
          <button
            type="button"
            className="w-full appearance-none border-0 bg-transparent p-0 text-left"
            aria-label={questionText}
            aria-controls={panelId}
            aria-expanded={Boolean(isOpen)}
            onClick={() => faqAccordion?.toggleFaqCard(node.id)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <p
              style={{
                ...textStyleToStyle("style_T33QPY"),
                ...fillToTextStyle("fill_3YOX9I"),
                margin: 0,
                flex: 1,
                maxWidth: "none",
              }}
            >
              {questionText}
            </p>
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-2xl leading-none text-white"
            >
              {isOpen ? "−" : "+"}
            </span>
          </button>
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
              isInsideLink={isInsideLink}
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
    <motion.div id={SECTION_ANCHOR_MAP[node.id]} style={boxStyleFor(node, viewportWidth)} {...motionFor(node, depth, reduceMotion)}>
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
            <button
              key={day}
              type="button"
              aria-pressed={isActive}
              onClick={() => agenda?.setActiveAgendaDay(day)}
              style={{
                height: "52px",
                borderRadius: "80px",
                border: "none",
                cursor: "pointer",
                padding: "12px 22px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: isActive ? "#FFFFFF" : "transparent",
                color: isActive ? "#0B6839" : "#FFFFFF",
                transition: "background-color 180ms ease, color 180ms ease",
              }}
            >
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
                }}
              >
                {day}
              </span>
            </button>
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
            {rows.map((item) => (
              <div
                key={`${activeDay}-${item.time}-${item.activity}`}
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "90px",
                  background: "#0C7A4A",
                  display: "flex",
                  alignItems: "center",
                  paddingInline: "28px",
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
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FigmaLayer({
  node,
  depth,
  viewportWidth,
  faqCardId,
  isInsideLink = false,
}: {
  node: FigmaNode;
  depth: number;
  viewportWidth: number;
  faqCardId?: string;
  isInsideLink?: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const rasterLayer = rasterLayerMap[node.id as keyof typeof rasterLayerMap];
  const footerSocialEntry = FOOTER_SOCIAL_LINKS.get(node.id);
  const individualNodeLink = INDIVIDUAL_NODE_LINKS.get(node.id);
  const link = footerSocialEntry || individualNodeLink;

  // If this node has a link OR we are already inside a link,
  // then any children are effectively inside a link.
  const nextIsInsideLink = isInsideLink || !!link;

  const wrapInLink = (content: React.ReactNode) => {
    if (isInsideLink || !link || !content) return content;
    const isMailto = link.href.startsWith("mailto:");
    return (
      <a
        href={link.href}
        target={isMailto ? undefined : "_blank"}
        rel={isMailto ? undefined : "noopener noreferrer"}
        title={link.label}
        style={{ display: "contents", cursor: "pointer" }}
      >
        {content}
      </a>
    );
  };

  if (node.id === "54:26751") {
    return <FigmaSponsorsSection node={node} depth={depth} viewportWidth={viewportWidth} />;
  }

  if (rasterLayer) {
    return wrapInLink(
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
    const faqTextOverride =
      hasFaqPlaceholderText || (faqCardId && node.id === "54:27265") ? "" : undefined;

    if (node.id === INSIDE_ROOM_HEADING_ID || node.id === INSIDE_ROOM_KICKER_ID) {
      return (
        <ScrollFloat
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.03}
          textStyle={textStyleFor(node, viewportWidth)}
          containerStyle={{
            ...boxStyleFor(node, viewportWidth),
            background: "none",
            backgroundColor: "transparent",
          }}
        >
          {GENERAL_TEXT_OVERRIDES.get(node.id) ?? node.text ?? ""}
        </ScrollFloat>
      );
    }

    const navEntry = NAV_LINK_NODE_MAP.get(node.id);
    if (navEntry) {
      const label = navEntry.label;
      return (
        <a
          href={navEntry.href}
          onClick={(e) => {
            if (navEntry.href.startsWith("#")) {
              e.preventDefault();
              document.querySelector(navEntry.href)?.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="transition-opacity hover:opacity-70 active:opacity-50"
          style={{ display: "contents" }}
        >
          <motion.p
            style={textStyleFor(node, viewportWidth)}
            {...motionFor(node, depth, reduceMotion)}
          >
            {label}
          </motion.p>
        </a>
      );
    }

    const generalOverride = GENERAL_TEXT_OVERRIDES.get(node.id);

    return wrapInLink(
      <motion.p
        style={textStyleFor(node, viewportWidth)}
        {...motionFor(node, depth, reduceMotion)}
      >
        {generalOverride ?? faqTextOverride ?? node.text ?? ""}
      </motion.p>
    );
  }

  if (node.type === "IMAGE-SVG" || node.type === "IMAGE") {
    if (faqCardId && FAQ_STRIP_NODE_IDS.has(node.id)) return null;
    if (faqCardId && node.name.toLowerCase().includes("add")) return null;
    return wrapInLink(
      <FigmaAssetLayer node={node} depth={depth} viewportWidth={viewportWidth} />
    );
  }

  if (node.id === TEAM_SECTION_ID) {
    return <FigmaTeamSection node={node} depth={depth} viewportWidth={viewportWidth} />;
  }

  if (FAQ_CARD_IDS.has(node.id)) {
    return <FigmaFaqCardLayer node={node} depth={depth} viewportWidth={viewportWidth} isInsideLink={nextIsInsideLink} />;
  }

  if (node.id === AGENDA_SECTION_FRAME_ID) {
    return (
      <FigmaAgendaSectionLayer node={node} depth={depth} viewportWidth={viewportWidth} />
    );
  }

  // Hero CTA: render as a real native <a> so navigation is never swallowed by
  // the shadcn Button's click handler.
  if (node.id === HERO_BUTTON_ID) {
    const children = node.children ?? [];
    const extensionIds = BUTTON_EXTENSION_IDS_BY_FRAME[node.id];
    const visibleChildren = extensionIds
      ? children.filter((c) => !extensionIds.has(c.id))
      : children;
    const borderlessChildren = visibleChildren.filter(
      (c) =>
        !BUTTON_TOP_BORDER_SEGMENT_IDS.has(c.id) &&
        !BUTTON_BOTTOM_BORDER_SEGMENT_IDS.has(c.id),
    );
    const topSrc = getFigmaAsset(BUTTON_TOP_BORDER_TILE_NODE_BY_FRAME[HERO_BUTTON_ID] ?? "");
    const botSrc = getFigmaAsset(BUTTON_BOTTOM_BORDER_TILE_NODE_BY_FRAME[HERO_BUTTON_ID] ?? "");
    return (
      <motion.a
        href={HERO_CTA_HREF}
        aria-label="Apply — HH Goa"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector(HERO_CTA_HREF)?.scrollIntoView({ behavior: "smooth" });
        }}
        style={{
          ...boxStyleFor(node, viewportWidth),
          textDecoration: "none",
          cursor: "pointer",
          display: "block",
          overflow: "hidden",
        }}
        {...motionFor(node, depth, reduceMotion)}
      >
        {borderlessChildren.map((child) => (
          <FigmaLayer
            key={child.id}
            node={child}
            depth={depth + 1}
            viewportWidth={viewportWidth}
            faqCardId={faqCardId}
            isInsideLink={true}
          />
        ))}
        {topSrc && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "7px",
              backgroundImage: `url(${topSrc})`,
              backgroundRepeat: "repeat-x",
              backgroundSize: "101px 7px",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        )}
        {botSrc && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              height: "7px",
              backgroundImage: `url(${botSrc})`,
              backgroundRepeat: "repeat-x",
              backgroundSize: "101px 7px",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        )}
      </motion.a>
    );
  }

  if (buttonFrameIds.has(node.id)) {
    return (
      <FigmaButtonLayer
        node={node}
        depth={depth}
        viewportWidth={viewportWidth}
        faqCardId={faqCardId}
        isInsideLink={nextIsInsideLink}
      />
    );
  }

  const children = node.children ?? [];
  const sectionAnchorId = SECTION_ANCHOR_MAP[node.id];
  return wrapInLink(
    <motion.div
      id={sectionAnchorId}
      style={boxStyleFor(node, viewportWidth)}
      {...motionFor(node, depth, reduceMotion)}
    >
      {children.map((child) => (
        <FigmaLayer
          key={child.id}
          node={child}
          depth={depth + 1}
          viewportWidth={viewportWidth}
          faqCardId={faqCardId}
          isInsideLink={nextIsInsideLink}
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

  const scale = useMemo(() => Math.min(1, viewportWidth / FIGMA_WIDTH), [viewportWidth]);
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
