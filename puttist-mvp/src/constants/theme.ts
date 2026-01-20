// Puttist Design System - Golf-inspired Premium Theme

// Color Palette
export const COLORS = {
  // Primary Colors - Golf Green Theme
  primary: '#2E7D32',        // Rich Golf Green
  primaryLight: '#4CAF50',   // Light Green
  primaryDark: '#1B5E20',    // Dark Forest Green

  // Secondary Colors
  secondary: '#FFD54F',      // Gold/Yellow for accents
  secondaryLight: '#FFECB3',
  secondaryDark: '#FFC107',

  // Background Colors
  background: '#0D1B0F',     // Deep dark green-black
  surface: '#1A2E1C',        // Slightly lighter surface
  surfaceLight: '#243826',   // Card backgrounds

  // Text Colors
  text: '#FFFFFF',
  textSecondary: '#A5D6A7',  // Light green for secondary text
  textMuted: '#6B8E6E',      // Muted green

  // Status Colors
  success: '#66BB6A',
  successLight: '#81C784',
  error: '#EF5350',
  errorLight: '#E57373',
  warning: '#FFB74D',
  info: '#42A5F5',

  // Gradient Colors
  gradientStart: '#2E7D32',
  gradientEnd: '#1B5E20',

  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',

  // Border Colors
  border: '#2E4830',
  borderLight: '#3D5940',
};

// Typography
export const TYPOGRAPHY = {
  // Font Sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,

  // Font Weights
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border Radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Game Constants (from original)
export const GAME_CONFIG = {
  MIN_DISTANCE: 1.2,
  MAX_DISTANCE: 19.9,
  SUCCESS_MARGIN: 0.5,
  THREE_SIX_NINE_DISTANCES: [3, 6, 9],
  THREE_SIX_NINE_ATTEMPTS: 3,
  SEVEN_DISTANCES: [3, 4, 5, 6, 7, 8, 9],
  NINE_DISTANCES: [3, 5, 7, 9, 11, 13, 15, 17, 19],
};

// Game Modes
export const GAME_MODES = {
  NORMAL: 'normal' as const,
  THREE_SIX_NINE: '3-6-9' as const,
  SEVEN_UP: '7-up' as const,
  SEVEN_DOWN: '7-down' as const,
  SEVEN_RANDOM: '7-random' as const,
  NINE_RANDOM: '9-random' as const,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: '@puttist_user_profile',
  PRACTICE_RECORDS: '@puttist_practice_records',
  GAME_SESSIONS: '@puttist_game_sessions',
  SETTINGS: '@puttist_settings',
};

// Avatar Options
export const AVATAR_OPTIONS = ['⛳', '🏌️', '🎯', '🏆', '⭐', '💪', '🔥', '🌟'];
