import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../store/userStore';
import { usePracticeStore } from '../store/practiceStore';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
  STORAGE_KEYS,
  AVATAR_OPTIONS,
} from '../constants/theme';

export default function SettingsScreen() {
  const { user, updateUser, clearUser } = useUserStore();
  const { records, sessions, clearAllData, reloadAllData } = usePracticeStore();
  const [editingProfile, setEditingProfile] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.nickname || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);

  const handleUpdateProfile = async () => {
    if (!newNickname.trim()) {
      Alert.alert('', '닉네임을 입력해주세요');
      return;
    }

    try {
      await updateUser({
        nickname: newNickname.trim(),
        avatar: selectedAvatar,
      });
      setEditingProfile(false);
      Alert.alert('', '프로필이 업데이트되었습니다');
    } catch (error) {
      Alert.alert('오류', '프로필 업데이트에 실패했습니다');
    }
  };

  const handleBackup = async () => {
    try {
      const backupData = {
        user,
        records,
        sessions,
        timestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem('@puttist_backup', JSON.stringify(backupData));
      Alert.alert('백업 완료', '데이터가 백업되었습니다');
    } catch (error) {
      Alert.alert('오류', '백업에 실패했습니다');
    }
  };

  const handleRestore = async () => {
    try {
      const backupString = await AsyncStorage.getItem('@puttist_backup');
      if (!backupString) {
        Alert.alert('', '백업 데이터가 없습니다');
        return;
      }

      const backupData = JSON.parse(backupString);

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(backupData.user)
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.PRACTICE_RECORDS,
        JSON.stringify(backupData.records)
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.GAME_SESSIONS,
        JSON.stringify(backupData.sessions)
      );

      await reloadAllData();
      Alert.alert('복원 완료', '데이터가 복원되었습니다');
    } catch (error) {
      Alert.alert('오류', '복원에 실패했습니다');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      '데이터 삭제',
      '모든 데이터가 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearUser();
              clearAllData();
              await AsyncStorage.multiRemove([
                STORAGE_KEYS.PRACTICE_RECORDS,
                STORAGE_KEYS.GAME_SESSIONS,
              ]);
              Alert.alert('', '모든 데이터가 삭제되었습니다');
            } catch (error) {
              Alert.alert('오류', '데이터 삭제에 실패했습니다');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="settings" size={24} color={COLORS.primary} />
            <Text style={styles.title}>설정</Text>
          </View>

          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>프로필</Text>
            {!editingProfile ? (
              <View style={styles.profileCard}>
                <LinearGradient
                  colors={[COLORS.surface, COLORS.surfaceLight]}
                  style={styles.profileGradient}
                >
                  <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatar}>{user?.avatar}</Text>
                    </View>
                    <View style={styles.profileDetails}>
                      <Text style={styles.nickname}>{user?.nickname}</Text>
                      <Text style={styles.joinDate}>
                        가입일:{' '}
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('ko-KR')
                          : '-'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setEditingProfile(true)}
                  >
                    <Ionicons name="pencil" size={18} color={COLORS.primary} />
                    <Text style={styles.editButtonText}>수정</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.editCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>닉네임</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={COLORS.textMuted}
                    />
                    <TextInput
                      style={styles.input}
                      value={newNickname}
                      onChangeText={setNewNickname}
                      placeholder="닉네임"
                      placeholderTextColor={COLORS.textMuted}
                      maxLength={20}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>아바타 선택</Text>
                  <View style={styles.avatarGrid}>
                    {AVATAR_OPTIONS.map((avatar) => (
                      <TouchableOpacity
                        key={avatar}
                        style={[
                          styles.avatarOption,
                          selectedAvatar === avatar && styles.avatarOptionActive,
                        ]}
                        onPress={() => setSelectedAvatar(avatar)}
                      >
                        <Text style={styles.avatarOptionText}>{avatar}</Text>
                        {selectedAvatar === avatar && (
                          <View style={styles.avatarCheck}>
                            <Ionicons name="checkmark" size={10} color={COLORS.text} />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingProfile(false);
                      setNewNickname(user?.nickname || '');
                      setSelectedAvatar(user?.avatar || AVATAR_OPTIONS[0]);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdateProfile}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      style={styles.saveButtonGradient}
                    >
                      <Text style={styles.saveButtonText}>저장</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>데이터 관리</Text>

            <TouchableOpacity style={styles.menuItem} onPress={handleBackup}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: COLORS.primary + '20' }]}>
                  <Ionicons name="cloud-upload" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>데이터 백업</Text>
                  <Text style={styles.menuItemDesc}>기기에 데이터 저장</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleRestore}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                  <Ionicons name="cloud-download" size={20} color={COLORS.secondary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>데이터 복원</Text>
                  <Text style={styles.menuItemDesc}>백업에서 복원</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleClearData}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: COLORS.error + '20' }]}>
                  <Ionicons name="trash" size={20} color={COLORS.error} />
                </View>
                <View>
                  <Text style={[styles.menuItemTitle, { color: COLORS.error }]}>
                    모든 데이터 삭제
                  </Text>
                  <Text style={styles.menuItemDesc}>모든 기록 초기화</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* App Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>앱 정보</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>앱 이름</Text>
                <Text style={styles.infoValue}>퍼티스트 퍼팅 연습</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>버전</Text>
                <View style={styles.versionBadge}>
                  <Text style={styles.versionText}>1.0.0 MVP</Text>
                </View>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>개발</Text>
                <Text style={styles.infoValue}>Ralph Loop</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>골프의 완성은 퍼팅</Text>
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
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },

  // Profile Card
  profileCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  profileGradient: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatar: {
    fontSize: 32,
  },
  profileDetails: {
    gap: SPACING.xs,
  },
  nickname: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },
  joinDate: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.primary,
  },

  // Edit Card
  editCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.text,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  avatarOption: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  avatarOptionText: {
    fontSize: 24,
  },
  avatarCheck: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },

  // Menu Item
  menuItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
  },
  menuItemDesc: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
  },
  versionBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  versionText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.primary,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
});
