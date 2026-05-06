# Backend Functional Design Plan

## Unit 1: Backend API - 기능 설계 계획

---

## Part A: 비즈니스 로직 결정 질문

### Question 1
주문 번호 생성 방식을 어떻게 하시겠습니까?

A) 순차 번호 (1, 2, 3... — 매장 내 당일 기준 리셋)
B) 타임스탬프 기반 (예: 20260506-001, 20260506-002)
C) UUID 기반 (고유하지만 사용자 친화적이지 않음)
D) 짧은 랜덤 코드 (예: A3F2, B7K1 — 4자리 영숫자)
X) Other (please describe after [Answer]: tag below)

[Answer]: B 

### Question 2
주문 상태 전이 규칙을 어떻게 하시겠습니까?

A) 단방향만 허용 (대기중 → 준비중 → 완료, 역방향 불가)
B) 유연한 전이 (대기중 ↔ 준비중 ↔ 완료, 역방향도 가능)
C) 단방향 + 관리자 강제 리셋 (기본 단방향, 관리자가 강제로 이전 상태로 되돌리기 가능)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
테이블 세션 시작 시점을 어떻게 정의하시겠습니까?

A) 첫 주문 생성 시 자동으로 세션 시작
B) 관리자가 수동으로 세션 시작 버튼 클릭
C) 테이블 태블릿 로그인 시 자동으로 세션 시작
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
관리자 로그인 시도 제한 정책을 어떻게 하시겠습니까?

A) 5회 실패 시 15분 잠금
B) 5회 실패 시 30분 잠금
C) 3회 실패 시 15분 잠금
D) 점진적 지연 (1회 실패: 즉시, 3회: 30초 대기, 5회: 5분 대기, 10회: 30분 잠금)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
메뉴 가격의 유효 범위를 어떻게 설정하시겠습니까?

A) 100원 ~ 1,000,000원
B) 1원 ~ 10,000,000원
C) 1,000원 ~ 500,000원
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Part B: 생성 단계 (승인 후 실행)

### Step 1: 도메인 엔티티 설계
- [x] 전체 엔티티 관계도 (ERD) 정의
- [x] 각 엔티티의 속성, 타입, 제약조건 정의
- [x] 엔티티 간 관계 (1:N, N:M) 정의
- [x] `domain-entities.md` 생성

### Step 2: 비즈니스 로직 모델
- [x] 주문 생성 플로우 상세 설계
- [x] 세션 라이프사이클 상세 설계
- [x] 인증 플로우 상세 설계
- [x] SSE 이벤트 발행 로직 설계
- [x] `business-logic-model.md` 생성

### Step 3: 비즈니스 규칙
- [x] 입력 검증 규칙 정의
- [x] 상태 전이 규칙 정의
- [x] 인증/인가 규칙 정의
- [x] 데이터 무결성 규칙 정의
- [x] `business-rules.md` 생성
