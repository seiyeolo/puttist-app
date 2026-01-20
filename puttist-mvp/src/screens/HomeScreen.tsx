import React, { useMemo, useCallback } from 'react';
import { ScrollView, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { usePracticeStore } from '../store/practiceStore';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { MainTabParamList } from '../navigation/AppNavigator';

// Gluestack UI Components
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  ButtonText,
  Card,
  Progress,
  ProgressFilledTrack,
  Avatar,
  AvatarFallbackText,
  AvatarBadge,
  Badge,
  BadgeText,
  Pressable,
  Divider,
} from '@/components/ui';

type NavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

// Profile Card Component
const ProfileCard = ({
  nickname,
  avatar,
  totalPractice,
}: {
  nickname: string;
  avatar: string;
  totalPractice: number;
}) => {
  return (
    <Card
      variant="elevated"
      size="lg"
      style={{
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: '#2E4830',
      }}
    >
      <HStack space="lg" style={{ alignItems: 'center' }}>
        <Avatar size="2xl" style={{ backgroundColor: COLORS.surface }}>
          <Text style={{ fontSize: 40 }}>{avatar}</Text>
          <AvatarBadge style={{ backgroundColor: COLORS.primary }}>
            <Ionicons name="golf" size={10} color={COLORS.text} />
          </AvatarBadge>
        </Avatar>
        <VStack space="xs" style={{ flex: 1 }}>
          <Heading size="xl">{nickname}님</Heading>
          <Text size="sm" style={{ color: COLORS.textSecondary }}>
            안녕하세요! 오늘도 화이팅!
          </Text>
          <HStack space="sm" style={{ marginTop: 4 }}>
            <Badge action="success" variant="solid" size="sm">
              <BadgeText>총 {totalPractice}회 연습</BadgeText>
            </Badge>
          </HStack>
        </VStack>
      </HStack>
    </Card>
  );
};

