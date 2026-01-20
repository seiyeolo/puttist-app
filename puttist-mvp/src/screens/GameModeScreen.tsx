import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Vibration,
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
  GAME_MODES,
} from '../constants/theme';
import { GameMode } from '../types';

// 게임 모드 배열을 컴포넌트 외부에 정의 (상수)
const GAME_MODES_LIST: GameModeInfo[] = [
  {
    mode: GAME_MODES.THREE_SIX_NINE,
    title: '3-6-9 게임',
    description: '3m, 6m, 9m 각 3번 도전',
    icon: 'podium',
    colors: [COLORS.primary, COLORS.primaryDark],
  },
  {
    mode: GAME_MODES.SEVEN_UP,
    title: '7-up',
    description: '3m부터 9m까지 순차 증가',
    icon: 'trending-up',
    colors: ['#43A047', '#2E7D32'],
  },
  {
    mode: GAME_MODES.SEVEN_DOWN,
    title: '7-down',
    description: '9m부터 3m까지 순차 감소',
    icon: 'trending-down',
    colors: ['#FB8C00', '#E65100'],
  },
  {
    mode: GAME_MODES.SEVEN_RANDOM,
    title: '7-랜덤',
    description: '기기 연동 시 사용 가능',
    icon: 'shuffle',
    colors: ['#8E24AA', '#6A1B9A'],
    comingSoon: true,
  },
  {
    mode: GAME_MODES.NINE_RANDOM,
    title: '9-랜덤',
    description: '기기 연동 시 사용 가능',
    icon: 'dice',
    colors: ['#1E88E5', '#1565C0'],
    comingSoon: true,
  },
];

