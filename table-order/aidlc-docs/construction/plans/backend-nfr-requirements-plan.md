# Backend NFR Requirements Plan

## Unit 1: Backend API - 비기능 요구사항 계획

---

## Part A: NFR 결정 질문

### Question 1
예상 동시 접속자 수는 어느 정도입니까?

A) 소규모 (동시 10~30명, 테이블 10~20개)
B) 중규모 (동시 50~100명, 테이블 30~50개)
C) 대규모 (동시 200명 이상, 테이블 100개 이상)
X) Other (please describe after [Answer]: tag below)

[Answer]: B 

### Question 2
API 응답 시간 목표를 어떻게 설정하시겠습니까?

A) 일반 API: 500ms 이내, SSE 이벤트 전달: 2초 이내
B) 일반 API: 200ms 이내, SSE 이벤트 전달: 1초 이내
C) 일반 API: 1초 이내, SSE 이벤트 전달: 3초 이내
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
데이터 보존 정책을 어떻게 하시겠습니까?

A) 과거 주문 이력 영구 보존
B) 과거 주문 이력 1년 보존 후 삭제
C) 과거 주문 이력 6개월 보존 후 삭제
D) 과거 주문 이력 3개월 보존 후 삭제
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
로깅 수준을 어떻게 설정하시겠습니까?

A) 기본 (에러 + 주요 비즈니스 이벤트만)
B) 상세 (모든 API 요청/응답 + 비즈니스 이벤트)
C) 최소 (에러만)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part B: 생성 단계 (승인 후 실행)

### Step 1: NFR 요구사항 정의
- [x] 성능 요구사항 정의
- [x] 확장성 요구사항 정의
- [x] 가용성 요구사항 정의
- [x] 보안 요구사항 정의 (Security Baseline 매핑)
- [x] 운영 요구사항 정의 (로깅, 모니터링)
- [x] `nfr-requirements.md` 생성

### Step 2: 기술 스택 결정
- [x] 백엔드 프레임워크 및 라이브러리 확정
- [x] 데이터베이스 설정 결정
- [x] 인프라 관련 기술 결정
- [x] `tech-stack-decisions.md` 생성
