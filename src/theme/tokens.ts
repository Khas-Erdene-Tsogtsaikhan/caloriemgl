// ─── Warm Mongolian-inspired palette ───────────────────────────────
export const colors = {
  // Brand greens (warm, earthy)
  primary: '#3B9B5E',
  primaryLight: '#6BBF8A',
  primaryDark: '#2A7A45',
  primaryMuted: '#E8F5ED',

  // Warm accent (golden amber)
  secondary: '#E8943A',
  secondaryLight: '#F5B870',
  secondaryMuted: '#FFF3E0',

  // Teal accent
  accent: '#2A9D8F',
  accentMuted: '#E0F5F2',

  // Surfaces (warm off-whites)
  background: '#FAF9F6',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F3EE',
  surfaceElevated: '#FFFFFF',

  // Text (warm dark tones)
  text: '#1A1C1E',
  textSecondary: '#5C5F62',
  textTertiary: '#9B9EA2',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E5E3DE',
  borderLight: '#EFEDE8',

  // Semantic
  success: '#3B9B5E',
  warning: '#E8943A',
  error: '#DC4545',
  info: '#4A90D9',

  // Macro colors
  calorieRing: '#3B9B5E',
  proteinColor: '#4A90D9',
  carbColor: '#E8943A',
  fatColor: '#DC4545',
  waterColor: '#4AAFDB',

  // Utility
  shadow: 'rgba(26, 28, 30, 0.06)',
  overlay: 'rgba(26, 28, 30, 0.45)',

  // Gradient stops (for header)
  gradientStart: '#3B9B5E',
  gradientEnd: '#2A7A45',
};

// ─── Spacing (generous, breathable) ───────────────────────────────
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

// ─── Radii (soft, premium feel) ───────────────────────────────────
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

// ─── Typography ───────────────────────────────────────────────────
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: '400' as const, lineHeight: 16 },
  big: { fontSize: 36, fontWeight: '700' as const, lineHeight: 42 },
};

// ─── Shadows (soft, warm) ─────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#1A1C1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#1A1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1A1C1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
};
