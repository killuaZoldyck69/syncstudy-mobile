export const theme = {
  colors: {
    background: "#0e0e0e",
    surface: "#20201f",
    primary: "#ba9eff",
    primaryGradientEnd: "#864dff",
    destructive: "#ff6b6b",
    success: "#4ade80",
    textPrimary: "#ffffff",
    textSecondary: "#adaaaa",
    transparent: "transparent",
  },
  typography: {
    heading: "Manrope",
    body: "Inter",
    bodyMedium: "Inter-Medium",
    bodyBold: "Inter-Bold",
  },
  shapes: {
    radius: {
      standard: 12,
      modal: 16,
      pill: 9999,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
} as const;
