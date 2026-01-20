import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '../constants/theme';

// 템포 색상
const TEMPO_COLORS = {
  backswing: '#2196F3',
  downswing: '#4CAF50',
  impact: '#FFD54F',
};

// 4가지 스트로크 패턴
type PatternKey = 'short-short' | 'short-long' | 'long-short' | 'long-long';

interface TempoPattern {
  name: string;
  description: string;
  backswing: number;
  downswing: number;
  icon: keyof typeof Ionicons.glyphMap;
}

const TEMPO_PATTERNS: Record<PatternKey, TempoPattern> = {
  'short-short': {
    name: '짧고 짧게',
    description: '빠른 템포, 숏퍼팅에 적합',
    backswing: 500,
    downswing: 500,
    icon: 'flash',
  },
  'short-long': {
    name: '짧고 길게',
    description: '백스윙 짧게, 팔로우스루 길게',
    backswing: 500,
    downswing: 800,
    icon: 'arrow-forward',
  },
  'long-short': {
    name: '길고 짧게',
    description: '백스윙 길게, 임팩트 강하게',
    backswing: 800,
    downswing: 500,
    icon: 'arrow-back',
  },
  'long-long': {
    name: '길고 길게',
    description: '느린 템포, 롱퍼팅에 적합',
    backswing: 800,
    downswing: 800,
    icon: 'resize',
  },
};

// 거리별 프리셋
interface DistancePreset {
  label: string;
  pattern: PatternKey;
  bpm: number;
  icon: keyof typeof Ionicons.glyphMap;
}

const DISTANCE_PRESETS: Record<string, DistancePreset> = {
  short: { label: '숏퍼팅', pattern: 'short-short', bpm: 60, icon: 'locate' },
  medium: { label: '미들퍼팅', pattern: 'short-long', bpm: 55, icon: 'radio-button-on' },
  long: { label: '롱퍼팅', pattern: 'long-long', bpm: 50, icon: 'scan' },
};

// 반복 횟수 옵션
const REPEAT_OPTIONS = [
  { label: '무한', value: 0 },
  { label: '5회', value: 5 },
  { label: '10회', value: 10 },
  { label: '20회', value: 20 },
];

