import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useUserStore } from './src/store/userStore';
import { usePracticeStore } from './src/store/practiceStore';
import { COLORS } from './src/constants';
import { GluestackUIProvider } from '@/components/ui';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, initUser } = useUserStore();
  const { loadRecords, loadSessions } = usePracticeStore();

  useEffect(() => {
    const initializeApp = async () => {
      // 병렬로 초기화하여 앱 로딩 시간 단축
      await Promise.all([
        initUser(),
        loadRecords(),
        loadSessions()
      ]);
      setIsLoading(false);
    };
    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <GluestackUIProvider mode="dark">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </GluestackUIProvider>
    );
  }

  return (
    <GluestackUIProvider mode="dark">
      <StatusBar style="light" />
      <AppNavigator isAuthenticated={!!user} />
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
