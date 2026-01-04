# 퍼팅 템포 트레이너 구현 - Ralph Loop 프롬프트

## 📍 현재 상태
MVP 완료됨. 템포 트레이너 기능 추가 필요.

## 📁 프로젝트 경로
`/Users/mac/Documents/puttist-app/puttist-mvp/`

## 🎯 목표
SPEC.md 3.3 퍼팅 템포 트레이너 구현

---

## 📋 구현 요구사항

### 1. TempoScreen.tsx 생성
새 파일: `src/screens/TempoScreen.tsx`

### 2. 4가지 스트로크 패턴
```typescript
const TEMPO_PATTERNS = {
  'short-short': { name: '짧고 짧게', backswing: 500, downswing: 500 },
  'short-long': { name: '짧고 길게', backswing: 500, downswing: 800 },
  'long-short': { name: '길고 짧게', backswing: 800, downswing: 500 },
  'long-long': { name: '길고 길게', backswing: 800, downswing: 800 },
};
```

### 3. 시각적 가이드 UI
- 움직이는 진행 바 (Animated API 사용)
- 백스윙: 파란색 (#2196F3)
- 다운스윙: 초록색 (#4CAF50)
- 임팩트 순간: 노란색 flash (#FFD54F)

### 4. 청각적 가이드
- expo-av 사용하여 비트음 재생
- 백스윙 시작: 낮은 톤 비프
- 임팩트: 높은 톤 비프
- BPM 조절 가능 (40~120 BPM)

### 5. 사용자 설정
- BPM 슬라이더
- 패턴 선택 버튼
- 시작/정지 버튼
- 반복 횟수 설정 (무한, 5회, 10회, 20회)

### 6. 거리별 프리셋
```typescript
const DISTANCE_PRESETS = {
  short: { label: '숏퍼팅 (1-3m)', pattern: 'short-short', bpm: 60 },
  medium: { label: '미들퍼팅 (4-7m)', pattern: 'short-long', bpm: 55 },
  long: { label: '롱퍼팅 (8m+)', pattern: 'long-long', bpm: 50 },
};
```

---

## 🔧 필요한 패키지 설치

```bash
npx expo install expo-av
```

---

## 📂 파일 수정 목록

### 1. 새 파일 생성
- `src/screens/TempoScreen.tsx`

### 2. 수정 필요
- `src/navigation/AppNavigator.tsx` - Tempo 탭 추가
- `src/constants/theme.ts` - 템포 관련 색상 추가 (필요시)

---

## 🎨 UI 구조

```
TempoScreen
├── Header (템포 트레이너)
├── PatternSelector (4가지 패턴 카드)
├── DistancePresets (거리별 프리셋 버튼)
├── TempoVisualizer
│   ├── ProgressBar (애니메이션)
│   ├── PhaseIndicator (백스윙/다운스윙 표시)
│   └── BeatCounter (현재 비트 표시)
├── BPMSlider
├── RepeatSelector (반복 횟수)
└── ControlButtons (시작/정지/리셋)
```

---

## 📋 작업 순서

1. `expo-av` 패키지 설치
2. `src/screens/TempoScreen.tsx` 생성
   - 기본 레이아웃 구현
   - 패턴 선택 UI
   - 거리별 프리셋 UI
3. 애니메이션 진행 바 구현
   - Animated API 사용
   - 백스윙/다운스윙 색상 전환
4. 오디오 비트음 구현
   - expo-av로 사운드 재생
   - BPM에 맞춰 타이밍 조절
5. BPM 슬라이더 구현
6. 시작/정지/리셋 컨트롤
7. `AppNavigator.tsx` 수정 - 탭 추가
8. 테스트 실행

---

## ✅ 완료 조건

- [x] 4가지 템포 패턴 선택 가능
- [x] 시각적 진행 바 애니메이션 작동
- [x] 청각적 비트음 재생됨 (진동 피드백으로 구현, 웹 호환성)
- [x] BPM 조절 가능 (40-120)
- [x] 거리별 프리셋 작동
- [x] 시작/정지/리셋 버튼 작동
- [x] 네비게이션에 템포 탭 추가됨
- [x] `npx expo start --web` 정상 실행

모든 완료 시 "TEMPO_TRAINER_COMPLETE" 출력

---

## 🎨 디자인 참고

기존 테마 사용 (`src/constants/theme.ts`):
- Primary: #2E7D32 (포레스트 그린)
- Background: #0D1B0F (다크)
- Surface: #1A2E1C

추가 색상:
- 백스윙: #2196F3 (파랑)
- 다운스윙: #4CAF50 (초록)
- 임팩트: #FFD54F (노랑)

---

## 💡 구현 힌트

### 애니메이션 진행 바
```typescript
const animatedWidth = useRef(new Animated.Value(0)).current;

const runTempo = () => {
  Animated.sequence([
    // 백스윙
    Animated.timing(animatedWidth, {
      toValue: 1,
      duration: pattern.backswing,
      useNativeDriver: false,
    }),
    // 다운스윙
    Animated.timing(animatedWidth, {
      toValue: 0,
      duration: pattern.downswing,
      useNativeDriver: false,
    }),
  ]).start();
};
```

### 오디오 재생
```typescript
import { Audio } from 'expo-av';

const playBeep = async (type: 'low' | 'high') => {
  // 간단한 비프음 재생
  const { sound } = await Audio.Sound.createAsync(
    type === 'low'
      ? require('../assets/beep-low.mp3')
      : require('../assets/beep-high.mp3')
  );
  await sound.playAsync();
};
```

---

*Ralph Loop 실행: 위 작업을 순서대로 완료하세요.*