// 패턴 선택 카드 컴포넌트
const PatternCard = ({
  patternKey,
  pattern,
  isSelected,
  onPress,
}: {
  patternKey: PatternKey;
  pattern: TempoPattern;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  return (
    <Animated.View style={[styles.patternCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.patternCardTouchable, isSelected && styles.patternCardSelected]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.patternIcon, isSelected && styles.patternIconSelected]}>
          <Ionicons
            name={pattern.icon}
            size={24}
            color={isSelected ? COLORS.text : COLORS.textMuted}
          />
        </View>
        <Text style={[styles.patternName, isSelected && styles.patternNameSelected]}>
          {pattern.name}
        </Text>
        <Text style={styles.patternDesc}>{pattern.description}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 프리셋 버튼 컴포넌트
const PresetButton = ({
  preset,
  isSelected,
  onPress,
}: {
  preset: DistancePreset;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.presetButton, isSelected && styles.presetButtonSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons
      name={preset.icon}
      size={18}
      color={isSelected ? COLORS.text : COLORS.textMuted}
    />
    <Text style={[styles.presetLabel, isSelected && styles.presetLabelSelected]}>
      {preset.label}
    </Text>
    <Text style={styles.presetBpm}>{preset.bpm} BPM</Text>
  </TouchableOpacity>
);

export default function TempoScreen() {
  // 상태
  const [selectedPattern, setSelectedPattern] = useState<PatternKey>('short-short');
  const [selectedPreset, setSelectedPreset] = useState<string | null>('short');
  const [bpm, setBpm] = useState(60);
  const [repeatCount, setRepeatCount] = useState(0); // 0 = 무한
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'backswing' | 'downswing'>('idle');

  // 애니메이션
  const progressAnim = useRef(new Animated.Value(0)).current;
  const impactFlashAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const beatCountRef = useRef(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  // BPM에 따른 타이밍 계산
  const getTimingFromBpm = useCallback(() => {
    const beatDuration = (60 / bpm) * 1000; // 1비트 시간 (ms)
    const pattern = TEMPO_PATTERNS[selectedPattern];
    const ratio = pattern.backswing / (pattern.backswing + pattern.downswing);
    return {
      backswing: beatDuration * ratio,
      downswing: beatDuration * (1 - ratio),
      total: beatDuration,
    };
  }, [bpm, selectedPattern]);

  // 오디오 초기화
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      } catch (error) {
        console.log('Audio setup error:', error);
      }
    };
    setupAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // 비프음 재생 (진동으로 대체 - 웹 호환성)
  const playBeep = useCallback(async (type: 'low' | 'high') => {
    // 웹에서는 진동이 작동하지 않을 수 있으므로 시각적 피드백에 의존
    if (Platform.OS !== 'web') {
      Vibration.vibrate(type === 'high' ? 50 : 30);
    }

    // 임팩트 순간 플래시
    if (type === 'high') {
      Animated.sequence([
        Animated.timing(impactFlashAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: false,
        }),
        Animated.timing(impactFlashAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [impactFlashAnim]);

  // 템포 애니메이션 실행
  const runTempoAnimation = useCallback(() => {
    const timing = getTimingFromBpm();

    const runSingleBeat = () => {
      if (!isPlaying) return;

      // 반복 횟수 체크
      if (repeatCount > 0 && beatCountRef.current >= repeatCount) {
        setIsPlaying(false);
        setPhase('idle');
        beatCountRef.current = 0;
        setCurrentBeat(0);
        progressAnim.setValue(0);
        return;
      }

      beatCountRef.current += 1;
      setCurrentBeat(beatCountRef.current);

      // 백스윙 시작
      setPhase('backswing');
      playBeep('low');

      animationRef.current = Animated.sequence([
        // 백스윙
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: timing.backswing,
          useNativeDriver: false,
        }),
        // 다운스윙
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: timing.downswing,
          useNativeDriver: false,
        }),
      ]);

      animationRef.current.start(({ finished }) => {
        if (finished && isPlaying) {
          // 임팩트
          setPhase('downswing');
          playBeep('high');

          // 다음 비트로
          setTimeout(() => {
            if (isPlaying) {
              runSingleBeat();
            }
          }, 100);
        }
      });
    };

    runSingleBeat();
  }, [isPlaying, repeatCount, getTimingFromBpm, playBeep, progressAnim]);

  // isPlaying 상태 변경 시 애니메이션 시작/정지
  useEffect(() => {
    if (isPlaying) {
      beatCountRef.current = 0;
      runTempoAnimation();
    } else {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      progressAnim.setValue(0);
      setPhase('idle');
    }
  }, [isPlaying]);

  // 프리셋 선택 핸들러
  const handlePresetSelect = (presetKey: string) => {
    const preset = DISTANCE_PRESETS[presetKey];
    setSelectedPreset(presetKey);
    setSelectedPattern(preset.pattern);
    setBpm(preset.bpm);
  };

  // 패턴 선택 핸들러
  const handlePatternSelect = (patternKey: PatternKey) => {
    setSelectedPattern(patternKey);
    setSelectedPreset(null); // 프리셋 해제
  };

  // 컨트롤 버튼 핸들러
  const handleStart = () => {
    Vibration.vibrate(30);
    setIsPlaying(true);
  };

  const handleStop = () => {
    Vibration.vibrate(30);
    setIsPlaying(false);
    setCurrentBeat(0);
    beatCountRef.current = 0;
  };

  const handleReset = () => {
    Vibration.vibrate(30);
    setIsPlaying(false);
    setCurrentBeat(0);
    beatCountRef.current = 0;
    progressAnim.setValue(0);
    setPhase('idle');
  };

  // BPM 조절
  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(40, Math.min(120, bpm + delta));
    setBpm(newBpm);
    setSelectedPreset(null); // 프리셋 해제
    Vibration.vibrate(10);
  };

  // 진행 바 색상 계산
  const progressBarColor = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [TEMPO_COLORS.downswing, TEMPO_COLORS.backswing, TEMPO_COLORS.backswing],
  });

  const impactFlashOpacity = impactFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="musical-notes" size={24} color={COLORS.primary} />
            <Text style={styles.title}>템포 트레이너</Text>
          </View>

          {/* 거리별 프리셋 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>거리별 프리셋</Text>
            <View style={styles.presetRow}>
              {Object.entries(DISTANCE_PRESETS).map(([key, preset]) => (
                <PresetButton
                  key={key}
                  preset={preset}
                  isSelected={selectedPreset === key}
                  onPress={() => handlePresetSelect(key)}
                />
              ))}
            </View>
          </View>

          {/* 패턴 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>스트로크 패턴</Text>
            <View style={styles.patternGrid}>
              {(Object.entries(TEMPO_PATTERNS) as [PatternKey, TempoPattern][]).map(
                ([key, pattern]) => (
                  <PatternCard
                    key={key}
                    patternKey={key}
                    pattern={pattern}
                    isSelected={selectedPattern === key}
                    onPress={() => handlePatternSelect(key)}
                  />
                )
              )}
            </View>
          </View>

          {/* 템포 시각화 */}
          <View style={styles.visualizerContainer}>
            <LinearGradient
              colors={[COLORS.surface, COLORS.surfaceLight]}
              style={styles.visualizerGradient}
            >
              {/* 임팩트 플래시 */}
              <Animated.View
                style={[
                  styles.impactFlash,
                  { opacity: impactFlashOpacity },
                ]}
              />

              {/* 페이즈 표시 */}
              <View style={styles.phaseIndicator}>
                <Text style={[
                  styles.phaseText,
                  phase === 'backswing' && styles.phaseTextActive,
                ]}>
                  백스윙
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={COLORS.textMuted}
                />
                <Text style={[
                  styles.phaseText,
                  phase === 'downswing' && styles.phaseTextActive,
                ]}>
                  다운스윙
                </Text>
              </View>

              {/* 진행 바 */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: progressBarColor,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* 비트 카운터 */}
              <View style={styles.beatCounter}>
                <Text style={styles.beatCounterLabel}>비트</Text>
                <Text style={styles.beatCounterValue}>
                  {repeatCount > 0 ? `${currentBeat} / ${repeatCount}` : currentBeat}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* BPM 조절 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>템포 (BPM)</Text>
            <View style={styles.bpmContainer}>
              <TouchableOpacity
                style={styles.bpmButton}
                onPress={() => adjustBpm(-5)}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.bpmDisplay}>
                <Text style={styles.bpmValue}>{bpm}</Text>
                <Text style={styles.bpmUnit}>BPM</Text>
              </View>
              <TouchableOpacity
                style={styles.bpmButton}
                onPress={() => adjustBpm(5)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.bpmLabels}>
              <Text style={styles.bpmLabel}>느리게 (40)</Text>
              <Text style={styles.bpmLabel}>빠르게 (120)</Text>
            </View>
          </View>

          {/* 반복 횟수 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>반복 횟수</Text>
            <View style={styles.repeatRow}>
              {REPEAT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.repeatOption,
                    repeatCount === option.value && styles.repeatOptionSelected,
                  ]}
                  onPress={() => {
                    setRepeatCount(option.value);
                    Vibration.vibrate(10);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.repeatLabel,
                      repeatCount === option.value && styles.repeatLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 컨트롤 버튼 */}
          <View style={styles.controlRow}>
            {!isPlaying ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.controlButtonGradient}
                >
                  <Ionicons name="play" size={32} color={COLORS.text} />
                  <Text style={styles.controlButtonText}>시작</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStop}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.error, '#C62828']}
                  style={styles.controlButtonGradient}
                >
                  <Ionicons name="stop" size={32} color={COLORS.text} />
                  <Text style={styles.controlButtonText}>정지</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 도움말 */}
          <View style={styles.helpCard}>
            <Ionicons name="information-circle" size={18} color={COLORS.primary} />
            <Text style={styles.helpText}>
              시각적 진행 바에 맞춰 퍼팅 스트로크를 연습하세요. 파란색은 백스윙, 초록색은 다운스윙입니다.
            </Text>
          </View>
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

  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Preset Row
  presetRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  presetButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  presetLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  presetLabelSelected: {
    color: COLORS.primary,
  },
  presetBpm: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Pattern Grid
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  patternCard: {
    width: '48%',
  },
  patternCardTouchable: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patternCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  patternIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  patternIconSelected: {
    backgroundColor: COLORS.primary + '30',
  },
  patternName: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  patternNameSelected: {
    color: COLORS.text,
  },
  patternDesc: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },

  // Visualizer
  visualizerContainer: {
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  visualizerGradient: {
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
  },
  impactFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: TEMPO_COLORS.impact,
    borderRadius: RADIUS.xl,
  },
  phaseIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  phaseText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textMuted,
  },
  phaseTextActive: {
    color: COLORS.text,
  },
  progressBarContainer: {
    marginBottom: SPACING.lg,
  },
  progressBarTrack: {
    height: 24,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.round,
  },
  beatCounter: {
    alignItems: 'center',
  },
  beatCounterLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  beatCounterValue: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },

  // BPM
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  bpmButton: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bpmDisplay: {
    alignItems: 'center',
  },
  bpmValue: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  bpmUnit: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  bpmLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  bpmLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },

  // Repeat
  repeatRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  repeatOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  repeatOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  repeatLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textMuted,
  },
  repeatLabelSelected: {
    color: COLORS.primary,
  },

  // Controls
  controlRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  startButton: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  stopButton: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  controlButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  controlButtonText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  resetButton: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Help
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '15',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  helpText: {
    flex: 1,
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
