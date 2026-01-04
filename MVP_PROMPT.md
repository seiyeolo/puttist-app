# 퍼티스트 MVP 개발 - Ralph Loop 프롬프트

## 목표
SPEC.md를 기반으로 Phase 1 MVP를 구현합니다.

## 기술 스택 (확정)
- **프레임워크**: React Native (Expo)
- **상태관리**: Zustand
- **로컬 저장소**: AsyncStorage + SQLite
- **UI 라이브러리**: React Native Paper
- **차트**: react-native-chart-kit
- **네비게이션**: React Navigation

## Phase 1 MVP 기능 (우선순위 순)

### 1. 프로젝트 초기 설정
- [ ] Expo 프로젝트 생성
- [ ] 필요한 패키지 설치
- [ ] 폴더 구조 설정
- [ ] 네비게이션 구조 설정

### 2. 사용자 인증 (간단 버전)
- [ ] 로컬 프로필 생성
- [ ] 닉네임, 아바타 설정
- [ ] AsyncStorage에 저장

### 3. 홈 화면
- [ ] 오늘의 연습 요약
- [ ] 빠른 시작 버튼 (일반 모드, 게임 모드)
- [ ] 최근 기록 카드

### 4. 연습 기록 입력 (핵심 기능)
- [ ] 일반 모드: 거리 입력 → 성공/실패 기록
- [ ] 게임 모드 선택 (3-6-9, 7-up, 7-down, 7-random, 9-random)
- [ ] 원터치 입력 UI
- [ ] 세션별 기록 저장

### 5. 성공 판정 로직
```
목표 거리: targetDistance
실제 거리: actualDistance
성공 조건: actualDistance >= targetDistance AND actualDistance <= targetDistance + 0.5
```

### 6. 게임 모드 구현
- [ ] 3-6-9 게임: 3m, 6m, 9m 순차 (각 3번 기회)
- [ ] 7-up: 1m → 7m 순차 증가
- [ ] 7-down: 7m → 1m 순차 감소
- [ ] 7-random: 1-7m 랜덤 순서
- [ ] 9-random: 1-9m 랜덤 순서

### 7. 통계 대시보드
- [ ] 거리별 성공률 차트
- [ ] 일별/주별 연습량
- [ ] 게임 모드별 최고 점수
- [ ] 총 연습 횟수

### 8. 설정 화면
- [ ] 프로필 수정
- [ ] 데이터 백업/복원
- [ ] 앱 정보

## 디자인 가이드
- **메인 컬러**: #228B22 (포레스트 그린)
- **서브 컬러**: #90EE90 (라이트 그린)
- **배경**: #1a1a1a (다크 모드 기본)
- **폰트**: 시스템 폰트, 숫자는 굵게

## 폴더 구조
```
puttist-app/
├── src/
│   ├── components/     # 재사용 컴포넌트
│   ├── screens/        # 화면 컴포넌트
│   ├── navigation/     # 네비게이션 설정
│   ├── store/          # Zustand 스토어
│   ├── utils/          # 유틸리티 함수
│   ├── constants/      # 상수 정의
│   └── types/          # TypeScript 타입
├── assets/             # 이미지, 폰트
├── App.tsx
└── package.json
```

## 작업 규칙
1. 각 파일 완료 후 위 체크박스에 [x] 표시
2. TypeScript 사용
3. 컴포넌트는 함수형으로 작성
4. 한국어 UI 텍스트
5. 에러 처리 포함

## 완료 조건
- 모든 체크박스 완료
- `npx expo start` 실행 가능
- 기본 기능 테스트 통과
- 완료 시 "MVP_COMPLETE" 출력

## 테스트 시나리오
1. 앱 실행 → 홈 화면 표시
2. 일반 모드 → 거리 입력 → 성공/실패 기록
3. 3-6-9 게임 → 완료 → 점수 표시
4. 통계 화면 → 차트 표시
5. 설정 → 프로필 수정

---
*이 프롬프트는 Ralph Loop에서 자동 개발을 위해 사용됩니다.*
