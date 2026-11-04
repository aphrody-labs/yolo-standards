// YOLO UI Dynamic Design System Preset (Zero CSS files)
export const yoloTheme = {
  colors: {
    background: "#090d16",
    foreground: "#f8fafc",
    primary: "#38bdf8",
    secondary: "#818cf8",
    surface: "#1e293b",
    border: "#334155",
    accent: "#ec4899",
  },
  typography: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSizeBase: "16px",
    fontSizeHeading: "2rem",
  },
} as const;

export type Theme = typeof yoloTheme;
