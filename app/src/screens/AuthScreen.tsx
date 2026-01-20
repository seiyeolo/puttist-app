import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { COLORS, AVATARS } from '../constants';
import { useUserStore } from '../store/userStore';

export default function AuthScreen() {
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const setUser = useUserStore((state) => state.setUser);

  const handleStart = () => {
    if (nickname.trim()) {
      setUser({
        id: Date.now().toString(),
        nickname: nickname.trim(),
        avatar: selectedAvatar,
        createdAt: new Date(),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>⛳</Text>
        <Text style={styles.title}>퍼티스트</Text>
        <Text style={styles.subtitle}>하루 5분, 쓰리펏 해결</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임을 입력하세요"
            placeholderTextColor={COLORS.textSecondary}
            maxLength={10}
          />
        </View>

        <View style={styles.avatarContainer}>
          <Text style={styles.label}>아바타 선택</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map((avatar) => (
              <TouchableOpacity
                key={avatar}
                style={[
                  styles.avatarButton,
                  selectedAvatar === avatar && styles.avatarSelected,
                ]}
                onPress={() => setSelectedAvatar(avatar)}
              >
                <Text style={styles.avatarText}>{avatar}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, !nickname.trim() && styles.buttonDisabled]}
          onPress={handleStart}
          disabled={!nickname.trim()}
        >
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 48 },
  inputContainer: { width: '100%', marginBottom: 24 },
  label: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  avatarContainer: { width: '100%', marginBottom: 32 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  avatarButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  avatarSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDark },
  avatarText: { fontSize: 28 },
  startButton: { width: '100%', backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  startButtonText: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
});
