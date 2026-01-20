import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Vibration,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { usePracticeStore } from '../store/practiceStore';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
  GAME_CONFIG,
} from '../constants/theme';
import { CameraView } from 'expo-camera';
import { useVision } from '../hooks/useVision';

// 원터치 거리 선택 버튼 (애니메이션 포함)
const QuickDistanceButton = ({
  distance,
  isSelected,
  onPress
}: {
  distance: number;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Vibration.vibrate(10);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.quickDistanceBtn,
          isSelected && styles.quickDistanceBtnActive,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.quickDistanceText,
            isSelected && styles.quickDistanceTextActive,
          ]}
        >
          {distance}m
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 애니메이션 성공/실패 버튼
const AnimatedResultButton = ({
  type,
  onPress,
}: {
  type: 'success' | 'fail';
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isSuccess = type === 'success';

  const handlePress = () => {
    Vibration.vibrate(isSuccess ? [0, 50] : [0, 30, 30, 30]);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[styles.resultButtonWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={isSuccess ? styles.successButton : styles.failButton}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={isSuccess ? [COLORS.success, '#388E3C'] : [COLORS.error, '#C62828']}
          style={styles.resultButtonGradient}
        >
          <Ionicons
            name={isSuccess ? 'checkmark-circle' : 'close-circle'}
            size={48}
            color={COLORS.text}
          />
          <Text style={styles.resultButtonText}>{isSuccess ? '성공' : '실패'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

type PracticeMode = 'free' | 'challenge';

export default function PracticeScreen() {
  const user = useUserStore((state) => state.user);
  const {
    addRecord,
    records,
    startGameSession,
    updateSession,
    completeSession,
  } = usePracticeStore();

  const [practiceMode, setPracticeMode] = useState<PracticeMode>('free');
  const [targetDistance, setTargetDistance] = useState('');
  const [actualDistance, setActualDistance] = useState('');
  const [challengeDistance, setChallengeDistance] = useState('');
  const [challengeAttempts, setChallengeAttempts] = useState<number>(10);
  const [challengeActive, setChallengeActive] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [challengeResults, setChallengeResults] = useState<number[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Vision AI Hook
  // TODO: Make Server IP configurable
  const { isScanning, toggleScanning, lastResult, cameraRef } = useVision('192.168.0.145');
  const [visionMode, setVisionMode] = useState(false);

  // Auto-fill Actual Distance when Vision AI detects a result
  useEffect(() => {
    if (visionMode && lastResult) {
      setActualDistance(lastResult);
      // Auto-submit logic
      handleFreeRecord(true); 
    }
  }, [visionMode, lastResult]); 
  
  // Toggle Vision Mode
  const handleToggleVision = () => {
    setVisionMode((prev) => !prev);
    toggleScanning();
  };

  useEffect(() => {
    if (challengeActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [challengeActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateDistance = (distance: string): number | null => {
    const num = parseFloat(distance);
    if (isNaN(num)) return null;
    if (num < GAME_CONFIG.MIN_DISTANCE || num > GAME_CONFIG.MAX_DISTANCE) {
      return null;
    }
    return Math.round(num * 10) / 10;
  };

  const checkSuccess = (target: number, actual: number): boolean => {
    return actual >= target && actual <= target + GAME_CONFIG.SUCCESS_MARGIN;
  };

  const handleFreeRecord = async (silent = false) => {
    const target = validateDistance(targetDistance);
    const actual = validateDistance(actualDistance);

    if (!target || !actual) {
      if (!silent) {
        Alert.alert(
          '입력 오류',
          `거리는 ${GAME_CONFIG.MIN_DISTANCE}m ~ ${GAME_CONFIG.MAX_DISTANCE}m 사이여야 합니다.`
        );
      }
      return;
    }

    const success = checkSuccess(target, actual);

    try {
      await addRecord({
        userId: user!.id,
        targetDistance: target,
        actualDistance: actual,
        success,
        gameMode: 'normal',
        timestamp: new Date(),
        sessionId: Date.now().toString(),
      });

      // if not silent, clear target (manual mode)
      // if silent (vision mode), keep target for continuous practice
      if (!silent) {
        setTargetDistance('');
      }
      setActualDistance('');

      if (!silent) {
        Alert.alert(
          success ? '성공!' : '실패',
          `목표: ${target}m → 실제: ${actual}m\n${success ? '완벽해요!' : '다시 도전해보세요!'}`
        );
      } else {
        // Simple feedback for auto-mode
        Vibration.vibrate(success ? 100 : 300);
      }
    } catch (error) {
      if (!silent) Alert.alert('오류', '기록 저장에 실패했습니다.');
    }
  };

  const startChallenge = () => {
    const distance = validateDistance(challengeDistance);
    if (!distance) {
      Alert.alert(
        '입력 오류',
        `거리는 ${GAME_CONFIG.MIN_DISTANCE}m ~ ${GAME_CONFIG.MAX_DISTANCE}m 사이여야 합니다.`
      );
      return;
    }

    startGameSession('normal', user!.id);
    setChallengeActive(true);
    setCurrentAttempt(0);
    setChallengeResults([]);
    setElapsedTime(0);
  };

  const handleChallengeResult = async (success: boolean) => {
    const target = parseFloat(challengeDistance);

    await addRecord({
      userId: user!.id,
      targetDistance: target,
      actualDistance: success ? target : target + 1,
      success,
      gameMode: 'normal',
      timestamp: new Date(),
      sessionId: Date.now().toString(),
    });

    const newResults = [...challengeResults, success ? 1 : 0];
    setChallengeResults(newResults);
    setCurrentAttempt(currentAttempt + 1);

    if (currentAttempt + 1 >= challengeAttempts) {
      const successCount = newResults.filter((r) => r === 1).length;

      updateSession({
        duration: elapsedTime,
        detailedResults: [newResults],
      });

      await completeSession();
      setChallengeActive(false);

      Alert.alert(
        '도전 완료!',
        `목표: ${target}m\n결과: ${successCount}/${challengeAttempts} (${Math.round((successCount / challengeAttempts) * 100)}%)\n시간: ${formatTime(elapsedTime)}`
      );
    }
  };

  const cancelChallenge = () => {
    Alert.alert(
      '도전 취소',
      '진행 중인 도전을 취소하시겠습니까?',
      [
        { text: '계속', style: 'cancel' },
        {
          text: '취소',
          style: 'destructive',
          onPress: () => {
            setChallengeActive(false);
            setCurrentAttempt(0);
            setChallengeResults([]);
          },
        },
      ]
    );
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(
      (r) =>
        r.userId === user?.id &&
        r.gameMode === 'normal' &&
        new Date(r.timestamp).toISOString().split('T')[0] === today
    );

    const attempts = todayRecords.length;
    const successes = todayRecords.filter((r) => r.success).length;
    const rate = attempts > 0 ? Math.round((successes / attempts) * 100) : 0;

    return { attempts, successes, rate };
  };

  const stats = getTodayStats();
  const attemptOptions = [3, 6, 9, 10];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Today's Stats */}
            <View style={styles.statsCard}>
              <LinearGradient
                colors={[COLORS.surface, COLORS.surfaceLight]}
                style={styles.statsGradient}
              >
                <View style={styles.statsHeader}>
                  <Ionicons name="today" size={18} color={COLORS.primary} />
                  <Text style={styles.statsTitle}>오늘의 일반 연습</Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.attempts}</Text>
                    <Text style={styles.statLabel}>시도</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>
                      {stats.successes}
                    </Text>
                    <Text style={styles.statLabel}>성공</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: COLORS.secondary }]}>
                      {stats.rate}%
                    </Text>
                    <Text style={styles.statLabel}>성공률</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Mode Tabs */}
            {!challengeActive && (
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, practiceMode === 'free' && styles.tabActive]}
                  onPress={() => setPracticeMode('free')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="golf"
                    size={18}
                    color={practiceMode === 'free' ? COLORS.text : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      practiceMode === 'free' && styles.tabTextActive,
                    ]}
                  >
                    자유 연습
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, practiceMode === 'challenge' && styles.tabActive]}
                  onPress={() => setPracticeMode('challenge')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="flag"
                    size={18}
                    color={practiceMode === 'challenge' ? COLORS.text : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      practiceMode === 'challenge' && styles.tabTextActive,
                    ]}
                  >
                    커스텀 도전
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Free Practice Mode */}
            {practiceMode === 'free' && !challengeActive && (
              <View style={styles.formCard}>
                {/* AI Vision Toggle */}
                <View style={[styles.inputGroup, { marginBottom: 20 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="camera" size={20} color={COLORS.primary} />
                            <Text style={styles.inputLabel}>AI Vision Mode</Text>
                        </View>
                        <Switch
                            value={visionMode}
                            onValueChange={handleToggleVision}
                            trackColor={{ false: '#767577', true: COLORS.primary }}
                            thumbColor={visionMode ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                    
                    {visionMode && (
                        <View style={{ height: 200, borderRadius: RADIUS.md, overflow: 'hidden', backgroundColor: '#000', marginBottom: 10 }}>
                            {isScanning && (
                                <CameraView
                                    ref={cameraRef}
                                    style={{ flex: 1 }}
                                    facing="back"
                                />
                            )}
                            <View style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 4 }}>
                                <Text style={{ color: '#fff', fontSize: 12 }}>
                                    {lastResult ? `감지됨: ${lastResult}m` : '스캔 중...'}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* 원터치 거리 선택 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>원터치 목표 거리</Text>
                  <View style={styles.quickDistanceGrid}>
                    {GAME_CONFIG.NINE_DISTANCES.map((d) => (
                      <QuickDistanceButton
                        key={d}
                        distance={d}
                        isSelected={targetDistance === d.toString()}
                        onPress={() => setTargetDistance(d.toString())}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>또는 직접 입력</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={targetDistance}
                      onChangeText={setTargetDistance}
                      placeholder="0.0"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                    <Text style={styles.inputUnit}>m</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>실제 거리</Text>
                  <View style={styles.quickDistanceRow}>
                    {/* 실제 거리 원터치 버튼들 - 목표 거리 기준으로 */}
                    {targetDistance && (
                      <>
                        <TouchableOpacity
                          style={[styles.quickActualBtn, styles.quickActualBtnShort]}
                          onPress={() => setActualDistance((parseFloat(targetDistance) - 0.5).toString())}
                        >
                          <Text style={styles.quickActualText}>-0.5m</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.quickActualBtn, styles.quickActualBtnSuccess]}
                          onPress={() => setActualDistance(targetDistance)}
                        >
                          <Text style={styles.quickActualTextSuccess}>정확!</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.quickActualBtn, styles.quickActualBtnLong]}
                          onPress={() => setActualDistance((parseFloat(targetDistance) + 0.5).toString())}
                        >
                          <Text style={styles.quickActualText}>+0.5m</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.quickActualBtn, styles.quickActualBtnFail]}
                          onPress={() => setActualDistance((parseFloat(targetDistance) + 1).toString())}
                        >
                          <Text style={styles.quickActualTextFail}>오버</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={actualDistance}
                      onChangeText={setActualDistance}
                      placeholder="0.0"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                    <Text style={styles.inputUnit}>m</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.recordButton,
                    (!targetDistance || !actualDistance) && styles.buttonDisabled,
                  ]}
                  onPress={() => handleFreeRecord()}
                  disabled={!targetDistance || !actualDistance}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      targetDistance && actualDistance
                        ? [COLORS.primary, COLORS.primaryDark]
                        : [COLORS.textMuted, COLORS.textMuted]
                    }
                    style={styles.recordButtonGradient}
                  >
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.text} />
                    <Text style={styles.recordButtonText}>기록하기</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.infoCard}>
                  <Ionicons name="information-circle" size={18} color={COLORS.primary} />
                  <Text style={styles.infoText}>
                    성공 판정: 목표 거리 ~ 목표 거리 + 0.5m
                  </Text>
                </View>
              </View>
            )}

            {/* Challenge Setup */}
            {practiceMode === 'challenge' && !challengeActive && (
              <View style={styles.formCard}>
                <View style={styles.challengeHeader}>
                  <Ionicons name="trophy" size={24} color={COLORS.secondary} />
                  <Text style={styles.challengeTitle}>커스텀 도전 설정</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>목표 거리</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={challengeDistance}
                      onChangeText={setChallengeDistance}
                      placeholder="0.0"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                    <Text style={styles.inputUnit}>m</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>도전 횟수</Text>
                  <View style={styles.attemptGrid}>
                    {attemptOptions.map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.attemptOption,
                          challengeAttempts === num && styles.attemptOptionActive,
                        ]}
                        onPress={() => setChallengeAttempts(num)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.attemptOptionText,
                            challengeAttempts === num && styles.attemptOptionTextActive,
                          ]}
                        >
                          {num}번
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.startButton, !challengeDistance && styles.buttonDisabled]}
                  onPress={startChallenge}
                  disabled={!challengeDistance}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      challengeDistance
                        ? [COLORS.secondary, COLORS.secondaryDark]
                        : [COLORS.textMuted, COLORS.textMuted]
                    }
                    style={styles.startButtonGradient}
                  >
                    <Ionicons name="play" size={22} color={COLORS.background} />
                    <Text style={styles.startButtonText}>도전 시작</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Challenge Progress */}
            {challengeActive && (
              <View style={styles.challengeProgress}>
                <View style={styles.challengeProgressHeader}>
                  <Text style={styles.challengeProgressTitle}>
                    {challengeDistance}m 도전 중
                  </Text>
                  <TouchableOpacity onPress={cancelChallenge}>
                    <Ionicons name="close-circle" size={28} color={COLORS.error} />
                  </TouchableOpacity>
                </View>

                {/* Timer */}
                <View style={styles.timerCard}>
                  <Ionicons name="time" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                </View>

                {/* Target Display */}
                <View style={styles.targetCard}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.targetGradient}
                  >
                    <Text style={styles.targetLabel}>목표 거리</Text>
                    <Text style={styles.targetDistance}>{challengeDistance}m</Text>
                    <View style={styles.attemptBadge}>
                      <Text style={styles.attemptBadgeText}>
                        {currentAttempt + 1} / {challengeAttempts}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>

                {/* Results Display */}
                <View style={styles.resultsContainer}>
                  {challengeResults.map((result, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.resultDot,
                        result === 1 ? styles.resultDotSuccess : styles.resultDotFail,
                      ]}
                    >
                      <Ionicons
                        name={result === 1 ? 'checkmark' : 'close'}
                        size={16}
                        color={COLORS.text}
                      />
                    </View>
                  ))}
                  {Array.from({ length: challengeAttempts - challengeResults.length }).map(
                    (_, idx) => (
                      <View key={`empty-${idx}`} style={styles.resultDotEmpty} />
                    )
                  )}
                </View>

                {/* Success/Fail Buttons - 애니메이션 적용 */}
                <View style={styles.resultButtonRow}>
                  <AnimatedResultButton
                    type="success"
                    onPress={() => handleChallengeResult(true)}
                  />
                  <AnimatedResultButton
                    type="fail"
                    onPress={() => handleChallengeResult(false)}
                  />
                </View>

                {/* Current Score */}
                <View style={styles.scoreCard}>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreItem}>
                      <Text style={[styles.scoreValue, { color: COLORS.success }]}>
                        {challengeResults.filter((r) => r === 1).length}
                      </Text>
                      <Text style={styles.scoreLabel}>성공</Text>
                    </View>
                    <View style={styles.scoreDivider} />
                    <View style={styles.scoreItem}>
                      <Text style={[styles.scoreValue, { color: COLORS.error }]}>
                        {challengeResults.filter((r) => r === 0).length}
                      </Text>
                      <Text style={styles.scoreLabel}>실패</Text>
                    </View>
                    <View style={styles.scoreDivider} />
                    <View style={styles.scoreItem}>
                      <Text style={[styles.scoreValue, { color: COLORS.secondary }]}>
                        {currentAttempt > 0
                          ? Math.round(
                              (challengeResults.filter((r) => r === 1).length /
                                currentAttempt) *
                                100
                            )
                          : 0}
                        %
                      </Text>
                      <Text style={styles.scoreLabel}>성공률</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
  },

  // Stats Card
  statsCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  statsGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },

  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.text,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },

  // Input Group
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    paddingVertical: SPACING.md,
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
  },

  // Record Button
  recordButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginTop: SPACING.sm,
    ...SHADOWS.md,
  },
  recordButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  recordButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Challenge Header
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  challengeTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
  },

  // Attempt Grid
  attemptGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  attemptOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  attemptOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  attemptOptionText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textMuted,
  },
  attemptOptionTextActive: {
    color: COLORS.primary,
  },

  // Start Button
  startButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  startButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.background,
  },

  // Challenge Progress
  challengeProgress: {
    flex: 1,
  },
  challengeProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  challengeProgressTitle: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },

  // Timer Card
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
  },

  // Target Card
  targetCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  targetGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.secondaryLight,
    marginBottom: SPACING.xs,
  },
  targetDistance: {
    fontSize: 56,
    fontWeight: TYPOGRAPHY.extraBold,
    color: COLORS.text,
  },
  attemptBadge: {
    backgroundColor: COLORS.overlayLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    marginTop: SPACING.md,
  },
  attemptBadgeText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
  },

  // Results Container
  resultsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  resultDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultDotSuccess: {
    backgroundColor: COLORS.success,
  },
  resultDotFail: {
    backgroundColor: COLORS.error,
  },
  resultDotEmpty: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  // Result Button Row
  resultButtonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  successButton: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  failButton: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  resultButtonGradient: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultButtonText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },

  // Score Card
  scoreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  scoreValue: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: TYPOGRAPHY.bold,
  },
  scoreLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // 원터치 거리 선택 버튼
  quickDistanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  quickDistanceBtn: {
    width: 60,
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  quickDistanceBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '30',
  },
  quickDistanceText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textMuted,
  },
  quickDistanceTextActive: {
    color: COLORS.primary,
  },

  // 실제 거리 원터치 버튼
  quickDistanceRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  quickActualBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quickActualBtnShort: {
    backgroundColor: COLORS.info + '20',
    borderColor: COLORS.info,
  },
  quickActualBtnSuccess: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  quickActualBtnLong: {
    backgroundColor: COLORS.warning + '20',
    borderColor: COLORS.warning,
  },
  quickActualBtnFail: {
    backgroundColor: COLORS.error + '20',
    borderColor: COLORS.error,
  },
  quickActualText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
  },
  quickActualTextSuccess: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.success,
  },
  quickActualTextFail: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.error,
  },

  // 애니메이션 결과 버튼 래퍼
  resultButtonWrapper: {
    flex: 1,
  },
});
