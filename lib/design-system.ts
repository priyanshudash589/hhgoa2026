export const colors = {
  primary: "#0B6839",
  primaryLight: "#0B683920",
  accent: "#FEE101",
  accentDark: "#E5CB00",
  pink: "#FF0080",
  pinkDark: "#D9006D",
  black: "#000000",
  offWhite: "#FFFBDA",
  white: "#FFFFFF",
} as const;

export const fonts = {
  heading: "var(--font-imbue)",
  body: "var(--font-victor-mono)",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const spacing = {
  section: "py-20 md:py-32 lg:py-40",
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
} as const;

export const zIndex = {
  navbar: 50,
  overlay: 100,
  modal: 200,
} as const;
