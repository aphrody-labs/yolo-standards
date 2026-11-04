import React from "react";
import { yoloTheme } from "./theme.ts";

export interface CardProps {
  title: string;
  description: string;
}

export function Card({ title, description }: CardProps): React.JSX.Element {
  return (
    <div
      style={{
        backgroundColor: yoloTheme.colors.surface,
        borderColor: yoloTheme.colors.border,
        borderWidth: "1px",
        borderStyle: "solid",
        borderRadius: "0.5rem",
        padding: "1.5rem",
        color: yoloTheme.colors.foreground,
      }}
    >
      <h2 style={{ color: yoloTheme.colors.primary, margin: "0 0 0.5rem 0" }}>{title}</h2>
      <p style={{ margin: 0, opacity: 0.9 }}>{description}</p>
    </div>
  );
}

export function PageLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div
      style={{
        backgroundColor: yoloTheme.colors.background,
        color: yoloTheme.colors.foreground,
        minHeight: "100vh",
        fontFamily: yoloTheme.typography.fontFamily,
        padding: "2rem",
      }}
    >
      {children}
    </div>
  );
}
