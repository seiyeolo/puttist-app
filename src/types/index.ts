// 사용자 프로필
export interface UserProfile {
  id: string;
  nickname: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 연습 기록
export interface PracticeRecord {
  id: string;
  userId: string;
  targetDistance: number; // 목표 거리 (미터)
  actualDistance?: number; // 실제 거리 (미터)
  isSuccess: boolean; // 성공 여부
  mode: PracticeMode; // 연습 모드
  sessionId: string; // 세션 ID
  createdAt: string;
}

// 연습 모드
export enum PracticeMode {
  NORMAL = 'NORMAL', // 일반 모드
  GAME_3_6_9 = 'GAME_3_6_9', // 3-6-9 게임
  GAME_7_UP = 'GAME_7_UP', // 7-up 게임
  GAME_7_DOWN = 'GAME_7_DOWN', // 7-down 게임
  GAME_7_RANDOM = 'GAME_7_RANDOM', // 7-random 게임
  GAME_9_RANDOM = 'GAME_9_RANDOM', // 9-random 게임
}

// 게임 세션
export interface GameSession {
  id: string;
  userId: string;
  mode: PracticeMode;
  totalAttempts: number; // 총 시도 횟수
  successfulAttempts: number; // 성공 횟수
  score: number; // 점수
  isComplete: boolean; // 완료 여부
  startedAt: string;
  completedAt?: string;
  currentStep?: number; // 현재 단계 (게임 모드용)
  currentAttempt?: number; // 현재 시도 횟수 (게임 모드용)
}

// 통계 데이터
export interface Statistics {
  totalPractices: number; // 총 연습 횟수
  totalSuccesses: number; // 총 성공 횟수
  overallSuccessRate: number; // 전체 성공률
  distanceStats: DistanceStatistics[]; // 거리별 통계
  dailyStats: DailyStatistics[]; // 일별 통계
  weeklyStats: WeeklyStatistics[]; // 주별 통계
  gameHighScores: GameHighScore[]; // 게임 최고 점수
}

// 거리별 통계
export interface DistanceStatistics {
  distance: number; // 거리 (미터)
  attempts: number; // 시도 횟수
  successes: number; // 성공 횟수
  successRate: number; // 성공률
}

// 일별 통계
export interface DailyStatistics {
  date: string; // 날짜 (YYYY-MM-DD)
  practiceCount: number; // 연습 횟수
  successCount: number; // 성공 횟수
  successRate: number; // 성공률
}

// 주별 통계
export interface WeeklyStatistics {
  weekStartDate: string; // 주 시작 날짜
  weekEndDate: string; // 주 종료 날짜
  practiceCount: number; // 연습 횟수
  successCount: number; // 성공 횟수
  successRate: number; // 성공률
}

// 게임 최고 점수
export interface GameHighScore {
  mode: PracticeMode;
  highScore: number;
  achievedAt: string;
}

// 네비게이션 타입
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  Practice: { mode: PracticeMode };
  Game: { mode: PracticeMode; sessionId: string };
  Statistics: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Practice: undefined;
  Stats: undefined;
  Settings: undefined;
};

// 설정
export interface Settings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: boolean;
  language: 'ko' | 'en';
}