// 시간 포매팅 함수를 컴포넌트 외부에 정의 (순수 함수)
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 애니메이션 게임 모드 카드 - React.memo 적용
const AnimatedModeCard = memo(function AnimatedModeCard({
  mode,
  onPress,
  onComingSoonPress,
}: {
  mode: GameModeInfo;
  onPress: () => void;
  onComingSoonPress?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isComingSoon = mode.comingSoon;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Vibration.vibrate(20);
    if (isComingSoon && onComingSoonPress) {
      onComingSoonPress();
    } else {
      onPress();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.modeCard, isComingSoon && styles.modeCardComingSoon]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={isComingSoon ? [COLORS.textMuted, COLORS.textMuted] : mode.colors}
          style={styles.modeCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.modeIconContainer}>
            <Ionicons name={mode.icon} size={32} color={COLORS.text} />
          </View>
          <View style={styles.modeTitleRow}>
            <Text style={styles.modeTitle}>{mode.title}</Text>
            {isComingSoon && (
              <View style={styles.comingSoonBadge}>
                <Ionicons name="link" size={10} color={COLORS.text} />
                <Text style={styles.comingSoonText}>연동 예정</Text>
              </View>
            )}
          </View>
          <Text style={styles.modeDescription}>{mode.description}</Text>
          <View style={[styles.playBadge, isComingSoon && styles.playBadgeComingSoon]}>
            <Ionicons name={isComingSoon ? 'information-circle' : 'play'} size={14} color={COLORS.text} />
            <Text style={styles.playBadgeText}>{isComingSoon ? '자세히' : '시작'}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

// 애니메이션 성공/실패 버튼 - React.memo 적용
const AnimatedResultButton = memo(function AnimatedResultButton({
  type,
  onPress,
}: {
  type: 'success' | 'fail';
  onPress: () => void;
}) {
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
});

// 애니메이션 결과 도트 - React.memo 적용
const AnimatedResultDot = memo(function AnimatedResultDot({
  result,
  delay = 0,
}: {
  result: number | null;
  index: number;
  delay?: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (result !== null) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          delay: delay,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
    }
  }, [result, delay]);

  return (
    <Animated.View
      style={[
        styles.resultDot,
        result === 1
          ? styles.resultDotSuccess
          : result === 0
          ? styles.resultDotFail
          : styles.resultDotEmpty,
        result !== null && {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {result !== null && (
        <Ionicons
          name={result === 1 ? 'checkmark' : 'close'}
          size={14}
          color={COLORS.text}
        />
      )}
    </Animated.View>
  );
});

interface GameModeInfo {
  mode: GameMode;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
  comingSoon?: boolean;
}

export default function GameModeScreen() {
  const user = useUserStore((state) => state.user);
  const {
    startGameSession,
    currentSession,
    updateSession,
    completeSession,
    addRecord,
  } = usePracticeStore();

  const clearCurrentSession = useCallback(() => {
    usePracticeStore.setState({ currentSession: null });
  }, []);

  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [roundResults, setRoundResults] = useState<number[]>([]);
  const [allResults, setAllResults] = useState<number[][]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setElapsedTime(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameActive]);

  // 현재 거리 계산 (useMemo)
  const currentDistance = useMemo(() => {
    if (!currentSession || !currentSession.gameData.distances) return 0;
    const { currentRound, distances } = currentSession.gameData;
    return distances[currentRound || 0] || 0;
  }, [currentSession]);

  // 현재 모드 정보 (useMemo)
  const currentModeInfo = useMemo(() => {
    return GAME_MODES_LIST.find((m) => m.mode === selectedMode);
  }, [selectedMode]);

  const startGame = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
    setGameActive(true);
    setCurrentAttempts(0);
    setRoundResults([]);
    setAllResults([]);
    setElapsedTime(0);
    startGameSession(mode, user!.id);
  }, [startGameSession, user]);

  const showComingSoonAlert = useCallback(() => {
    Alert.alert(
      '🔗 기기 연동 예정',
      '랜덤 모드는 퍼팅 기기와 앱이 Wi-Fi로 연동될 때 사용할 수 있습니다.\n\n기기가 랜덤으로 거리를 제시하고, 앱이 자동으로 결과를 기록합니다.\n\n향후 업데이트를 기대해 주세요!',
      [
        { text: '확인', style: 'default' },
      ]
    );
  }, []);

  const handleResult = useCallback(async (success: boolean) => {
    await addRecord({
      userId: user!.id,
      targetDistance: currentDistance,
      actualDistance: success ? currentDistance : currentDistance + 1,
      success,
      gameMode: selectedMode,
      timestamp: new Date(),
      sessionId: currentSession!.id,
    });

    const newRoundResults = [...roundResults, success ? 1 : 0];
    setRoundResults(newRoundResults);

    if (selectedMode === GAME_MODES.THREE_SIX_NINE) {
      const newAttempts = currentAttempts + 1;
      setCurrentAttempts(newAttempts);

      if (newAttempts >= GAME_CONFIG.THREE_SIX_NINE_ATTEMPTS) {
        const newAllResults = [...allResults, newRoundResults];
        setAllResults(newAllResults);

        const currentRound = currentSession!.gameData.currentRound || 0;
        if (currentRound >= 2) {
          const finalSuccessCount = currentSession!.successCount + (success ? 1 : 0);
          const finalTotalAttempts = currentSession!.totalAttempts + 1;

          updateSession({
            duration: elapsedTime,
            detailedResults: newAllResults,
          });

          await completeSession();
          setGameActive(false);
          showGameCompleteAlert(finalSuccessCount, finalTotalAttempts, elapsedTime);
        } else {
          updateSession({
            gameData: {
              ...currentSession!.gameData,
              currentRound: currentRound + 1,
              currentDistance: GAME_CONFIG.THREE_SIX_NINE_DISTANCES[currentRound + 1],
            },
            detailedResults: newAllResults,
          });
          setCurrentAttempts(0);
          setRoundResults([]);
        }
      }
    } else {
      const newAllResults = [...allResults, [success ? 1 : 0]];
      setAllResults(newAllResults);

      const currentRound = currentSession!.gameData.currentRound || 0;
      const distances = currentSession!.gameData.distances || [];

      if (currentRound >= distances.length - 1) {
        const finalSuccessCount = currentSession!.successCount + (success ? 1 : 0);
        const finalTotalAttempts = currentSession!.totalAttempts + 1;

        updateSession({
          duration: elapsedTime,
          detailedResults: newAllResults,
        });

        await completeSession();
        setGameActive(false);
        showGameCompleteAlert(finalSuccessCount, finalTotalAttempts, elapsedTime);
      } else {
        updateSession({
          gameData: {
            ...currentSession!.gameData,
            currentRound: currentRound + 1,
            currentDistance: distances[currentRound + 1],
          },
          detailedResults: newAllResults,
        });
        setRoundResults([]);
      }
    }
  }, [user, currentDistance, selectedMode, roundResults, currentAttempts, allResults, currentSession, elapsedTime, addRecord, updateSession, completeSession]);

  const showGameCompleteAlert = useCallback((
    successCount: number,
    totalAttempts: number,
    time: number
  ) => {
    const score = Math.round((successCount / totalAttempts) * 100);
    Alert.alert(
      '게임 완료!',
      `점수: ${successCount}/${totalAttempts} (${score}%)\n시간: ${formatTime(time)}`
    );
  }, []);

  const cancelGame = useCallback(() => {
    Alert.alert(
      '게임 취소',
      '진행 중인 게임을 취소하시겠습니까?',
      [
        { text: '계속', style: 'cancel' },
        {
          text: '취소',
          style: 'destructive',
          onPress: () => {
            clearCurrentSession();
            setGameActive(false);
            setSelectedMode(null);
            setCurrentAttempts(0);
            setRoundResults([]);
            setAllResults([]);
          },
        },
      ]
    );
  }, [clearCurrentSession]);

  const renderCurrentResults = useCallback(() => {
    if (selectedMode === GAME_MODES.THREE_SIX_NINE) {
      const maxAttempts = GAME_CONFIG.THREE_SIX_NINE_ATTEMPTS;
      return (
        <View style={styles.resultsRow}>
          {Array.from({ length: maxAttempts }).map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.resultDot,
                idx < roundResults.length
                  ? roundResults[idx] === 1
                    ? styles.resultDotSuccess
                    : styles.resultDotFail
                  : styles.resultDotEmpty,
              ]}
            >
              {idx < roundResults.length && (
                <Ionicons
                  name={roundResults[idx] === 1 ? 'checkmark' : 'close'}
                  size={14}
                  color={COLORS.text}
                />
              )}
            </View>
          ))}
        </View>
      );
    }
    return null;
  }, [selectedMode, roundResults]);

  const renderAllResults = useCallback(() => {
    if (allResults.length === 0) return null;

    if (selectedMode === GAME_MODES.THREE_SIX_NINE) {
      const distances = GAME_CONFIG.THREE_SIX_NINE_DISTANCES;
      return (
        <View style={styles.allResultsContainer}>
          {allResults.map((round, idx) => (
            <View key={idx} style={styles.allResultRow}>
              <Text style={styles.allResultLabel}>{distances[idx]}m</Text>
              <View style={styles.allResultDots}>
                {round.map((r, rIdx) => (
                  <View
                    key={rIdx}
                    style={[
                      styles.miniDot,
                      r === 1 ? styles.miniDotSuccess : styles.miniDotFail,
                    ]}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      );
    } else {
      return (
        <View style={styles.allResultsContainer}>
          <View style={styles.sequenceResults}>
            {allResults.map((r, idx) => (
              <View
                key={idx}
                style={[
                  styles.miniDot,
                  r[0] === 1 ? styles.miniDotSuccess : styles.miniDotFail,
                ]}
              />
            ))}
          </View>
        </View>
      );
    }
  }, [selectedMode, allResults]);

  // 진행 정보를 useMemo로 계산
  const progressInfo = useMemo(() => {
    if (!currentSession) return { current: 0, total: 0 };

    if (selectedMode === GAME_MODES.THREE_SIX_NINE) {
      const currentRound = currentSession.gameData.currentRound || 0;
      return {
        current: currentRound * 3 + currentAttempts + 1,
        total: 9,
      };
    } else {
      const distances = currentSession.gameData.distances || [];
      const currentRound = currentSession.gameData.currentRound || 0;
      return {
        current: currentRound + 1,
        total: distances.length,
      };
    }
  }, [currentSession, selectedMode, currentAttempts]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {!gameActive ? (
            <>
              <View style={styles.header}>
                <Ionicons name="game-controller" size={24} color={COLORS.primary} />
                <Text style={styles.title}>게임 모드 선택</Text>
              </View>

              <View style={styles.modeGrid}>
                {GAME_MODES_LIST.map((mode) => (
                  <AnimatedModeCard
                    key={mode.mode}
                    mode={mode}
                    onPress={() => startGame(mode.mode)}
                    onComingSoonPress={showComingSoonAlert}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.gameContainer}>
              {/* Game Header */}
              <View style={styles.gameHeader}>
                <View style={styles.gameHeaderLeft}>
                  <View
                    style={[
                      styles.gameModeBadge,
                      { backgroundColor: currentModeInfo?.colors[0] },
                    ]}
                  >
                    <Ionicons
                      name={currentModeInfo?.icon || 'game-controller'}
                      size={16}
                      color={COLORS.text}
                    />
                  </View>
                  <Text style={styles.gameTitle}>{currentModeInfo?.title}</Text>
                </View>
                <TouchableOpacity onPress={cancelGame}>
                  <Ionicons name="close-circle" size={28} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              {/* Timer & Progress */}
              <View style={styles.gameInfoRow}>
                <View style={styles.timerCard}>
                  <Ionicons name="time" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                </View>
                <View style={styles.progressCard}>
                  <Text style={styles.progressText}>
                    {progressInfo.current} / {progressInfo.total}
                  </Text>
                </View>
              </View>

              {/* Target Distance */}
              <View style={styles.targetCard}>
                <LinearGradient
                  colors={currentModeInfo?.colors || [COLORS.primary, COLORS.primaryDark]}
                  style={styles.targetGradient}
                >
                  <Text style={styles.targetLabel}>목표 거리</Text>
                  <Text style={styles.targetDistance}>{currentDistance}m</Text>
                  {selectedMode === GAME_MODES.THREE_SIX_NINE && (
                    <View style={styles.attemptBadge}>
                      <Text style={styles.attemptBadgeText}>
                        시도 {currentAttempts + 1}/{GAME_CONFIG.THREE_SIX_NINE_ATTEMPTS}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </View>

              {/* Current Round Results */}
              {renderCurrentResults()}

              {/* Success/Fail Buttons - 애니메이션 적용 */}
              <View style={styles.resultButtonRow}>
                <AnimatedResultButton
                  type="success"
                  onPress={() => handleResult(true)}
                />
                <AnimatedResultButton
                  type="fail"
                  onPress={() => handleResult(false)}
                />
              </View>

              {/* All Results Summary */}
              {renderAllResults()}

              {/* Current Score */}
              {currentSession && (
                <View style={styles.scoreCard}>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreItem}>
                      <Text style={[styles.scoreValue, { color: COLORS.success }]}>
                        {currentSession.successCount}
                      </Text>
                      <Text style={styles.scoreLabel}>성공</Text>
                    </View>
                    <View style={styles.scoreDivider} />
                    <View style={styles.scoreItem}>
                      <Text style={[styles.scoreValue, { color: COLORS.error }]}>
                        {currentSession.totalAttempts - currentSession.successCount}
                      </Text>
                      <Text style={styles.scoreLabel}>실패</Text>
                    </View>
                    <View style={styles.scoreDivider} />
                    <View style={styles.scoreItem}>
                      <Text style={[styles.scoreValue, { color: COLORS.secondary }]}>
                        {currentSession.totalAttempts > 0
                          ? Math.round(
                              (currentSession.successCount / currentSession.totalAttempts) * 100
                            )
                          : 0}
                        %
                      </Text>
                      <Text style={styles.scoreLabel}>성공률</Text>
                    </View>
                  </View>
                </View>
              )}
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

  // Mode Grid
  modeGrid: {
    gap: SPACING.md,
  },
  modeCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  modeCardGradient: {
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  modeTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modeTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  modeDescription: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.xl + 56 + SPACING.lg,
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.secondaryLight,
  },
  modeCardComingSoon: {
    opacity: 0.85,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.round,
    gap: 2,
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  playBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.overlayLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    gap: SPACING.xs,
  },
  playBadgeComingSoon: {
    backgroundColor: COLORS.warning + '40',
  },
  playBadgeText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
  },

  // Game Container
  gameContainer: {
    flex: 1,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  gameHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  gameModeBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameTitle: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },

  // Game Info Row
  gameInfoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  timerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
  },
  progressCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },

  // Target Card
  targetCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  targetGradient: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.secondaryLight,
    marginBottom: SPACING.xs,
  },
  targetDistance: {
    fontSize: 64,
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

  // Results Row
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  resultDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultButtonText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  resultButtonWrapper: {
    flex: 1,
  },

  // All Results Container
  allResultsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  allResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  allResultLabel: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
    width: 50,
  },
  allResultDots: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  sequenceResults: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  miniDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  miniDotSuccess: {
    backgroundColor: COLORS.success,
  },
  miniDotFail: {
    backgroundColor: COLORS.error,
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
});
