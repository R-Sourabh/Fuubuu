/**
 * Classic Club Theme Visual Tokens
 * Easy to read and edit for branding changes.
 */
export const COLORS = {
  // Brand Colors
  primary: '#1B4332',      // Rich English Forest Green
  primaryLight: '#2D6A4F', // Lighter Forest Green for active states
  primaryDark: '#081C15',  // Dark Forest Green
  
  // Highlight / Accent Colors
  accent: '#E0A96D',       // Elegant Gold
  live: '#C3073F',         // Crimson Red for active matches
  upcoming: '#3F51B5',     // Indigo Blue for future scheduled matches
  finished: '#555555',     // Neutral Muted grey for ended matches
  
  // Neutral Backgrounds
  background: '#F8F9FA',   // Warm Off-White Page Background
  surface: '#FFFFFF',      // Pure White Card Background
  border: '#E5E7EB',       // Soft grey border lines
  
  // Text Colors
  textPrimary: '#0F172A',  // Navy Black for headlines/primary text
  textSecondary: '#64748B',// Muted Slate grey for captions/secondary text
  textLight: '#94A3B8',    // Very light grey for labels
  textOnPrimary: '#FFFFFF',// White text when placed on top of green background
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  round: 9999,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  }
};

export const SHADOW = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2, // Android shadow support
};
