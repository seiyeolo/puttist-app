export const COLORS = {
  primary: '#228B22', // Forest Green
  secondary: '#90EE90', // Light Green
  background: '#1a1a1a', // Dark background
  surface: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#aaaaaa',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
};

export const GAME_MODES = {
  NORMAL: 'normal' as const,
  THREE_SIX_NINE: '3-6-9' as const,
  SEVEN_UP: '7-up' as const,
  SEVEN_DOWN: '7-down' as const,
  SEVEN_RANDOM: '7-random' as const,
  NINE_RANDOM: '9-random' as const,
};

export const GAME_CONFIG = {
  MIN_DISTANCE: 1.2,
  MAX_DISTANCE: 19.9,
  SUCCESS_MARGIN: 0.5, // 50cm margin for success
  THREE_SIX_NINE_DISTANCES: [3, 6, 9],
  THREE_SIX_NINE_ATTEMPTS: 3,
  SEVEN_DISTANCES: [3, 4, 5, 6, 7, 8, 9],  // 3m ~ 9m (7개 거리)
  NINE_DISTANCES: [3, 5, 7, 9, 11, 13, 15, 17, 19],  // 3m ~ 19m (9개 거리)
};

export const STORAGE_KEYS = {
  USER_PROFILE: '@puttist_user_profile',
  PRACTICE_RECORDS: '@puttist_practice_records',
  GAME_SESSIONS: '@puttist_game_sessions',
  SETTINGS: '@puttist_settings',
};