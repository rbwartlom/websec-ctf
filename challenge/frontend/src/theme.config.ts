/**
 * Theme Configuration
 * 
 * Modify this file to customize the application's appearance.
 * All values use CSS/HSL format for compatibility with shadcn/ui.
 */

export const themeConfig = {
  // ==========================================================================
  // LIGHT MODE COLORS
  // ==========================================================================
  light: {
    // Base
    background: "0 0% 100%",
    foreground: "240 10% 3.9%",

    // Card / Popover
    card: "0 0% 100%",
    cardForeground: "240 10% 3.9%",
    popover: "0 0% 100%",
    popoverForeground: "240 10% 3.9%",

    // Primary (main action buttons, links)
    primary: "240 5.9% 10%",
    primaryForeground: "0 0% 98%",

    // Secondary (less prominent actions)
    secondary: "240 4.8% 95.9%",
    secondaryForeground: "240 5.9% 10%",

    // Muted (subtle backgrounds, disabled states)
    muted: "240 4.8% 95.9%",
    mutedForeground: "240 3.8% 46.1%",

    // Accent (hover states, highlights)
    accent: "240 4.8% 95.9%",
    accentForeground: "240 5.9% 10%",

    // Destructive (delete, error actions)
    destructive: "0 84.2% 60.2%",
    destructiveForeground: "0 0% 98%",

    // Borders & Inputs
    border: "240 5.9% 90%",
    input: "240 5.9% 90%",
    ring: "240 5.9% 10%",
  },

  // ==========================================================================
  // DARK MODE COLORS
  // ==========================================================================
  dark: {
    // Base
    background: "240 10% 3.9%",
    foreground: "0 0% 98%",

    // Card / Popover
    card: "240 10% 3.9%",
    cardForeground: "0 0% 98%",
    popover: "240 10% 3.9%",
    popoverForeground: "0 0% 98%",

    // Primary
    primary: "0 0% 98%",
    primaryForeground: "240 5.9% 10%",

    // Secondary
    secondary: "240 3.7% 15.9%",
    secondaryForeground: "0 0% 98%",

    // Muted
    muted: "240 3.7% 15.9%",
    mutedForeground: "240 5% 64.9%",

    // Accent
    accent: "240 3.7% 15.9%",
    accentForeground: "0 0% 98%",

    // Destructive
    destructive: "0 62.8% 30.6%",
    destructiveForeground: "0 0% 98%",

    // Borders & Inputs
    border: "240 3.7% 15.9%",
    input: "240 3.7% 15.9%",
    ring: "240 4.9% 83.9%",
  },

  // ==========================================================================
  // TYPOGRAPHY
  // ==========================================================================
  typography: {
    fontFamily: "'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  // ==========================================================================
  // RADIUS (border-radius for components)
  // ==========================================================================
  radius: "0.5rem",
};

