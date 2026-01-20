import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Animated,
  Vibration,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
  GAME_CONFIG,
} from '../constants/theme';

// 칭찬 메시지 목록 (컴포넌트 외부 상수)
const PRAISE_MESSAGES = [
  { emoji: '🎉', text: '대단해요!' },
  { emoji: '👏', text: '잘했어요!' },
  { emoji: '🔥', text: '불타오르네요!' },
  { emoji: '⭐', text: '최고예요!' },
  { emoji: '💪', text: '역시!' },
  { emoji: '🏆', text: '챔피언!' },
  { emoji: '❤️', text: '사랑해요!' },
  { emoji: '😍', text: '멋져요!' },
] as const;

// 이모지 옵션 (컴포넌트 외부 상수)
const EMOJI_OPTIONS = ['🏌️', '⛳', '🎯', '🏆', '⭐', '💪', '🔥', '🌟', '👨', '👩'] as const;

// 라운드 옵션 (컴포넌트 외부 상수)
const ROUND_OPTIONS = [5, 10, 15, 20] as const;

// 시간 포매팅 함수 (순수 함수, 컴포넌트 외부)
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 플레이어 정보 인터페이스
interface Player {
  id: number;
  name: string;
  emoji: string;
  successes: number;
  failures: number;
  results: boolean[];
}

