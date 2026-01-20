import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, GAME_MODES } from '../constants';
import { useUserStore } from '../store/userStore';
import { usePracticeStore } from '../store/practiceStore';

export default function HomeScreen({ navigation }: any) {
  const user = useUserStore((state) => state.user);
  const getStatistics = usePracticeStore((state) => state.getStatistics);
  const stats = getStatistics();

  const todayRecords = usePracticeStore((state) => 
    state.records.filter(r => {
      const today = new Date();
      const recordDate = new Date(r.timestamp);
      return recordDate.toDateString() === today.toDateString();
    })
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.avatar}>{user?.avatar}</Text>
          <Text style={styles.greeting}>안녕하세요, {user?.nickname}님!</Text>
        </View>

        <View style={styles.todayCard}>
          <Text style={styles.cardTitle}>오늘의 연습</Text>
          <View style={styles.todayStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todayRecords.length}</Text>
              <Text style={styles.statLabel}>총 퍼팅</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todayRecords.filter(r => r.success).length}</Text>
              <Text style={styles.statLabel}>성공</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {todayRecords.length > 0 
                  ? Math.round((todayRecords.filter(r => r.success).length / todayRecords.length) * 100)
                  : 0}%
              </Text>
              <Text style={styles.statLabel}>성공률</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.quickStartButton}
          onPress={() => navigation.navigate('Practice')}
        >
          <Text style={styles.quickStartText}>🎯 빠른 연습 시작</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>게임 모드</Text>
        {Object.entries(GAME_MODES).map(([key, mode]) => (
          <TouchableOpacity 
            key={key} 
            style={styles.gameModeCard}
            onPress={() => navigation.navigate('Practice', { mode: key })}
          >
            <Text style={styles.gameModeName}>{mode.name}</Text>
            <Text style={styles.gameModeDesc}>{mode.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar: { fontSize: 48, marginRight: 16 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  todayCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  todayStats: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  quickStartButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 24 },
  quickStartText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  gameModeCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  gameModeName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  gameModeDesc: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
});
