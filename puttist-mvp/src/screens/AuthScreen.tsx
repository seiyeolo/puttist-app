import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
  AVATAR_OPTIONS,
} from '../constants/theme';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const createUser = useUserStore((state) => state.createUser);

  const handleCreateProfile = async () => {
    if (!nickname.trim()) {
      Alert.alert('', '닉네임을 입력해주세요');
      return;
    }

    try {
      await createUser(nickname.trim(), selectedAvatar);
    } catch (error) {
      Alert.alert('오류', '프로필 생성에 실패했습니다');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.primaryDark, COLORS.background]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>⛳</Text>
                <View style={styles.logoGlow} />
              </View>
              <Text style={styles.title}>퍼티스트</Text>
              <Text style={styles.subtitle}>골프의 완성은 퍼팅</Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Ionicons name="person-add" size={24} color={COLORS.primary} />
                <Text style={styles.formTitle}>프로필 만들기</Text>
              </View>

              {/* Nickname Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>닉네임</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={COLORS.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={nickname}
                    onChangeText={setNickname}
                    placeholder="닉네임을 입력하세요"
                    placeholderTextColor={COLORS.textMuted}
                    maxLength={20}
                  />
                  {nickname.length > 0 && (
                    <TouchableOpacity onPress={() => setNickname('')}>
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Avatar Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>아바타 선택</Text>
                <View style={styles.avatarGrid}>
                  {AVATAR_OPTIONS.map((avatar) => (
                    <TouchableOpacity
                      key={avatar}
                      style={[
                        styles.avatarOption,
                        selectedAvatar === avatar && styles.avatarSelected,
                      ]}
                      onPress={() => setSelectedAvatar(avatar)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.avatarText}>{avatar}</Text>
                      {selectedAvatar === avatar && (
                        <View style={styles.avatarCheck}>
                          <Ionicons name="checkmark" size={12} color={COLORS.text} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !nickname.trim() && styles.submitButtonDisabled,
                ]}
                onPress={handleCreateProfile}
                disabled={!nickname.trim()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    nickname.trim()
                      ? [COLORS.primary, COLORS.primaryDark]
                      : [COLORS.textMuted, COLORS.textMuted]
                  }
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitText}>시작하기</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                퍼티스트와 함께 퍼팅 실력을 향상시켜보세요
              </Text>
            </View>
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
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  logoIcon: {
    fontSize: 50,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
  },
  title: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.extraBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },

  // Input Group
  inputGroup: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semiBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.text,
  },

  // Avatar Grid
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  avatarOption: {
    width: (width - SPACING.xl * 2 - SPACING.xl * 2 - SPACING.sm * 3) / 4,
    aspectRatio: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  avatarText: {
    fontSize: 28,
  },
  avatarCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Submit Button
  submitButton: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  submitText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.text,
  },

  // Footer
  footer: {
    marginTop: SPACING.xxxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