// 애니메이션 결과 버튼 - React.memo 적용
const AnimatedResultButton = memo(function AnimatedResultButton({
  type,
  onPress,
  disabled,
}: {
  type: 'success' | 'fail';
  onPress: () => void;
  disabled?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isSuccess = type === 'success';

  const handlePress = () => {
    if (disabled) return;
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
        style={[
          isSuccess ? styles.successButton : styles.failButton,
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
        disabled={disabled}
      >
        <LinearGradient
          colors={isSuccess ? [COLORS.success, '#388E3C'] : [COLORS.error, '#C62828']}
          style={styles.resultButtonGradient}
        >
          <Ionicons
            name={isSuccess ? 'checkmark-circle' : 'close-circle'}
            size={40}
            color={COLORS.text}
          />
          <Text style={styles.resultButtonText}>{isSuccess ? '성공' : '실패'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

// 플레이어 카드 컴포넌트 - React.memo 적용
const PlayerCard = memo(function PlayerCard({
  player,
  isActive,
  onPress,
}: {
  player: Player;
  isActive: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isActive]);

  const successRate = player.successes + player.failures > 0
    ? Math.round((player.successes / (player.successes + player.failures)) * 100)
    : 0;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.playerCard, isActive && styles.playerCardActive]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isActive ? [COLORS.primary, COLORS.primaryDark] : [COLORS.surface, COLORS.surfaceLight]}
          style={styles.playerCardGradient}
        >
          <View style={styles.playerHeader}>
            <Text style={styles.playerEmoji}>{player.emoji}</Text>
            <Text style={[styles.playerName, isActive && styles.playerNameActive]}>
              {player.name}
            </Text>
            {isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>차례</Text>
              </View>
            )}
          </View>
          <View style={styles.playerStats}>
            <View style={styles.playerStatItem}>
              <Text style={[styles.playerStatValue, { color: COLORS.success }]}>
                {player.successes}
              </Text>
              <Text style={styles.playerStatLabel}>성공</Text>
            </View>
            <View style={styles.playerStatDivider} />
            <View style={styles.playerStatItem}>
              <Text style={[styles.playerStatValue, { color: COLORS.error }]}>
                {player.failures}
              </Text>
              <Text style={styles.playerStatLabel}>실패</Text>
            </View>
            <View style={styles.playerStatDivider} />
            <View style={styles.playerStatItem}>
              <Text style={[styles.playerStatValue, { color: COLORS.secondary }]}>
                {successRate}%
              </Text>
              <Text style={styles.playerStatLabel}>성공률</Text>
            </View>
          </View>
          {/* 결과 도트 */}
          <View style={styles.resultDotsRow}>
            {player.results.slice(-10).map((result, idx) => (
              <View
                key={idx}
                style={[
                  styles.miniDot,
                  result ? styles.miniDotSuccess : styles.miniDotFail,
                ]}
              />
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

// 칭찬 버튼 컴포넌트 - React.memo 적용
const PraiseButton = memo(function PraiseButton({
  praise,
  onPress,
}: {
  praise: { emoji: string; text: string };
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.praiseButton} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.praiseEmoji}>{praise.emoji}</Text>
      <Text style={styles.praiseText}>{praise.text}</Text>
    </TouchableOpacity>
  );
});

export default function DuoModeScreen() {
  // 게임 상태
  const [gameStarted, setGameStarted] = useState(false);
  const [targetDistance, setTargetDistance] = useState('5');
  const [totalRounds, setTotalRounds] = useState(10);
  const [currentRound, setCurrentRound] = useState(1);
  const [activePlayer, setActivePlayer] = useState(1);
  const [gameEnded, setGameEnded] = useState(false);

  // 플레이어 정보
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: '플레이어 1', emoji: '🏌️', successes: 0, failures: 0, results: [] },
    { id: 2, name: '플레이어 2', emoji: '⛳', successes: 0, failures: 0, results: [] },
  ]);

  // 모달 상태
  const [showPraiseModal, setShowPraiseModal] = useState(false);
  const [praiseTarget, setPraiseTarget] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // 타이머
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameStarted && !gameEnded) {
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
  }, [gameStarted, gameEnded]);

  // 플레이어 이름 변경
  const updatePlayerName = useCallback((playerId: number, name: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, name } : p))
    );
  }, []);

  // 플레이어 이모지 변경
  const updatePlayerEmoji = useCallback((playerId: number, emoji: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, emoji } : p))
    );
  }, []);

  // 게임 시작
  const startGame = useCallback(() => {
    const distance = parseFloat(targetDistance);
    if (isNaN(distance) || distance < GAME_CONFIG.MIN_DISTANCE || distance > GAME_CONFIG.MAX_DISTANCE) {
      return;
    }
    setGameStarted(true);
    setCurrentRound(1);
    setActivePlayer(1);
    setElapsedTime(0);
    setGameEnded(false);
    setPlayers((prev) =>
      prev.map((p) => ({ ...p, successes: 0, failures: 0, results: [] }))
    );
  }, [targetDistance, totalRounds]);

  // 결과 기록
  const recordResult = useCallback((success: boolean) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === activePlayer) {
          return {
            ...p,
            successes: p.successes + (success ? 1 : 0),
            failures: p.failures + (success ? 0 : 1),
            results: [...p.results, success],
          };
        }
        return p;
      })
    );

    // 다음 플레이어 또는 다음 라운드
    if (activePlayer === 1) {
      setActivePlayer(2);
    } else {
      if (currentRound >= totalRounds) {
        // 게임 종료
        setGameEnded(true);
        setShowResultModal(true);
      } else {
        setCurrentRound((prev) => prev + 1);
        setActivePlayer(1);
      }
    }
  }, [activePlayer, currentRound, totalRounds]);

  // 칭찬 보내기
  const sendPraise = useCallback((targetPlayerId: number) => {
    setPraiseTarget(targetPlayerId);
    setShowPraiseModal(true);
  }, []);

  const handlePraiseSelect = useCallback((praise: { emoji: string; text: string }) => {
    Vibration.vibrate([0, 50, 50, 50]);
    setShowPraiseModal(false);
  }, []);

  // 승자 판정 (useMemo)
  const winner = useMemo(() => {
    const p1 = players[0];
    const p2 = players[1];
    if (p1.successes > p2.successes) return p1;
    if (p2.successes > p1.successes) return p2;
    return null; // 무승부
  }, [players]);

  // 게임 리셋
  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameEnded(false);
    setCurrentRound(1);
    setActivePlayer(1);
    setElapsedTime(0);
    setShowResultModal(false);
    setPlayers((prev) =>
      prev.map((p) => ({ ...p, successes: 0, failures: 0, results: [] }))
    );
  }, []);

  // 현재 플레이어 정보 (useMemo)
  const activePlayerInfo = useMemo(() => {
    return players.find((p) => p.id === activePlayer);
  }, [players, activePlayer]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="people" size={24} color={COLORS.primary} />
            <Text style={styles.title}>듀오 모드</Text>
          </View>

          {!gameStarted ? (
            /* 게임 설정 화면 */
            <View style={styles.setupContainer}>
              <Text style={styles.setupTitle}>함께 연습하기</Text>
              <Text style={styles.setupSubtitle}>
                부부, 친구와 함께 번갈아가며 퍼팅 연습을 해보세요!
              </Text>

              {/* 플레이어 설정 */}
              {players.map((player) => (
                <View key={player.id} style={styles.playerSetup}>
                  <Text style={styles.playerSetupLabel}>플레이어 {player.id}</Text>
                  <View style={styles.playerSetupRow}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.emojiScroll}
                    >
                      {EMOJI_OPTIONS.map((emoji) => (
                        <TouchableOpacity
                          key={emoji}
                          style={[
                            styles.emojiOption,
                            player.emoji === emoji && styles.emojiOptionSelected,
                          ]}
                          onPress={() => updatePlayerEmoji(player.id, emoji)}
                        >
                          <Text style={styles.emojiOptionText}>{emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <TextInput
                    style={styles.nameInput}
                    value={player.name}
                    onChangeText={(text) => updatePlayerName(player.id, text)}
                    placeholder="이름 입력"
                    placeholderTextColor={COLORS.textMuted}
                    maxLength={10}
                  />
                </View>
              ))}

              {/* 목표 거리 설정 */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>목표 거리</Text>
                <View style={styles.distanceInputRow}>
                  <TextInput
                    style={styles.distanceInput}
                    value={targetDistance}
                    onChangeText={setTargetDistance}
                    keyboardType="decimal-pad"
                    maxLength={4}
                  />
                  <Text style={styles.distanceUnit}>m</Text>
                </View>
              </View>

              {/* 라운드 수 설정 */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>라운드 수</Text>
                <View style={styles.roundOptions}>
                  {ROUND_OPTIONS.map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.roundOption,
                        totalRounds === num && styles.roundOptionSelected,
                      ]}
                      onPress={() => setTotalRounds(num)}
                    >
                      <Text
                        style={[
                          styles.roundOptionText,
                          totalRounds === num && styles.roundOptionTextSelected,
                        ]}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 시작 버튼 */}
              <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.startButtonGradient}
                >
                  <Ionicons name="play" size={24} color={COLORS.text} />
                  <Text style={styles.startButtonText}>게임 시작</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            /* 게임 진행 화면 */
            <View style={styles.gameContainer}>
              {/* 게임 정보 */}
              <View style={styles.gameInfoRow}>
                <View style={styles.gameInfoCard}>
                  <Text style={styles.gameInfoLabel}>라운드</Text>
                  <Text style={styles.gameInfoValue}>
                    {currentRound} / {totalRounds}
                  </Text>
                </View>
                <View style={styles.gameInfoCard}>
                  <Text style={styles.gameInfoLabel}>목표</Text>
                  <Text style={styles.gameInfoValue}>{targetDistance}m</Text>
                </View>
                <View style={styles.gameInfoCard}>
                  <Text style={styles.gameInfoLabel}>시간</Text>
                  <Text style={styles.gameInfoValue}>{formatTime(elapsedTime)}</Text>
                </View>
              </View>

              {/* 플레이어 카드 */}
              <View style={styles.playersContainer}>
                {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isActive={activePlayer === player.id && !gameEnded}
                    onPress={() => sendPraise(player.id)}
                  />
                ))}
              </View>

              {/* 현재 차례 표시 */}
              {!gameEnded && (
                <View style={styles.turnIndicator}>
                  <Text style={styles.turnText}>
                    {activePlayerInfo?.emoji}{' '}
                    {activePlayerInfo?.name}의 차례
                  </Text>
                </View>
              )}

              {/* 결과 버튼 */}
              {!gameEnded && (
                <View style={styles.resultButtonRow}>
                  <AnimatedResultButton type="success" onPress={() => recordResult(true)} />
                  <AnimatedResultButton type="fail" onPress={() => recordResult(false)} />
                </View>
              )}

              {/* 칭찬 보내기 안내 */}
              <View style={styles.praiseHint}>
                <Ionicons name="heart" size={16} color={COLORS.error} />
                <Text style={styles.praiseHintText}>
                  상대방 카드를 탭하면 칭찬을 보낼 수 있어요!
                </Text>
              </View>

              {/* 게임 컨트롤 */}
              <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
                <Ionicons name="refresh" size={20} color={COLORS.textSecondary} />
                <Text style={styles.resetButtonText}>새 게임</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* 칭찬 모달 */}
      <Modal visible={showPraiseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.praiseModal}>
            <Text style={styles.praiseModalTitle}>
              {players.find((p) => p.id === praiseTarget)?.name}에게 칭찬 보내기
            </Text>
            <View style={styles.praiseGrid}>
              {PRAISE_MESSAGES.map((praise, idx) => (
                <PraiseButton
                  key={idx}
                  praise={praise}
                  onPress={() => handlePraiseSelect(praise)}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowPraiseModal(false)}
            >
              <Text style={styles.closeModalText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 결과 모달 */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.resultModal}>
            <Text style={styles.resultModalTitle}>게임 종료!</Text>

            {winner ? (
              <View style={styles.winnerSection}>
                <Text style={styles.winnerEmoji}>{winner.emoji}</Text>
                <Text style={styles.winnerName}>{winner.name}</Text>
                <Text style={styles.winnerLabel}>승리!</Text>
              </View>
            ) : (
              <View style={styles.winnerSection}>
                <Text style={styles.winnerEmoji}>🤝</Text>
                <Text style={styles.winnerLabel}>무승부!</Text>
              </View>
            )}

            <View style={styles.finalScores}>
              {players.map((player) => (
                <View key={player.id} style={styles.finalScoreCard}>
                  <Text style={styles.finalScoreEmoji}>{player.emoji}</Text>
                  <Text style={styles.finalScoreName}>{player.name}</Text>
                  <Text style={styles.finalScoreValue}>
                    {player.successes} / {player.successes + player.failures}
                  </Text>
                  <Text style={styles.finalScoreRate}>
                    {player.successes + player.failures > 0
                      ? Math.round((player.successes / (player.successes + player.failures)) * 100)
                      : 0}
                    %
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.finalTime}>총 시간: {formatTime(elapsedTime)}</Text>

            <TouchableOpacity style={styles.newGameButton} onPress={resetGame}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.newGameButtonGradient}
              >
                <Text style={styles.newGameButtonText}>새 게임 시작</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: SPACING.xxxl,
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

  // Setup Container
  setupContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  setupTitle: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  setupSubtitle: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },

  // Player Setup
  playerSetup: {
    marginBottom: SPACING.xl,
  },
  playerSetupLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  playerSetupRow: {
    marginBottom: SPACING.sm,
  },
  emojiScroll: {
    flexDirection: 'row',
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  emojiOptionText: {
    fontSize: 24,
  },
  nameInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Settings
  settingSection: {
    marginBottom: SPACING.xl,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  distanceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  distanceUnit: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
  },
  roundOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  roundOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roundOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  roundOptionText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textMuted,
  },
  roundOptionTextSelected: {
    color: COLORS.primary,
  },

  // Start Button
  startButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
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
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },

  // Game Container
  gameContainer: {
    flex: 1,
  },
  gameInfoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  gameInfoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gameInfoLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  gameInfoValue: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginTop: 2,
  },

  // Players Container
  playersContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  playerCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  playerCardActive: {
    ...SHADOWS.glow,
  },
  playerCardGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  playerEmoji: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  playerName: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textMuted,
    flex: 1,
  },
  playerNameActive: {
    color: COLORS.text,
  },
  activeBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.round,
  },
  activeBadgeText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.background,
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  playerStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  playerStatDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  playerStatValue: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
  },
  playerStatLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  resultDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  miniDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  miniDotSuccess: {
    backgroundColor: COLORS.success,
  },
  miniDotFail: {
    backgroundColor: COLORS.error,
  },

  // Turn Indicator
  turnIndicator: {
    backgroundColor: COLORS.primary + '30',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  turnText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
  },

  // Result Buttons
  resultButtonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  resultButtonWrapper: {
    flex: 1,
  },
  successButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  failButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  resultButtonGradient: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },

  // Praise Hint
  praiseHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  praiseHintText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },

  // Reset Button
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  resetButtonText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  praiseModal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
  },
  praiseModalTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  praiseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  praiseButton: {
    width: '23%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  praiseEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  praiseText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  closeModalButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  closeModalText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },

  // Result Modal
  resultModal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  resultModalTitle: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  winnerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  winnerEmoji: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  winnerName: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  winnerLabel: {
    fontSize: TYPOGRAPHY.h4,
    color: COLORS.secondary,
    fontWeight: TYPOGRAPHY.semiBold,
  },
  finalScores: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  finalScoreCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  finalScoreEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  finalScoreName: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  finalScoreValue: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  finalScoreRate: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semiBold,
  },
  finalTime: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  newGameButton: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  newGameButtonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  newGameButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
});
