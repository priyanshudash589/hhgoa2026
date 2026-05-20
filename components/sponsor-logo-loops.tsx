"use client";

import type { CSSProperties } from "react";
import LogoLoop, { type LogoItem } from "@/components/ui/LogoLoop";

const cardHeight = "clamp(64px, 8vw, 111px)";
const cardWidth = `calc(${cardHeight} * 243 / 111)`;

const cardStyle: CSSProperties = {
  width: cardWidth,
  height: cardHeight,
  backgroundColor: "#0C7A4A",
  display: "grid",
  placeItems: "center",
};

const imgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  maxWidth: "78%",
  maxHeight: "70%",
  objectFit: "contain",
};

function SponsorItem({ item }: { item: LogoItem }) {
  if ("node" in item) return <div style={cardStyle}>{item.node}</div>;
  return (
    <div style={cardStyle}>
      <img src={item.src} alt={item.alt ?? ""} style={imgStyle} />
    </div>
  );
}

export default function SponsorLogoLoops({
  titleLogos,
  coPoweredLogos,
  fadeOutColor,
  headingStyle,
}: {
  titleLogos: ReadonlyArray<LogoItem>;
  coPoweredLogos: ReadonlyArray<LogoItem>;
  fadeOutColor: string;
  headingStyle: CSSProperties;
}) {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <LogoLoop
          logos={titleLogos}
          speed={90}
          direction="left"
          gap={40}
          pauseOnHover
          fadeOut
          fadeOutColor={fadeOutColor}
          ariaLabel="Title sponsors"
          renderItem={(item, key) => <SponsorItem key={key} item={item} />}
        />
        <LogoLoop
          logos={titleLogos}
          speed={90}
          direction="left"
          gap={40}
          pauseOnHover
          fadeOut
          fadeOutColor={fadeOutColor}
          ariaLabel="Title sponsors (row 2)"
          renderItem={(item, key) => <SponsorItem key={key} item={item} />}
        />
      </div>

      <div className="mx-auto mt-24 w-full max-w-6xl space-y-6">
        <h2 style={headingStyle}>Co - Powered By,</h2>
        <LogoLoop
          logos={coPoweredLogos}
          speed={90}
          direction="left"
          gap={40}
          pauseOnHover
          fadeOut
          fadeOutColor={fadeOutColor}
          ariaLabel="Co-powered by"
          renderItem={(item, key) => <SponsorItem key={key} item={item} />}
        />
        <LogoLoop
          logos={coPoweredLogos}
          speed={90}
          direction="left"
          gap={40}
          pauseOnHover
          fadeOut
          fadeOutColor={fadeOutColor}
          ariaLabel="Co-powered by (row 2)"
          renderItem={(item, key) => <SponsorItem key={key} item={item} />}
        />
      </div>
    </div>
  );
}