// Today's Goal Progress Card
const TodayProgressCard = ({
  todayPractice,
  todaySuccess,
  todaySuccessRate,
  formattedDate,
}: {
  todayPractice: number;
  todaySuccess: number;
  todaySuccessRate: number;
  formattedDate: string;
}) => {
  const dailyGoal = 20;
  const progressPercent = Math.min((todayPractice / dailyGoal) * 100, 100);

  return (
    <Box style={{ marginBottom: SPACING.xl }}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={{
          borderRadius: RADIUS.xl,
          padding: SPACING.xl,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <HStack
          style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}
        >
          <HStack space="sm" style={{ alignItems: 'center' }}>
            <Ionicons name="sunny" size={20} color={COLORS.secondary} />
            <Heading size="lg" style={{ color: COLORS.text }}>오늘의 연습</Heading>
          </HStack>
          <Badge action="muted" variant="solid" size="sm">
            <BadgeText style={{ color: COLORS.text }}>{formattedDate}</BadgeText>
          </Badge>
        </HStack>

        {/* Stats Row */}
        <HStack
          style={{ justifyContent: 'space-around', alignItems: 'center', marginBottom: SPACING.lg }}
        >
          <VStack style={{ alignItems: 'center', flex: 1 }}>
            <Heading size="4xl" style={{ color: COLORS.text }}>{todayPractice}</Heading>
            <Text size="sm" style={{ color: COLORS.secondaryLight, marginTop: 4 }}>연습</Text>
          </VStack>
          <Divider orientation="vertical" style={{ height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <VStack style={{ alignItems: 'center', flex: 1 }}>
            <Heading size="4xl" style={{ color: COLORS.text }}>{todaySuccess}</Heading>
            <Text size="sm" style={{ color: COLORS.secondaryLight, marginTop: 4 }}>성공</Text>
          </VStack>
          <Divider orientation="vertical" style={{ height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <VStack style={{ alignItems: 'center', flex: 1 }}>
            <Heading size="4xl" style={{ color: COLORS.text }}>{todaySuccessRate}%</Heading>
            <Text size="sm" style={{ color: COLORS.secondaryLight, marginTop: 4 }}>성공률</Text>
          </VStack>
        </HStack>

        {/* Progress Bar */}
        <VStack space="xs">
          <HStack style={{ justifyContent: 'space-between' }}>
            <Text size="xs" style={{ color: COLORS.secondaryLight }}>
              일일 목표: {todayPractice}/{dailyGoal}
            </Text>
            <Text size="xs" style={{ color: COLORS.secondaryLight }}>
              {Math.round(progressPercent)}%
            </Text>
          </HStack>
          <Progress value={progressPercent} size="md">
            <ProgressFilledTrack style={{ backgroundColor: COLORS.secondary }} />
          </Progress>
        </VStack>
      </LinearGradient>
    </Box>
  );
};

// Quick Start Button Component
const QuickStartButton = ({
  icon,
  iconColor,
  bgColor,
  title,
  description,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  onPress: () => void;
}) => {
  const handlePress = () => {
    Vibration.vibrate(15);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={{ flex: 1 }}>
      <Card
        variant="filled"
        size="md"
        style={{
          alignItems: 'center',
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <Box
          style={{
            width: 56,
            height: 56,
            borderRadius: RADIUS.md,
            backgroundColor: bgColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: SPACING.md,
          }}
        >
          <Ionicons name={icon} size={28} color={iconColor} />
        </Box>
        <Heading size="md" style={{ marginBottom: 4 }}>{title}</Heading>
        <Text size="xs" style={{ color: COLORS.textSecondary }}>{description}</Text>
      </Card>
    </Pressable>
  );
};

// Summary Stat Card
const SummaryStatCard = ({
  icon,
  iconColor,
  bgColor,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  value: string | number;
  label: string;
}) => {
  return (
    <Card
      variant="filled"
      size="sm"
      style={{
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      <Box
        style={{
          width: 40,
          height: 40,
          borderRadius: RADIUS.md,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: SPACING.sm,
        }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </Box>
      <Heading size="xl">{value}</Heading>
      <Text size="xs" style={{ color: COLORS.textSecondary, marginTop: 4 }}>{label}</Text>
    </Card>
  );
};

// Recent Practice Record Card
const RecentRecordCard = ({
  records,
}: {
  records: { distance: number; success: boolean; timestamp: string }[];
}) => {
  if (records.length === 0) {
    return (
      <Card
        variant="filled"
        size="md"
        style={{
          marginBottom: SPACING.xl,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <VStack space="md" style={{ alignItems: 'center', paddingVertical: SPACING.lg }}>
          <Ionicons name="golf-outline" size={48} color={COLORS.textMuted} />
          <Text style={{ color: COLORS.textMuted }}>아직 연습 기록이 없습니다</Text>
          <Text size="sm" style={{ color: COLORS.textMuted }}>첫 번째 연습을 시작해보세요!</Text>
        </VStack>
      </Card>
    );
  }

  return (
    <Card
      variant="filled"
      size="md"
      style={{
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      <HStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
        <Heading size="md">최근 기록</Heading>
        <Badge action="muted" variant="outline" size="sm">
          <BadgeText>최근 5회</BadgeText>
        </Badge>
      </HStack>
      <VStack space="sm">
        {records.slice(0, 5).map((record, index) => (
          <HStack
            key={index}
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: SPACING.sm,
              borderBottomWidth: index < records.length - 1 && index < 4 ? 1 : 0,
              borderBottomColor: COLORS.border,
            }}
          >
            <HStack space="md" style={{ alignItems: 'center' }}>
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: record.success ? COLORS.success + '20' : COLORS.error + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={record.success ? 'checkmark' : 'close'}
                  size={18}
                  color={record.success ? COLORS.success : COLORS.error}
                />
              </Box>
              <VStack>
                <Text size="md" bold>{record.distance.toFixed(1)}m</Text>
                <Text size="xs" style={{ color: COLORS.textMuted }}>
                  {new Date(record.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </VStack>
            </HStack>
            <Badge
              action={record.success ? 'success' : 'error'}
              variant="solid"
              size="sm"
            >
              <BadgeText>{record.success ? '성공' : '실패'}</BadgeText>
            </Badge>
          </HStack>
        ))}
      </VStack>
    </Card>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useUserStore((state) => state.user);
  const getStatistics = usePracticeStore((state) => state.getStatistics);
  const records = usePracticeStore((state) => state.records);

  // Stats calculation with memoization
  const stats = useMemo(() => {
    if (!user) {
      return {
        todayPractice: 0,
        todaySuccess: 0,
        weeklyPractice: 0,
        totalPractice: 0,
        averageSuccessRate: 0,
        recentRecords: [],
      };
    }

    const allStats = getStatistics(user.id);
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(
      (r) =>
        r.userId === user.id &&
        new Date(r.timestamp).toISOString().split('T')[0] === today
    );

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyRecords = records.filter(
      (r) => r.userId === user.id && new Date(r.timestamp) >= weekAgo
    );

    const userRecords = records
      .filter((r) => r.userId === user.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
      .map((r) => ({
        distance: r.targetDistance,
        success: r.success,
        timestamp: typeof r.timestamp === 'string' ? r.timestamp : new Date(r.timestamp).toISOString(),
      }));

    return {
      todayPractice: todayRecords.length,
      todaySuccess: todayRecords.filter((r) => r.success).length,
      weeklyPractice: weeklyRecords.length,
      totalPractice: allStats.totalAttempts,
      averageSuccessRate: allStats.successRate,
      recentRecords: userRecords,
    };
  }, [user, records, getStatistics]);

  const todaySuccessRate = useMemo(
    () =>
      stats.todayPractice > 0
        ? Math.round((stats.todaySuccess / stats.todayPractice) * 100)
        : 0,
    [stats.todayPractice, stats.todaySuccess]
  );

  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }),
    []
  );

  const handleQuickStart = useCallback(
    (mode: 'normal' | 'game') => {
      if (mode === 'normal') {
        navigation.navigate('Practice');
      } else {
        navigation.navigate('GameMode');
      }
    },
    [navigation]
  );

  return (
    <Box style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient
        colors={[COLORS.primaryDark + '40', COLORS.background]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 200,
        }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SPACING.xl,
            paddingBottom: SPACING.xxxl,
          }}
        >
          {/* Profile Card */}
          <Box style={{ marginTop: SPACING.md }}>
            <ProfileCard
              nickname={user?.nickname || '골퍼'}
              avatar={user?.avatar || '⛳'}
              totalPractice={stats.totalPractice}
            />
          </Box>

          {/* Today's Progress */}
          <TodayProgressCard
            todayPractice={stats.todayPractice}
            todaySuccess={stats.todaySuccess}
            todaySuccessRate={todaySuccessRate}
            formattedDate={formattedDate}
          />

          {/* Quick Start Section */}
          <VStack space="md" style={{ marginBottom: SPACING.xl }}>
            <Heading size="lg">빠른 시작</Heading>
            <HStack space="md">
              <QuickStartButton
                icon="golf"
                iconColor={COLORS.primary}
                bgColor={COLORS.primary + '30'}
                title="일반 연습"
                description="자유롭게 연습하기"
                onPress={() => handleQuickStart('normal')}
              />
              <QuickStartButton
                icon="game-controller"
                iconColor={COLORS.secondary}
                bgColor={COLORS.secondary + '30'}
                title="게임 모드"
                description="도전하기"
                onPress={() => handleQuickStart('game')}
              />
            </HStack>
          </VStack>

          {/* Summary Section */}
          <VStack space="md" style={{ marginBottom: SPACING.xl }}>
            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Heading size="lg">연습 요약</Heading>
              <Pressable onPress={() => navigation.navigate('Stats')}>
                <HStack space="xs" style={{ alignItems: 'center' }}>
                  <Text size="sm" style={{ color: COLORS.primary }}>더보기</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                </HStack>
              </Pressable>
            </HStack>
            <HStack space="md">
              <SummaryStatCard
                icon="calendar"
                iconColor={COLORS.primaryLight}
                bgColor={COLORS.primaryLight + '20'}
                value={stats.weeklyPractice}
                label="주간 연습"
              />
              <SummaryStatCard
                icon="flag"
                iconColor={COLORS.secondary}
                bgColor={COLORS.secondary + '20'}
                value={stats.totalPractice}
                label="전체 연습"
              />
              <SummaryStatCard
                icon="trending-up"
                iconColor={COLORS.success}
                bgColor={COLORS.success + '20'}
                value={`${Math.round(stats.averageSuccessRate)}%`}
                label="평균 성공률"
              />
            </HStack>
          </VStack>

          {/* Recent Records */}
          <VStack space="md">
            <Heading size="lg">최근 기록</Heading>
            <RecentRecordCard records={stats.recentRecords} />
          </VStack>

          {/* Stats Button */}
          <Pressable onPress={() => navigation.navigate('Stats')}>
            <Card
              variant="filled"
              size="lg"
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <HStack space="md" style={{ alignItems: 'center' }}>
                  <Box
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: RADIUS.md,
                      backgroundColor: COLORS.primary + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="stats-chart" size={24} color={COLORS.primary} />
                  </Box>
                  <VStack>
                    <Heading size="md">상세 통계 보기</Heading>
                    <Text size="sm" style={{ color: COLORS.textSecondary }}>
                      거리별, 게임별 분석
                    </Text>
                  </VStack>
                </HStack>
                <Ionicons name="arrow-forward-circle" size={28} color={COLORS.primary} />
              </HStack>
            </Card>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
