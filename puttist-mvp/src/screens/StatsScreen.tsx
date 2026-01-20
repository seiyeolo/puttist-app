import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { usePracticeStore } from '../store/practiceStore';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '../constants/theme';
import { Statistics, WeaknessAnalysis, ProgressTrend } from '../types';

const screenWidth = Dimensions.get('window').width - SPACING.xl * 2;

const chartConfig = {
  backgroundGradientFrom: COLORS.surface,
  backgroundGradientTo: COLORS.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  labelColor: () => COLORS.textSecondary,
  style: {
    borderRadius: RADIUS.lg,
  },
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: COLORS.primary,
  },
  propsForBackgroundLines: {
    stroke: COLORS.border,
    strokeDasharray: '',
  },
};

export default function StatsScreen() {
  const user = useUserStore((state) => state.user);
  const { getStatistics, getWeaknessAnalysis, getProgressTrend, loadRecords, loadSessions } = usePracticeStore();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [weakness, setWeakness] = useState<WeaknessAnalysis | null>(null);
  const [progress, setProgress] = useState<ProgressTrend | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // 병렬로 데이터 로딩
      await Promise.all([loadRecords(), loadSessions()]);
      if (user) {
        // 통계 함수들은 이미 캐싱되어 있으므로 순차 호출해도 빠름
        setStats(getStatistics(user.id));
        setWeakness(getWeaknessAnalysis(user.id));
        setProgress(getProgressTrend(user.id));
      }
    };
    loadData();
  }, [user, loadRecords, loadSessions, getStatistics, getWeaknessAnalysis, getProgressTrend]);

  // 차트 데이터 메모이제이션 - hooks는 조건부 return 전에 호출해야 함
  const distanceChartData = useMemo(() => {
    if (!stats) return { labels: ['없음'], datasets: [{ data: [0] }] };
    const distances = stats.distanceStats.slice(0, 7);
    if (distances.length === 0) {
      return { labels: ['없음'], datasets: [{ data: [0] }] };
    }
    return {
      labels: distances.map((d) => `${d.distance}m`),
      datasets: [{ data: distances.map((d) => d.successRate) }],
    };
  }, [stats]);

  const dailyChartData = useMemo(() => {
    if (!stats) return { labels: ['없음'], datasets: [{ data: [0] }] };
    const dailyData = stats.dailyPractice.slice(0, 7).reverse();
    if (dailyData.length === 0) {
      return { labels: ['없음'], datasets: [{ data: [0] }] };
    }
    return {
      labels: dailyData.map((d) => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [{ data: dailyData.map((d) => d.attempts) }],
    };
  }, [stats]);

  const progressChartData = useMemo(() => {
    if (!progress || progress.weeklyData.length === 0) {
      return { labels: ['없음'], datasets: [{ data: [0] }] };
    }
    return {
      labels: progress.weeklyData.map((w) => w.week),
      datasets: [{ data: progress.weeklyData.map((w) => w.successRate) }],
    };
  }, [progress]);

  // 트렌드 관련 메모이제이션
  const trendInfo = useMemo(() => {
    if (!progress) {
      return { icon: 'remove' as const, color: COLORS.textSecondary, text: '데이터 부족' };
    }
    switch (progress.weeklyTrend) {
      case 'improving':
        return { icon: 'trending-up' as const, color: COLORS.success, text: '향상 중' };
      case 'declining':
        return { icon: 'trending-down' as const, color: COLORS.error, text: '하락 중' };
      default:
        return { icon: 'remove' as const, color: COLORS.textSecondary, text: '유지 중' };
    }
  }, [progress]);

  // 조건부 return은 모든 hooks 호출 후에
  if (!stats) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <Ionicons name="stats-chart" size={48} color={COLORS.primary} />
          <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="stats-chart" size={24} color={COLORS.primary} />
            <Text style={styles.title}>통계</Text>
          </View>

          {/* Overall Stats Card */}
          <View style={styles.overallCard}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.overallGradient}
            >
              <Text style={styles.overallTitle}>전체 통계</Text>
              <View style={styles.overallStats}>
                <View style={styles.overallStatItem}>
                  <Text style={styles.overallStatValue}>{stats.totalAttempts}</Text>
                  <Text style={styles.overallStatLabel}>총 연습</Text>
                </View>
                <View style={styles.overallStatDivider} />
                <View style={styles.overallStatItem}>
                  <Text style={styles.overallStatValue}>{stats.totalSuccess}</Text>
                  <Text style={styles.overallStatLabel}>성공</Text>
                </View>
                <View style={styles.overallStatDivider} />
                <View style={styles.overallStatItem}>
                  <Text style={styles.overallStatValue}>
                    {Math.round(stats.successRate)}%
                  </Text>
                  <Text style={styles.overallStatLabel}>성공률</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Progress Trend Card */}
          {progress && (
            <View style={styles.trendCard}>
              <View style={styles.chartHeader}>
                <Ionicons name="trending-up" size={20} color={COLORS.primaryLight} />
                <Text style={styles.chartTitle}>실력 향상 추이</Text>
              </View>

              <View style={styles.trendSummary}>
                <View style={styles.trendItem}>
                  <Ionicons name={trendInfo.icon} size={24} color={trendInfo.color} />
                  <Text style={[styles.trendStatus, { color: trendInfo.color }]}>
                    {trendInfo.text}
                  </Text>
                </View>
                <View style={styles.trendCompare}>
                  <View style={styles.trendCompareItem}>
                    <Text style={styles.trendCompareValue}>{progress.recentSuccessRate}%</Text>
                    <Text style={styles.trendCompareLabel}>최근 2주</Text>
                  </View>
                  <View style={styles.trendArrow}>
                    <Ionicons
                      name={progress.improvementPercent >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={16}
                      color={progress.improvementPercent >= 0 ? COLORS.success : COLORS.error}
                    />
                    <Text style={[
                      styles.trendPercent,
                      { color: progress.improvementPercent >= 0 ? COLORS.success : COLORS.error }
                    ]}>
                      {Math.abs(progress.improvementPercent)}%
                    </Text>
                  </View>
                  <View style={styles.trendCompareItem}>
                    <Text style={styles.trendCompareValue}>{progress.previousSuccessRate}%</Text>
                    <Text style={styles.trendCompareLabel}>이전 2주</Text>
                  </View>
                </View>
              </View>

              {progress.weeklyData.length > 1 && (
                <LineChart
                  data={progressChartData}
                  width={screenWidth - SPACING.lg * 2}
                  height={160}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(129, 199, 132, ${opacity})`,
                  }}
                  style={styles.chart}
                  bezier
                  fromZero
                />
              )}
            </View>
          )}

          {/* Weakness Analysis Card */}
          {weakness && (
            <View style={styles.weaknessCard}>
              <View style={styles.chartHeader}>
                <Ionicons name="fitness" size={20} color={COLORS.error} />
                <Text style={styles.chartTitle}>약점 분석</Text>
              </View>

              {weakness.weakestDistance && weakness.strongestDistance ? (
                <>
                  <View style={styles.strengthWeakRow}>
                    <View style={[styles.strengthWeakItem, styles.weakItem]}>
                      <View style={styles.strengthWeakIcon}>
                        <Ionicons name="arrow-down" size={20} color={COLORS.error} />
                      </View>
                      <Text style={styles.strengthWeakLabel}>약점 거리</Text>
                      <Text style={styles.strengthWeakDistance}>{weakness.weakestDistance}m</Text>
                      <Text style={[styles.strengthWeakRate, { color: COLORS.error }]}>
                        {Math.round(weakness.weakestSuccessRate)}%
                      </Text>
                    </View>
                    <View style={[styles.strengthWeakItem, styles.strongItem]}>
                      <View style={styles.strengthWeakIcon}>
                        <Ionicons name="arrow-up" size={20} color={COLORS.success} />
                      </View>
                      <Text style={styles.strengthWeakLabel}>강점 거리</Text>
                      <Text style={styles.strengthWeakDistance}>{weakness.strongestDistance}m</Text>
                      <Text style={[styles.strengthWeakRate, { color: COLORS.success }]}>
                        {Math.round(weakness.strongestSuccessRate)}%
                      </Text>
                    </View>
                  </View>

                  {weakness.improvementNeeded.length > 0 && (
                    <View style={styles.improvementSection}>
                      <Text style={styles.improvementTitle}>개선 필요 거리 (50% 미만)</Text>
                      <View style={styles.improvementTags}>
                        {weakness.improvementNeeded.map((d) => (
                          <View key={d} style={styles.improvementTag}>
                            <Text style={styles.improvementTagText}>{d}m</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.recommendationSection}>
                    {weakness.recommendations.map((rec, idx) => (
                      <View key={idx} style={styles.recommendationItem}>
                        <Ionicons name="bulb" size={16} color={COLORS.secondary} />
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.noDataMessage}>
                  <Ionicons name="information-circle" size={24} color={COLORS.textMuted} />
                  <Text style={styles.noDataText}>{weakness.recommendations[0]}</Text>
                </View>
              )}
            </View>
          )}

          {/* Distance Success Rate Chart */}
          {stats.distanceStats.length > 0 && (
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Ionicons name="flag" size={20} color={COLORS.primary} />
                <Text style={styles.chartTitle}>거리별 성공률</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={distanceChartData}
                  width={Math.max(screenWidth, stats.distanceStats.length * 60)}
                  height={200}
                  chartConfig={{
                    ...chartConfig,
                    barPercentage: 0.6,
                  }}
                  style={styles.chart}
                  yAxisLabel=""
                  yAxisSuffix="%"
                  fromZero
                  showValuesOnTopOfBars
                />
              </ScrollView>
            </View>
          )}

          {/* Daily Practice Chart */}
          {stats.dailyPractice.length > 0 && (
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Ionicons name="calendar" size={20} color={COLORS.secondary} />
                <Text style={styles.chartTitle}>일별 연습량</Text>
              </View>
              <LineChart
                data={dailyChartData}
                width={screenWidth}
                height={200}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 213, 79, ${opacity})`,
                }}
                style={styles.chart}
                bezier
                fromZero
              />
            </View>
          )}

          {/* Game Mode Scores */}
          {stats.gameModeScores.length > 0 && (
            <View style={styles.gameModeCard}>
              <View style={styles.chartHeader}>
                <Ionicons name="game-controller" size={20} color={COLORS.primaryLight} />
                <Text style={styles.chartTitle}>게임 모드 점수</Text>
              </View>
              {stats.gameModeScores.map((score) => (
                <View key={score.gameMode} style={styles.gameModeItem}>
                  <View style={styles.gameModeHeader}>
                    <Text style={styles.gameModeTitle}>{score.gameMode}</Text>
                    <View style={styles.gameCountBadge}>
                      <Text style={styles.gameCountText}>{score.totalGames}게임</Text>
                    </View>
                  </View>
                  <View style={styles.gameModeStats}>
                    <View style={styles.gameModeStatItem}>
                      <Text style={styles.gameModeStatValue}>{score.highScore}%</Text>
                      <Text style={styles.gameModeStatLabel}>최고점</Text>
                    </View>
                    <View style={styles.gameModeStatItem}>
                      <Text style={styles.gameModeStatValue}>
                        {Math.round(score.averageScore)}%
                      </Text>
                      <Text style={styles.gameModeStatLabel}>평균</Text>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(score.averageScore, 100)}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {stats.totalAttempts === 0 && (
            <View style={styles.emptyCard}>
              <Ionicons name="golf" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
              <Text style={styles.emptyText}>
                연습을 시작하면 여기에 통계가 표시됩니다
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: SPACING.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },

  // Overall Card
  overallCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  overallGradient: {
    padding: SPACING.xl,
  },
  overallTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  overallStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  overallStatValue: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  overallStatLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.secondaryLight,
    marginTop: SPACING.xs,
  },
  overallStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.overlayLight,
  },

  // Trend Card
  trendCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  trendSummary: {
    marginBottom: SPACING.md,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  trendStatus: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
  },
  trendCompare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  trendCompareItem: {
    alignItems: 'center',
  },
  trendCompareValue: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  trendCompareLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  trendArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendPercent: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
  },

  // Weakness Card
  weaknessCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  strengthWeakRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  strengthWeakItem: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  weakItem: {
    backgroundColor: COLORS.error + '15',
  },
  strongItem: {
    backgroundColor: COLORS.success + '15',
  },
  strengthWeakIcon: {
    marginBottom: SPACING.xs,
  },
  strengthWeakLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  strengthWeakDistance: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  strengthWeakRate: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
  },
  improvementSection: {
    marginBottom: SPACING.lg,
  },
  improvementTitle: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  improvementTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  improvementTag: {
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  improvementTagText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.medium,
  },
  recommendationSection: {
    gap: SPACING.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.secondary + '10',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  recommendationText: {
    flex: 1,
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    lineHeight: 20,
  },
  noDataMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
  },
  noDataText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },

  // Chart Card
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  chartTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
  },
  chart: {
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },

  // Game Mode Card
  gameModeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  gameModeItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gameModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  gameModeTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
  },
  gameCountBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  gameCountText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.medium,
  },
  gameModeStats: {
    flexDirection: 'row',
    gap: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  gameModeStatItem: {
    alignItems: 'center',
  },
  gameModeStatValue: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  gameModeStatLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.round,
  },

  // Empty State
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
