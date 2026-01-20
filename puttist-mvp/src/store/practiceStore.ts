import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PracticeRecord, GameSession, GameMode, Statistics, WeaknessAnalysis, ProgressTrend } from '../types';
import { STORAGE_KEYS, GAME_CONFIG } from '../constants';

// 캐시 저장소 (records/sessions 변경 시에만 무효화)
interface StatsCache {
  statistics: Map<string, { data: Statistics; recordsLength: number; sessionsLength: number }>;
  weakness: Map<string, { data: WeaknessAnalysis; recordsLength: number }>;
  progress: Map<string, { data: ProgressTrend; recordsLength: number }>;
}

const statsCache: StatsCache = {
  statistics: new Map(),
  weakness: new Map(),
  progress: new Map(),
};

// 캐시 무효화 함수
const invalidateCache = () => {
  statsCache.statistics.clear();
  statsCache.weakness.clear();
  statsCache.progress.clear();
};

interface PracticeStore {
  records: PracticeRecord[];
  sessions: GameSession[];
  currentSession: GameSession | null;

  // Record management
  addRecord: (record: Omit<PracticeRecord, 'id'>) => Promise<void>;
  loadRecords: () => Promise<void>;

  // Session management
  startGameSession: (gameMode: GameMode, userId: string) => void;
  updateSession: (updates: Partial<GameSession>) => void;
  completeSession: () => Promise<void>;
  loadSessions: () => Promise<void>;

  // Data management
  clearAllData: () => void;
  reloadAllData: () => Promise<void>;

  // Statistics
  getStatistics: (userId: string) => Statistics;
  getDistanceSuccessRate: (distance: number, userId: string) => number;
  getWeaknessAnalysis: (userId: string) => WeaknessAnalysis;
  getProgressTrend: (userId: string) => ProgressTrend;
}

