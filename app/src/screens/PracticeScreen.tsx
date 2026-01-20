import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, DISTANCES } from '../constants';
import { usePracticeStore } from '../store/practiceStore';

export default function PracticeScreen({ navigation, route }: any) {
  const [selectedDistance, setSelectedDistance] = useState(90);
  const addRecord = usePracticeStore((state) => state.addRecord);

  const handleResult = (success: boolean) => {
    addRecord({ distance: selectedDistance, success });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>퍼팅 연습</Text>
        
        <View style={styles.distanceDisplay}>
          <Text style={styles.distanceNumber}>{selectedDistance}</Text>
          <Text style={styles.distanceUnit}>cm</Text>
        </View>

        <Text style={styles.label}>거리 선택</Text>
        <View style={styles.distanceGrid}>
          {DISTANCES.map((dist) => (
            <TouchableOpacity
              key={dist}
              style={[styles.distanceButton, selectedDistance === dist && styles.distanceSelected]}
              onPress={() => setSelectedDistance(dist)}
            >
              <Text style={[styles.distanceButtonText, selectedDistance === dist && styles.distanceSelectedText]}>
                {dist}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>결과 입력</Text>
        <View style={styles.resultButtons}>
          <TouchableOpacity style={[styles.resultButton, styles.successButton]} onPress={() => handleResult(true)}>
            <Text style={styles.resultButtonText}>⭕ 성공</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.resultButton, styles.failButton]} onPress={() => handleResult(false)}>
            <Text style={styles.resultButtonText}>❌ 실패</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 20 },
  distanceDisplay: { flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', marginBottom: 30 },
  distanceNumber: { fontSize: 72, fontWeight: 'bold', color: COLORS.primary },
  distanceUnit: { fontSize: 24, color: COLORS.textSecondary, marginLeft: 8 },
  label: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 12 },
  distanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  distanceButton: { width: '18%', aspectRatio: 1, backgroundColor: COLORS.surface, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  distanceSelected: { backgroundColor: COLORS.primary },
  distanceButtonText: { fontSize: 16, color: COLORS.text },
  distanceSelectedText: { fontWeight: 'bold' },
  resultButtons: { flexDirection: 'row', gap: 16 },
  resultButton: { flex: 1, padding: 20, borderRadius: 16, alignItems: 'center' },
  successButton: { backgroundColor: COLORS.success },
  failButton: { backgroundColor: COLORS.error },
  resultButtonText: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
});
