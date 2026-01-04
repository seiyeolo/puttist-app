# 퍼티스트 MVP 완성 - Ralph Loop 프롬프트 (안티그래비티용)

## 📍 현재 상태
기본 구조는 완성됨. 아래 누락된 기능들을 구현해야 함.

## 📁 프로젝트 경로
`/Users/mac/Documents/puttist-app/app/`

## 🎯 목표
SPEC.md 기반 Phase 1 MVP 완성

---

## ❌ 누락된 기능 (구현 필요)

### 1. 거리 단위 수정 (중요!)
**현재**: cm 단위 (30, 60, 90... 300)
**변경**: m 단위 (1.2m ~ 19.9m)

수정 파일:
- `src/constants/index.ts`: DISTANCES 배열 수정
- `src/screens/PracticeScreen.tsx`: 표시 단위 m로 변경
- `src/types/index.ts`: distance 타입 확인

```typescript
// constants/index.ts 수정
export const DISTANCES = [1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10];

// 게임 모드 거리도 수정
export const GAME_MODES = {
  '3-6-9': {
    name: '3-6-9 챌린지',
    description: '3m, 6m, 9m 순서로 도전 (각 3번 기회)',
    distances: [3, 6, 9],
    attemptsPerDistance: 3,
  },
  '7-up': {
    name: '7-up',
    description: '1m부터 7m까지 순서대로',
    distances: [1, 2, 3, 4, 5, 6, 7],
  },
  '7-down': {
    name: '7-down',
    description: '7m부터 1m까지 역순으로',
    distances: [7, 6, 5, 4, 3, 2, 1],
  },
  '7-random': {
    name: '7 랜덤',
    description: '1~7m 무작위 도전',
    distances: [1, 2, 3, 4, 5, 6, 7],
    random: true,
  },
  '9-random': {
    name: '9 랜덤',
    description: '1~9m 무작위 도전',
    distances: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    random: true,
  },
};
```

### 2. GameModeScreen.tsx 생성
새 파일: `src/screens/GameModeScreen.tsx`

기능:
- 게임 모드 선택 화면 (5가지 모드 카드)
- 각 모드 설명 표시
- 모드 선택 시 GamePlayScreen으로 이동

### 3. GamePlayScreen.tsx 생성 (핵심!)
새 파일: `src/screens/GamePlayScreen.tsx`

기능:
- 현재 목표 거리 표시
- 진행 상황 표시 (예: 2/7)
- 성공/실패 버튼
- 성공 판정 로직:
  ```
  성공 조건: 목표 거리 통과 후 50cm 이내 멈춤
  예시: 5m 목표 → 5.0m ~ 5.5m 범위 = 성공
  ```
- 게임 완료 시 결과 화면
- 점수 계산 및 저장

### 4. 세션 관리
수정 파일: `src/store/practiceStore.ts`

추가 기능:
- 세션 시작/종료 시간 기록
- 세션별 기록 그룹화
- 날짜/시간 표시

```typescript
interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  mode: 'free' | '3-6-9' | '7-up' | '7-down' | '7-random' | '9-random';
  records: PuttingRecord[];
  score?: number;
}
```

### 5. 홈 화면 개선
수정 파일: `src/screens/HomeScreen.tsx`

추가:
- 오늘의 연습 목표 (예: "오늘 50개 퍼팅하기")
- 빠른 시작 버튼들:
  - 자유 연습
  - 3-6-9 도전
  - 7-up 도전
- 최근 기록 카드 (최근 3개 세션)
- 오늘 통계 요약

### 6. 네비게이션 업데이트
수정 파일: `src/navigation/AppNavigator.tsx`

추가 화면:
- GameModeScreen
- GamePlayScreen

---

## 📋 작업 순서

1. `src/constants/index.ts` 수정 (거리 단위 m로)
2. `src/types/index.ts` Session 타입 추가
3. `src/store/practiceStore.ts` 세션 관리 추가
4. `src/screens/GameModeScreen.tsx` 생성
5. `src/screens/GamePlayScreen.tsx` 생성
6. `src/screens/HomeScreen.tsx` 개선
7. `src/screens/PracticeScreen.tsx` 거리 단위 수정
8. `src/navigation/AppNavigator.tsx` 화면 추가
9. 테스트 실행

---

## ✅ 완료 조건

- [x] 거리 단위 m로 변경됨
- [x] 5가지 게임 모드 선택 가능
- [x] 게임 플레이 화면 작동
- [x] 성공 판정 규칙 적용됨
- [x] 세션별 기록 저장됨
- [x] 홈 화면에 오늘 통계 표시
- [x] `npx expo start --web` 정상 실행

모든 완료 시 "PUTTIST_MVP_COMPLETE" 출력

---

## 🎨 디자인 참고

색상 (현재 적용됨):
- Primary: #2E7D32 (포레스트 그린)
- Background: #1A1A1A (다크)
- Surface: #2D2D2D
- Success: #4CAF50
- Error: #F44336

---

## 📂 현재 파일 구조

```
src/
├── components/     (비어있음 - 필요시 생성)
├── constants/
│   └── index.ts    ← 수정 필요
├── navigation/
│   └── AppNavigator.tsx  ← 수정 필요
├── screens/
│   ├── AuthScreen.tsx      ✅
│   ├── HomeScreen.tsx      ← 개선 필요
│   ├── PracticeScreen.tsx  ← 수정 필요
│   ├── StatsScreen.tsx     ✅
│   ├── SettingsScreen.tsx  ✅
│   ├── GameModeScreen.tsx  ← 생성 필요
│   └── GamePlayScreen.tsx  ← 생성 필요
├── store/
│   ├── practiceStore.ts    ← 수정 필요
│   └── userStore.ts        ✅
├── types/
│   └── index.ts            ← 수정 필요
└── utils/          (비어있음)
```

---

*Ralph Loop 실행: 위 작업을 순서대로 완료하세요.*
