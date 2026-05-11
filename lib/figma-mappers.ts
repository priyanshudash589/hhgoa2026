import { figmaTokens } from "./figma-tokens";

type Dict = Record<string, unknown>;

export const px = (value?: number | string | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return `${value}px`;
  return value;
};

export const resolveLayout = (layoutId?: string) =>
  layoutId ? (figmaTokens.layoutTokens[layoutId as keyof typeof figmaTokens.layoutTokens] as Dict | undefined) : undefined;

export const resolveTextStyle = (styleId?: string) =>
  styleId ? (figmaTokens.styleTokens[styleId as keyof typeof figmaTokens.styleTokens] as Dict | undefined) : undefined;

export const resolveFill = (fillId?: string) =>
  fillId
    ? (figmaTokens.fillTokens[
        fillId as keyof typeof figmaTokens.fillTokens
      ] as readonly unknown[] | undefined)
    : undefined;

type Css = Record<string, string | number | undefined>;

const normalizeColor = (value: string) => {
  if (value.startsWith("#")) return value;
  return value;
};

const normalizeFontFamily = (value?: string) => {
  if (value === "Imbue") return "var(--font-imbue)";
  if (value === "Victor Mono") return "var(--font-victor-mono)";
  if (value === "Playfair Display") return "var(--font-imbue)";
  return value;
};

const normalizeLetterSpacing = (value?: string) => {
  if (!value) return undefined;
  if (!value.endsWith("%")) return value;

  const percent = Number.parseFloat(value);
  if (!Number.isFinite(percent) || percent <= 0) return "0";
  return `${percent / 100}em`;
};

export const solidFillColor = (fillId?: string): string | undefined => {
  const fills = resolveFill(fillId);
  if (!fills?.length) return undefined;
  const first = fills[0] as Dict | string;
  if (typeof first === "string") return normalizeColor(first);
  if (first.type === "SOLID" && typeof first.color === "string") {
    return normalizeColor(first.color);
  }
  return undefined;
};

export const layoutToStyle = (layoutId?: string): Css => {
  const layout = resolveLayout(layoutId) as Dict | undefined;
  if (!layout) return {};

  const out: Css = {};
  const location = layout.locationRelativeToParent as Dict | undefined;
  const dimensions = layout.dimensions as Dict | undefined;
  const sizing = layout.sizing as Dict | undefined;
  const mode = layout.mode as string | undefined;

  if (location) {
    out.position = "absolute";
    out.left = px(location.x as number | undefined);
    out.top = px(location.y as number | undefined);
  }

  if (dimensions) {
    out.width = px(dimensions.width as number | undefined);
    out.height = px(dimensions.height as number | undefined);
  }

  if (mode && mode !== "none") {
    out.display = "flex";
    out.flexDirection = mode === "row" ? "row" : "column";
    if (layout.alignItems) out.alignItems = String(layout.alignItems);
    if (layout.justifyContent) out.justifyContent = String(layout.justifyContent);
    if (layout.gap) out.gap = px(layout.gap as string | number);
    if (layout.padding) out.padding = String(layout.padding);
  }

  if (sizing?.horizontal === "fill") out.width = "100%";
  if (sizing?.vertical === "fill") out.height = "100%";

  return out;
};

export const fillToStyle = (fillId?: string): Css => {
  const color = solidFillColor(fillId);
  return color ? { background: color } : {};
};

export const fillToTextStyle = (fillId?: string): Css => {
  const color = solidFillColor(fillId);
  return color ? { color } : {};
};

export const strokeToStyle = (strokeId?: string, strokeWeight?: string): Css => {
  const color = solidFillColor(strokeId);
  if (!color) return {};
  return {
    WebkitTextStrokeColor: color,
    WebkitTextStrokeWidth: strokeWeight,
  };
};

export const textStyleToStyle = (styleId?: string): Css => {
  const style = resolveTextStyle(styleId) as Dict | undefined;
  if (!style) return {};
  return {
    fontFamily: normalizeFontFamily(style.fontFamily as string | undefined),
    fontWeight: style.fontWeight as number | undefined,
    fontSize: px(style.fontSize as number | undefined),
    lineHeight:
      typeof style.lineHeight === "number"
        ? `${(style.lineHeight as number) * 100}%`
        : (style.lineHeight as string | undefined),
    letterSpacing: normalizeLetterSpacing(style.letterSpacing as string | undefined),
    textTransform:
      style.textCase === "UPPER"
        ? "uppercase"
        : style.textCase === "LOWER"
          ? "lowercase"
          : style.textCase === "TITLE"
            ? "capitalize"
            : undefined,
    textAlign: (style.textAlignHorizontal as string | undefined)?.toLowerCase(),
  };
};

export const effectToStyle = (effectId?: string): Css => {
  if (!effectId) return {};
  const effect = figmaTokens.effectTokens[
    effectId as keyof typeof figmaTokens.effectTokens
  ] as Dict | undefined;
  if (!effect) return {};
  if (effect.boxShadow) return { boxShadow: effect.boxShadow as string };
  return {};
};