export const usePracticeStore = create<PracticeStore>((set, get) => ({
  records: [],
  sessions: [],
  currentSession: null,

  addRecord: async (recordData) => {
    const newRecord: PracticeRecord = {
      ...recordData,
      id: Date.now().toString(),
    };

    const updatedRecords = [...get().records, newRecord];

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PRACTICE_RECORDS,
        JSON.stringify(updatedRecords)
      );
      invalidateCache(); // 캐시 무효화
      set({ records: updatedRecords });

      // Update current session if exists
      const currentSession = get().currentSession;
      if (currentSession) {
        const attempts = currentSession.gameData.attempts || [];
        get().updateSession({
          gameData: {
            ...currentSession.gameData,
            attempts: [...attempts, newRecord],
          },
          totalAttempts: currentSession.totalAttempts + 1,
          successCount: currentSession.successCount + (newRecord.success ? 1 : 0),
        });
      }
    } catch (error) {
      console.error('Failed to save record:', error);
      throw error;
    }
  },

  loadRecords: async () => {
    try {
      const recordsJson = await AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_RECORDS);
      if (recordsJson) {
        const records = JSON.parse(recordsJson);
        set({ records });
      }
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  },

  startGameSession: (gameMode, userId) => {
    const newSession: GameSession = {
      id: Date.now().toString(),
      userId,
      gameMode,
      totalAttempts: 0,
      successCount: 0,
      score: 0,
      startedAt: new Date(),
      completedAt: null,
      duration: 0,
      detailedResults: [],
      gameData: {
        currentRound: 0,
        attempts: [],
      },
    };

    // Initialize game-specific data
    if (gameMode === '3-6-9') {
      newSession.gameData.distances = GAME_CONFIG.THREE_SIX_NINE_DISTANCES;
      newSession.gameData.currentDistance = GAME_CONFIG.THREE_SIX_NINE_DISTANCES[0];
    } else if (gameMode === '7-up') {
      newSession.gameData.distances = GAME_CONFIG.SEVEN_DISTANCES;
      newSession.gameData.currentDistance = GAME_CONFIG.SEVEN_DISTANCES[0];
    } else if (gameMode === '7-down') {
      newSession.gameData.distances = [...GAME_CONFIG.SEVEN_DISTANCES].reverse();
      newSession.gameData.currentDistance = GAME_CONFIG.SEVEN_DISTANCES[6];
    } else if (gameMode === '7-random' || gameMode === '9-random') {
      const distances = gameMode === '7-random'
        ? [...GAME_CONFIG.SEVEN_DISTANCES].sort(() => Math.random() - 0.5)
        : [...GAME_CONFIG.NINE_DISTANCES].sort(() => Math.random() - 0.5);
      newSession.gameData.distances = distances;
      newSession.gameData.currentDistance = distances[0];
    }

    set({ currentSession: newSession });
  },

  updateSession: (updates) => {
    const currentSession = get().currentSession;
    if (!currentSession) return;

    set({
      currentSession: {
        ...currentSession,
        ...updates,
      },
    });
  },

  completeSession: async () => {
    const currentSession = get().currentSession;
    if (!currentSession) return;

    const completedSession = {
      ...currentSession,
      completedAt: new Date(),
      score: Math.round((currentSession.successCount / currentSession.totalAttempts) * 100) || 0,
    };

    const updatedSessions = [...get().sessions, completedSession];

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.GAME_SESSIONS,
        JSON.stringify(updatedSessions)
      );
      invalidateCache(); // 캐시 무효화
      set({
        sessions: updatedSessions,
        currentSession: null
      });
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  },

  loadSessions: async () => {
    try {
      const sessionsJson = await AsyncStorage.getItem(STORAGE_KEYS.GAME_SESSIONS);
      if (sessionsJson) {
        const sessions = JSON.parse(sessionsJson);
        set({ sessions });
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  },

  clearAllData: () => {
    invalidateCache(); // 캐시 무효화
    set({ records: [], sessions: [], currentSession: null });
  },

  reloadAllData: async () => {
    const { loadRecords, loadSessions } = get();
    await loadRecords();
    await loadSessions();
  },

  getStatistics: (userId) => {
    const { records, sessions } = get();

    // 캐시 확인 - records/sessions 길이가 같으면 캐시된 결과 반환
    const cached = statsCache.statistics.get(userId);
    if (cached && cached.recordsLength === records.length && cached.sessionsLength === sessions.length) {
      return cached.data;
    }

    const userRecords = records.filter(r => r.userId === userId);
    const userSessions = sessions.filter(s => s.userId === userId);

    const totalAttempts = userRecords.length;
    const totalSuccess = userRecords.filter(r => r.success).length;
    const successRate = totalAttempts > 0 ? (totalSuccess / totalAttempts) * 100 : 0;

    // Distance statistics
    const distanceMap = new Map<number, { attempts: number; successes: number }>();
    userRecords.forEach(record => {
      const distance = record.targetDistance;
      const current = distanceMap.get(distance) || { attempts: 0, successes: 0 };
      distanceMap.set(distance, {
        attempts: current.attempts + 1,
        successes: current.successes + (record.success ? 1 : 0),
      });
    });

    const distanceStats = Array.from(distanceMap.entries())
      .map(([distance, stats]) => ({
        distance,
        attempts: stats.attempts,
        successes: stats.successes,
        successRate: (stats.successes / stats.attempts) * 100,
      }))
      .sort((a, b) => a.distance - b.distance);

    // Daily practice
    const dailyMap = new Map<string, { attempts: number; successes: number }>();
    userRecords.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      const current = dailyMap.get(date) || { attempts: 0, successes: 0 };
      dailyMap.set(date, {
        attempts: current.attempts + 1,
        successes: current.successes + (record.success ? 1 : 0),
      });
    });

    const dailyPractice = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        attempts: stats.attempts,
        successes: stats.successes,
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30); // Last 30 days

    // Game mode scores
    const gameModeMap = new Map<GameMode, { highScore: number; totalGames: number; totalScore: number }>();
    userSessions.forEach(session => {
      const current = gameModeMap.get(session.gameMode) || {
        highScore: 0,
        totalGames: 0,
        totalScore: 0
      };
      gameModeMap.set(session.gameMode, {
        highScore: Math.max(current.highScore, session.score),
        totalGames: current.totalGames + 1,
        totalScore: current.totalScore + session.score,
      });
    });

    const gameModeScores = Array.from(gameModeMap.entries())
      .map(([gameMode, stats]) => ({
        gameMode,
        highScore: stats.highScore,
        totalGames: stats.totalGames,
        averageScore: stats.totalGames > 0 ? stats.totalScore / stats.totalGames : 0,
      }));

    const result: Statistics = {
      totalAttempts,
      totalSuccess,
      successRate,
      distanceStats,
      dailyPractice,
      gameModeScores,
    };

    // 캐시에 저장
    statsCache.statistics.set(userId, {
      data: result,
      recordsLength: records.length,
      sessionsLength: sessions.length,
    });

    return result;
  },

  getDistanceSuccessRate: (distance, userId) => {
    const records = get().records.filter(
      r => r.userId === userId && r.targetDistance === distance
    );
    if (records.length === 0) return 0;

    const successes = records.filter(r => r.success).length;
    return (successes / records.length) * 100;
  },

  getWeaknessAnalysis: (userId) => {
    const { records } = get();

    // 캐시 확인
    const cached = statsCache.weakness.get(userId);
    if (cached && cached.recordsLength === records.length) {
      return cached.data;
    }

    const stats = get().getStatistics(userId);
    const distanceStats = stats.distanceStats;

    if (distanceStats.length === 0) {
      const result: WeaknessAnalysis = {
        weakestDistance: null,
        weakestSuccessRate: 0,
        strongestDistance: null,
        strongestSuccessRate: 0,
        improvementNeeded: [],
        recommendations: ['연습을 시작하면 약점 분석이 표시됩니다.'],
      };
      statsCache.weakness.set(userId, { data: result, recordsLength: records.length });
      return result;
    }

    // 최소 3회 이상 시도한 거리만 분석
    const validStats = distanceStats.filter(d => d.attempts >= 3);

    if (validStats.length === 0) {
      const result: WeaknessAnalysis = {
        weakestDistance: null,
        weakestSuccessRate: 0,
        strongestDistance: null,
        strongestSuccessRate: 0,
        improvementNeeded: [],
        recommendations: ['각 거리에서 3회 이상 연습하면 분석이 시작됩니다.'],
      };
      statsCache.weakness.set(userId, { data: result, recordsLength: records.length });
      return result;
    }

    const sorted = [...validStats].sort((a, b) => a.successRate - b.successRate);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];
    const improvementNeeded = validStats
      .filter(d => d.successRate < 50)
      .map(d => d.distance)
      .sort((a, b) => a - b);

    const recommendations: string[] = [];

    if (weakest.successRate < 30) {
      recommendations.push(`${weakest.distance}m 거리에서 집중 연습이 필요합니다.`);
    } else if (weakest.successRate < 50) {
      recommendations.push(`${weakest.distance}m 거리 성공률 향상에 집중해보세요.`);
    }

    if (strongest.successRate >= 70) {
      recommendations.push(`${strongest.distance}m는 강점입니다! 유지하세요.`);
    }

    if (improvementNeeded.length > 2) {
      recommendations.push('여러 거리에서 50% 미만입니다. 기본기를 다져보세요.');
    }

    if (recommendations.length === 0) {
      recommendations.push('전반적으로 좋은 성적입니다. 꾸준히 연습하세요!');
    }

    const result: WeaknessAnalysis = {
      weakestDistance: weakest.distance,
      weakestSuccessRate: weakest.successRate,
      strongestDistance: strongest.distance,
      strongestSuccessRate: strongest.successRate,
      improvementNeeded,
      recommendations,
    };

    // 캐시에 저장
    statsCache.weakness.set(userId, { data: result, recordsLength: records.length });

    return result;
  },

  getProgressTrend: (userId) => {
    const { records } = get();

    // 캐시 확인
    const cached = statsCache.progress.get(userId);
    if (cached && cached.recordsLength === records.length) {
      return cached.data;
    }

    const userRecords = records.filter(r => r.userId === userId);

    if (userRecords.length === 0) {
      const result: ProgressTrend = {
        weeklyTrend: 'stable',
        recentSuccessRate: 0,
        previousSuccessRate: 0,
        improvementPercent: 0,
        weeklyData: [],
      };
      statsCache.progress.set(userId, { data: result, recordsLength: records.length });
      return result;
    }

    // 주간 데이터 계산 (최근 8주)
    const now = new Date();
    const weeklyData: { week: string; successRate: number; attempts: number }[] = [];

    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekRecords = userRecords.filter(r => {
        const recordDate = new Date(r.timestamp);
        return recordDate >= weekStart && recordDate < weekEnd;
      });

      if (weekRecords.length > 0) {
        const successes = weekRecords.filter(r => r.success).length;
        const successRate = (successes / weekRecords.length) * 100;

        weeklyData.push({
          week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
          successRate: Math.round(successRate),
          attempts: weekRecords.length,
        });
      }
    }

    // 역순으로 정렬 (오래된 것부터)
    weeklyData.reverse();

    // 최근 2주 vs 그 이전 2주 비교
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const recentRecords = userRecords.filter(r => new Date(r.timestamp) >= twoWeeksAgo);
    const previousRecords = userRecords.filter(r => {
      const date = new Date(r.timestamp);
      return date >= fourWeeksAgo && date < twoWeeksAgo;
    });

    const recentSuccessRate = recentRecords.length > 0
      ? (recentRecords.filter(r => r.success).length / recentRecords.length) * 100
      : 0;
    const previousSuccessRate = previousRecords.length > 0
      ? (previousRecords.filter(r => r.success).length / previousRecords.length) * 100
      : 0;

    const improvementPercent = previousSuccessRate > 0
      ? ((recentSuccessRate - previousSuccessRate) / previousSuccessRate) * 100
      : 0;

    let weeklyTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (improvementPercent > 5) {
      weeklyTrend = 'improving';
    } else if (improvementPercent < -5) {
      weeklyTrend = 'declining';
    }

    const result: ProgressTrend = {
      weeklyTrend,
      recentSuccessRate: Math.round(recentSuccessRate),
      previousSuccessRate: Math.round(previousSuccessRate),
      improvementPercent: Math.round(improvementPercent),
      weeklyData,
    };

    // 캐시에 저장
    statsCache.progress.set(userId, { data: result, recordsLength: records.length });

    return result;
  },
}));