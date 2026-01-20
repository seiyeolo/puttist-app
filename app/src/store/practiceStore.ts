import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PuttingRecord, GameSession, Statistics } from '../types';

interface PracticeState {
  records: PuttingRecord[];
  sessions: GameSession[];
  addRecord: (record: Omit<PuttingRecord, 'id' | 'timestamp'>) => void;
  getStatistics: () => Statistics;
  clearAllData: () => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      records: [],
      sessions: [],
      addRecord: (record) =>
        set((state) => ({
          records: [
            ...state.records,
            {
              ...record,
              id: Date.now().toString(),
              timestamp: new Date(),
            },
          ],
        })),
      getStatistics: () => {
        const records = get().records;
        const totalPutts = records.length;
        const successfulPutts = records.filter((r) => r.success).length;
        const successRate = totalPutts > 0 ? (successfulPutts / totalPutts) * 100 : 0;

        const byDistance: Statistics['byDistance'] = {};
        records.forEach((record) => {
          if (!byDistance[record.distance]) {
            byDistance[record.distance] = { total: 0, success: 0, rate: 0 };
          }
          byDistance[record.distance].total++;
          if (record.success) byDistance[record.distance].success++;
          byDistance[record.distance].rate =
            (byDistance[record.distance].success / byDistance[record.distance].total) * 100;
        });

        return { totalPutts, successfulPutts, successRate, byDistance };
      },
      clearAllData: () => set({ records: [], sessions: [] }),
    }),
    {
      name: 'puttist-practice',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
