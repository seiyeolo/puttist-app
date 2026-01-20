import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { COLORS } from '../constants';
import { useUserStore } from '../store/userStore';
import { usePracticeStore } from '../store/practiceStore';

export default function SettingsScreen() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const clearAllData = usePracticeStore((state) => state.clearAllData);

  const handleClearData = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 연습 기록이 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: clearAllData },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>설정</Text>

        <View style={styles.profileCard}>
          <Text style={styles.avatar}>{user?.avatar}</Text>
          <Text style={styles.nickname}>{user?.nickname}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleClearData}>
            <Text style={styles.menuText}>연습 기록 초기화</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={[styles.menuText, styles.logoutText]}>로그아웃</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>퍼티스트 v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 24 },
  profileCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24 },
  avatar: { fontSize: 64, marginBottom: 12 },
  nickname: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8, marginLeft: 4 },
  menuItem: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuText: { fontSize: 16, color: COLORS.text },
  menuArrow: { fontSize: 16, color: COLORS.textSecondary },
  logoutText: { color: COLORS.error },
  version: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 'auto', paddingBottom: 20 },
});
