export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeRecord {
  id: string;
  userId: string;
  targetDistance: number;
  actualDistance: number;
  success: boolean;
  gameMode: GameMode | null;
  timestamp: Date;
  sessionId: string;
}

export interface GameSession {
  id: string;
  userId: string;
  gameMode: GameMode;
  totalAttempts: number;
  successCount: number;
  score: number;
  startedAt: Date;
  completedAt: Date | null;
  gameData: GameData;
  
  // 연습 시간 추적
  duration: number;  // 초 단위
  
  // 상세 결과 기록 (예: [[1,0,1], [0,1,1], [1,1,0]] - 각 거리별 시도 결과)
  // 1=성공, 0=실패
  detailedResults: number[][];
}

export type GameMode =
  | 'normal'
  | '3-6-9'
  | '7-up'
  | '7-down'
  | '7-random'
  | '9-random'
  | 'duo-ai-referee';

export interface GameData {
  currentRound?: number;
  currentDistance?: number;
  distances?: number[];
  attempts?: PracticeRecord[];
}

export interface Statistics {
  totalAttempts: number;
  totalSuccess: number;
  successRate: number;
  distanceStats: DistanceStatistic[];
  dailyPractice: DailyPractice[];
  gameModeScores: GameModeScore[];
}

export interface DistanceStatistic {
  distance: number;
  attempts: number;
  successes: number;
  successRate: number;
}

export interface DailyPractice {
  date: string;
  attempts: number;
  successes: number;
}

export interface GameModeScore {
  gameMode: GameMode;
  highScore: number;
  totalGames: number;
  averageScore: number;
}

export interface WeaknessAnalysis {
  weakestDistance: number | null;
  weakestSuccessRate: number;
  strongestDistance: number | null;
  strongestSuccessRate: number;
  improvementNeeded: number[]; // 성공률 50% 미만 거리들
  recommendations: string[];
}

export interface ProgressTrend {
  weeklyTrend: 'improving' | 'declining' | 'stable';
  recentSuccessRate: number;
  previousSuccessRate: number;
  improvementPercent: number;
  weeklyData: {
    week: string;
    successRate: number;
    attempts: number;
  }[];
}