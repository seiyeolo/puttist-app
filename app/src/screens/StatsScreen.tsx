import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS } from '../constants';
import { usePracticeStore } from '../store/practiceStore';

export default function StatsScreen() {
  const getStatistics = usePracticeStore((state) => state.getStatistics);
  const stats = getStatistics();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>통계</Text>

        <View style={styles.overviewCard}>
          <Text style={styles.cardTitle}>전체 통계</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalPutts}</Text>
              <Text style={styles.statLabel}>총 퍼팅</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.successfulPutts}</Text>
              <Text style={styles.statLabel}>성공</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.successRate.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>성공률</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>거리별 성공률</Text>
        {Object.entries(stats.byDistance)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([distance, data]) => (
            <View key={distance} style={styles.distanceCard}>
              <Text style={styles.distanceLabel}>{distance}cm</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${data.rate}%` }]} />
              </View>
              <Text style={styles.distanceStats}>{data.success}/{data.total} ({data.rate.toFixed(0)}%)</Text>
            </View>
          ))}
        
        {stats.totalPutts === 0 && (
          <Text style={styles.emptyText}>아직 기록이 없습니다. 연습을 시작해보세요!</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
  overviewCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  distanceCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 8 },
  distanceLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary },
  distanceStats: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: 'right' },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
});
