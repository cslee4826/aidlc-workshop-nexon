# Unit of Work Plan

## 테이블오더 서비스 - 작업 단위 분해 계획

이 문서는 테이블오더 서비스를 개발 가능한 작업 단위(Unit of Work)로 분해하기 위한 계획입니다.

---

## Part A: 분해 결정 질문

### Question 1
작업 단위(Unit of Work)를 어떻게 분해하시겠습니까?

A) 3개 단위 — 백엔드 API / 고객 앱 / 관리자 앱 (배포 단위 기준)
B) 2개 단위 — 백엔드 API + 고객 앱 (핵심) / 관리자 앱 (관리)
C) 1개 단위 — 전체를 하나의 단위로 순차 개발
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
단위 간 개발 순서를 어떻게 하시겠습니까?

A) 순차 개발 — 백엔드 → 고객 앱 → 관리자 앱 순서로 완성
B) 백엔드 우선 + 프론트엔드 병렬 — 백엔드 완성 후 고객/관리자 앱 동시 개발
C) 기능 슬라이스 — 기능별로 백엔드+프론트엔드를 함께 개발 (메뉴→주문→관리 순)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 3
각 단위의 CONSTRUCTION 단계에서 설계 깊이를 어떻게 하시겠습니까?

A) 모든 단위에 동일한 깊이 적용 (Functional Design → NFR → Infrastructure 모두 실행)
B) 백엔드에만 전체 설계 적용, 프론트엔드는 Code Generation만 실행
C) 첫 번째 단위에 전체 설계 적용, 이후 단위는 간소화
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part B: 생성 단계 (승인 후 실행)

### Step 1: 단위 정의
- [x] 각 Unit of Work의 범위, 책임, 산출물 정의
- [x] 단위별 포함 컴포넌트 매핑
- [x] `unit-of-work.md` 생성

### Step 2: 의존성 매트릭스
- [x] 단위 간 의존성 관계 정의
- [x] 개발 순서 및 통합 포인트 정의
- [x] `unit-of-work-dependency.md` 생성

### Step 3: 스토리 매핑
- [x] 31개 User Story를 각 단위에 할당
- [x] 단위별 스토리 커버리지 확인
- [x] `unit-of-work-story-map.md` 생성

### Step 4: 검증
- [x] 모든 스토리가 단위에 할당되었는지 확인
- [x] 단위 경계의 일관성 검증
- [x] 의존성 순환 없음 확인
