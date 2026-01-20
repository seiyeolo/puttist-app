// 사용자 타입
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: Date;
}

// 퍼팅 기록 타입
export interface PuttingRecord {
  id: string;
  distance: number; // cm 단위
  success: boolean;
  timestamp: Date;
  gameMode?: string;
}

// 게임 모드 타입
export type GameMode = '3-6-9' | '7-up' | '7-down' | '7-random' | '9-random' | 'free';

// 게임 세션 타입
export interface GameSession {
  id: string;
  mode: GameMode;
  records: PuttingRecord[];
  score: number;
  startedAt: Date;
  endedAt?: Date;
}

// 통계 타입
export interface Statistics {
  totalPutts: number;
  successfulPutts: number;
  successRate: number;
  byDistance: {
    [key: number]: {
      total: number;
      success: number;
      rate: number;
    };
  };
}
