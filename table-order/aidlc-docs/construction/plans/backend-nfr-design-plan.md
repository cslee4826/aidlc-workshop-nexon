# Backend NFR Design Plan

## Unit 1: Backend API - NFR 설계 계획

---

## Part A: NFR 설계 결정 질문

### Question 1
캐싱 전략을 어떻게 하시겠습니까?

A) 캐싱 없음 (DB 직접 조회, 단순한 구조)
B) 인메모리 캐싱 (서버 메모리에 메뉴 데이터 캐싱)
C) Redis 캐싱 (외부 캐시 서버 사용)
X) Other (please describe after [Answer]: tag below)

[Answer]: C 

### Question 2
에러 복구 전략을 어떻게 하시겠습니까?

A) 단순 재시도 (DB 연결 실패 시 최대 3회 재시도)
B) 지수 백오프 재시도 (1초, 2초, 4초 간격으로 재시도)
C) 재시도 없음 (즉시 에러 반환, 클라이언트가 재시도)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
CORS 허용 오리진 정책을 어떻게 하시겠습니까?

A) 특정 도메인만 허용 (프론트엔드 배포 도메인 명시)
B) 개발 환경에서는 localhost 허용, 프로덕션에서는 특정 도메인만
C) 환경 변수로 설정 가능하게 (배포 환경별 유연한 설정)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part B: 생성 단계 (승인 후 실행)

### Step 1: NFR 설계 패턴
- [x] 보안 패턴 설계 (인증 미들웨어, 입력 검증, 에러 핸들링)
- [x] 성능 패턴 설계 (비동기 I/O, 연결 풀링, 캐싱)
- [x] 복원력 패턴 설계 (재시도, 타임아웃, 헬스체크)
- [x] 운영 패턴 설계 (로깅, 모니터링, Rate Limiting)
- [x] `nfr-design-patterns.md` 생성

### Step 2: 논리적 컴포넌트
- [x] 미들웨어 스택 설계
- [x] 인프라 컴포넌트 매핑
- [x] 배포 아키텍처 설계
- [x] `logical-components.md` 생성
