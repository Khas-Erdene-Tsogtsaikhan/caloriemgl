// ─── Color palette — warm, earthy, slightly desaturated ──────────
export const colors = {
  // Brand greens (warm, earthy — slightly desaturated for sophistication)
  primary: '#34915A',
  primaryLight: '#5FB882',
  primaryDark: '#266E42',
  primaryMuted: '#EBF5EF',

  // Warm accent (golden amber)
  secondary: '#D98B35',
  secondaryLight: '#F0B468',
  secondaryMuted: '#FEF4E8',

  // Teal accent
  accent: '#2A9D8F',
  accentMuted: '#E0F5F2',

  // Surfaces (warm off-whites, subtle warmth)
  background: '#F8F7F4',
  surface: '#FFFFFF',
  surfaceAlt: '#F2F1EC',
  surfaceElevated: '#FFFFFF',

  // Text (warm dark tones, high contrast)
  text: '#1A1A1A',
  textSecondary: '#6B6E72',
  textTertiary: '#A0A3A8',
  textInverse: '#FFFFFF',

  // Borders (subtle, warm)
  border: '#E2E0DB',
  borderLight: '#ECEAE5',

  // Semantic
  success: '#34915A',
  warning: '#D98B35',
  error: '#D44040',
  info: '#4A8DD4',

  // Macro colors
  calorieRing: '#34915A',
  proteinColor: '#4A8DD4',
  carbColor: '#D98B35',
  fatColor: '#D44040',
  waterColor: '#4AACD6',

  // Utility
  shadow: 'rgba(20, 20, 22, 0.08)',
  overlay: 'rgba(20, 20, 22, 0.5)',

  // Gradient stops (for header — kept but will be used sparingly)
  gradientStart: '#34915A',
  gradientEnd: '#266E42',

  // Recipes (dark theme, MyFitnessPal-style)
  recipesBg: '#1A1A1A',
  recipesSurface: '#2D2D2D',
  recipesSurfaceAlt: '#252525',
  recipesText: '#FFFFFF',
  recipesTextSecondary: '#B0B0B0',
  recipesTextTertiary: '#808080',
  recipesBorder: '#3D3D3D',
};

// ─── Spacing — strict 4px grid ───────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

// ─── Radii — tighter, cleaner, Apple-like ────────────────────────
export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

// ─── Typography — tighter tracking on headings, optical balance ──
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: '400' as const, lineHeight: 16 },
  big: { fontSize: 36, fontWeight: '700' as const, lineHeight: 42, letterSpacing: -0.5 },
};

// ─── Shadows — visible but soft, warm ────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
};
