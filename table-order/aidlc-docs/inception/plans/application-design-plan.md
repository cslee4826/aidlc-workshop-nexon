# Application Design Plan

## 테이블오더 서비스 - 애플리케이션 설계 계획

이 문서는 테이블오더 서비스의 컴포넌트 식별, 서비스 레이어 설계, 의존성 정의를 위한 계획입니다.

---

## Part A: 설계 결정 질문

### Question 1
백엔드 API 구조를 어떻게 설계하시겠습니까?

A) 도메인별 라우터 분리 (auth/, menus/, orders/, tables/ 등 도메인별 모듈)
B) 레이어드 아키텍처 (controller → service → repository 계층 분리)
C) 도메인별 라우터 + 레이어드 아키텍처 결합 (도메인별 모듈 내에서 계층 분리)
X) Other (please describe after [Answer]: tag below)

[Answer]: A 

### Question 2
컴포넌트 간 통신 패턴을 어떻게 하시겠습니까?

A) 동기 호출 (직접 함수 호출, 단순한 구조)
B) 이벤트 기반 (내부 이벤트 버스를 통한 느슨한 결합)
C) 동기 호출 기본 + SSE 부분만 이벤트 기반 (하이브리드)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 3
데이터 접근 패턴을 어떻게 하시겠습니까?

A) ORM 사용 (SQLAlchemy) — 객체-관계 매핑으로 DB 접근
B) Raw SQL + 쿼리 빌더 — 직접 SQL 작성
C) ORM + Raw SQL 혼합 (기본은 ORM, 복잡한 쿼리는 Raw SQL)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 4
인증/인가 모듈의 범위를 어떻게 설계하시겠습니까?

A) 단일 인증 모듈 (관리자 JWT + 테이블 태블릿 인증을 하나의 모듈에서 처리)
B) 분리된 인증 모듈 (관리자 인증과 테이블 인증을 별도 모듈로 분리)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 5
프론트엔드 상태 관리 방식을 어떻게 하시겠습니까?

A) React Context + useReducer (내장 기능만 사용)
B) Zustand (경량 상태 관리 라이브러리)
C) Redux Toolkit (풀 기능 상태 관리)
D) React Query/TanStack Query (서버 상태 관리) + Context (로컬 상태)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part B: 설계 생성 단계 (승인 후 실행)

### Step 1: 컴포넌트 식별
- [x] 백엔드 컴포넌트 식별 (도메인별 모듈)
- [x] 고객용 프론트엔드 컴포넌트 식별
- [x] 관리자용 프론트엔드 컴포넌트 식별
- [x] 공통/공유 컴포넌트 식별

### Step 2: 컴포넌트 메서드 정의
- [x] 각 백엔드 컴포넌트의 주요 메서드 시그니처 정의
- [x] API 엔드포인트 매핑
- [x] 입출력 타입 정의

### Step 3: 서비스 레이어 설계
- [x] 서비스 정의 및 책임 할당
- [x] 서비스 간 오케스트레이션 패턴 정의
- [x] SSE 실시간 통신 서비스 설계

### Step 4: 의존성 관계 정의
- [x] 컴포넌트 간 의존성 매트릭스 작성
- [x] 데이터 흐름 다이어그램 작성
- [x] 통신 패턴 문서화

### Step 5: 통합 문서 생성
- [x] application-design.md 통합 문서 작성
