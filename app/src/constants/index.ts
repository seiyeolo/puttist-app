// 색상 테마 - 포레스트 그린
export const COLORS = {
  primary: '#2E7D32',      // 포레스트 그린
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  background: '#1A1A1A',   // 다크 배경
  surface: '#2D2D2D',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  border: '#404040',
};

// 거리 옵션 (cm)
export const DISTANCES = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];

// 아바타 옵션
export const AVATARS = ['⛳', '🏌️', '🎯', '🏆', '⭐', '🔥'];

// 게임 모드 설정
export const GAME_MODES = {
  '3-6-9': {
    name: '3-6-9 챌린지',
    description: '30cm, 60cm, 90cm 순서로 도전',
    distances: [30, 60, 90],
  },
  '7-up': {
    name: '7-up',
    description: '30cm부터 210cm까지 순서대로',
    distances: [30, 60, 90, 120, 150, 180, 210],
  },
  '7-down': {
    name: '7-down', 
    description: '210cm부터 30cm까지 역순으로',
    distances: [210, 180, 150, 120, 90, 60, 30],
  },
  '7-random': {
    name: '7 랜덤',
    description: '7개 거리 무작위 도전',
    distances: [30, 60, 90, 120, 150, 180, 210],
    random: true,
  },
  '9-random': {
    name: '9 랜덤',
    description: '9개 거리 무작위 도전',
    distances: [30, 60, 90, 120, 150, 180, 210, 240, 270],
    random: true,
  },
};
