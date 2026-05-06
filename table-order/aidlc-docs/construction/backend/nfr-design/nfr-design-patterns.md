# Backend - NFR 설계 패턴

---

## 1. 보안 패턴

### 인증 미들웨어 패턴
```
Request → CORS Check → Rate Limiter → Security Headers → Auth Middleware → Router → Handler
```

- **AdminAuthDependency**: JWT 토큰 검증, store_id 추출, 만료 확인
- **TableAuthDependency**: 테이블 토큰 검증, table_id/store_id 추출
- **적용**: FastAPI `Depends()` 주입으로 라우터별 인증 적용

### 입력 검증 패턴
- **계층**: Pydantic 스키마 → 비즈니스 규칙 검증 → DB 제약조건
- **Pydantic**: 타입, 길이, 형식 자동 검증
- **비즈니스**: 서비스 레이어에서 도메인 규칙 검증 (매장 소속, 상태 전이 등)
- **DB**: UNIQUE, CHECK, FK 제약조건으로 최종 방어

### 에러 핸들링 패턴 (Fail-Closed)
```python
# 글로벌 에러 핸들러
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    # 1. 로깅 (상세 정보)
    # 2. 일반화된 에러 응답 반환 (내부 정보 노출 금지)
    # 3. 리소스 정리
```

- **커스텀 예외 계층**: AppException → NotFoundError, UnauthorizedError, ValidationError, ForbiddenError
- **응답 형식**: `{"detail": "사용자 친화적 메시지", "error_code": "ERROR_CODE"}`

### CORS 정책
- **개발**: `http://localhost:3000`, `http://localhost:3001` 허용
- **프로덕션**: 배포된 프론트엔드 도메인만 허용
- **설정**: 환경 변수 `CORS_ORIGINS`로 관리

---

## 2. 성능 패턴

### 비동기 I/O 패턴
- **FastAPI + async/await**: 모든 라우터 핸들러 비동기
- **asyncpg**: 비동기 DB 드라이버
- **비동기 SSE**: asyncio.Queue 기반 이벤트 스트리밍

### DB 연결 풀링
```
설정:
- pool_size: 20 (동시 연결)
- max_overflow: 10 (피크 시 추가 연결)
- pool_timeout: 30초 (연결 대기 타임아웃)
- pool_recycle: 3600초 (1시간마다 연결 갱신)
```

### Redis 캐싱 패턴
- **캐시 대상**: 메뉴 목록, 카테고리 목록 (자주 조회, 드물게 변경)
- **캐시 전략**: Cache-Aside (읽기 시 캐시 확인 → 미스 시 DB 조회 → 캐시 저장)
- **무효화**: 메뉴/카테고리 CUD 시 관련 캐시 삭제
- **TTL**: 메뉴 목록 5분, 카테고리 목록 10분
- **키 패턴**: `store:{store_id}:menus`, `store:{store_id}:categories`

### 요청 크기 제한
- **Body 크기**: 최대 1MB
- **주문 항목 수**: 최대 50개

---

## 3. 복원력 패턴

### DB 재시도 패턴
```
실패 시 → 1초 대기 → 재시도 1 → 1초 대기 → 재시도 2 → 1초 대기 → 재시도 3 → 에러 반환
```
- **대상**: DB 연결 실패, 일시적 네트워크 오류
- **최대 재시도**: 3회
- **재시도 간격**: 1초 (고정)
- **비재시도 대상**: 유효성 검증 실패, 인증 실패, 비즈니스 로직 에러

### Redis 장애 대응
- **Redis 연결 실패 시**: 캐시 무시하고 DB 직접 조회 (graceful degradation)
- **Redis 타임아웃**: 500ms (초과 시 DB fallback)

### 타임아웃 설정
| 대상 | 타임아웃 | 비고 |
|---|---|---|
| DB 쿼리 | 10초 | statement_timeout |
| Redis 연결 | 500ms | 캐시 미스 시 DB fallback |
| SSE 연결 | 없음 (long-lived) | 클라이언트 끊김 감지로 정리 |
| HTTP 요청 처리 | 30초 | 전체 요청 타임아웃 |

### 헬스체크
```
GET /health → {
  "status": "healthy",
  "db": "connected",
  "redis": "connected",
  "timestamp": "..."
}
```
- DB 연결 확인 (SELECT 1)
- Redis 연결 확인 (PING)
- 하나라도 실패 시 status: "degraded" (서비스는 계속 동작)

---

## 4. 운영 패턴

### 구조화된 로깅 (structlog)
```json
{
  "timestamp": "2026-05-06T12:00:00Z",
  "level": "info",
  "event": "order_created",
  "request_id": "uuid",
  "store_id": "uuid",
  "table_number": 5,
  "order_number": "20260506-001",
  "total_amount": 25000
}
```

### 로깅 대상 이벤트
| 이벤트 | 레벨 | 포함 정보 |
|---|---|---|
| 주문 생성 | INFO | store_id, table, order_number, amount |
| 주문 상태 변경 | INFO | order_id, old_status, new_status |
| 세션 완료 | INFO | table_id, session_id, order_count |
| 로그인 성공 | INFO | store_id, username |
| 로그인 실패 | WARNING | store_id, username, attempt_count |
| 계정 잠금 | WARNING | store_id, username, locked_until |
| DB 연결 실패 | ERROR | error_message, retry_count |
| 처리되지 않은 예외 | ERROR | error_type, message, stack_trace |

### Rate Limiting (slowapi)
| 엔드포인트 | 제한 | 키 |
|---|---|---|
| POST /api/admin/login | 10/min | IP |
| POST /api/tables/login | 10/min | IP |
| POST /api/orders | 30/min | table_id |
| GET /api/sse/orders | 5/min | admin_id |
| 기타 | 100/min | IP |

### 모니터링 메트릭
- 요청 수 (엔드포인트별)
- 응답 시간 (p50, p95, p99)
- 에러율 (4xx, 5xx)
- 동시 SSE 연결 수
- DB 연결 풀 사용률
- Redis 히트율
