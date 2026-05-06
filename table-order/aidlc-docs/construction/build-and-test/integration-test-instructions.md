# Integration Test Instructions

## Purpose
Backend API ↔ Database, Backend ↔ Frontend 간 통합 동작을 검증합니다.

## Setup Integration Test Environment

### 1. Start Required Services
```bash
# PostgreSQL 실행 확인
pg_isready

# Redis 실행 확인 (선택)
redis-cli ping

# Backend 서버 실행
cd table-order/backend
source venv/bin/activate
uvicorn app.main:app --port 8000
```

### 2. Seed Test Data
```bash
# Python 스크립트로 초기 데이터 생성 (또는 API 호출)
# 1. 매장 생성
# 2. 관리자 계정 생성
# 3. 테이블 등록
# 4. 카테고리/메뉴 등록
```

## Integration Test Scenarios

### Scenario 1: 고객 주문 플로우
1. **테이블 로그인**: POST /api/tables/login → 토큰 발급 확인
2. **메뉴 조회**: GET /api/categories, GET /api/menus → 메뉴 목록 반환 확인
3. **주문 생성**: POST /api/orders → 주문 번호 반환, DB 저장 확인
4. **주문 조회**: GET /api/orders → 생성한 주문 목록에 포함 확인
5. **SSE 이벤트**: 관리자 SSE 스트림에 new_order 이벤트 수신 확인

### Scenario 2: 관리자 주문 관리 플로우
1. **관리자 로그인**: POST /api/admin/login → JWT 토큰 발급 확인
2. **대시보드 조회**: GET /api/tables → 테이블 목록 + 총 주문액 확인
3. **상태 변경**: PATCH /api/orders/{id}/status → pending→preparing 확인
4. **상태 변경**: PATCH /api/orders/{id}/status → preparing→completed 확인
5. **잘못된 전이**: PATCH /api/orders/{id}/status → completed→pending → 422 에러 확인

### Scenario 3: 테이블 세션 라이프사이클
1. **첫 주문**: POST /api/orders → 세션 자동 생성 확인
2. **추가 주문**: POST /api/orders → 동일 세션에 추가 확인
3. **이용 완료**: POST /api/tables/{id}/complete → 주문 이력 이동 확인
4. **이력 조회**: GET /api/tables/{id}/history → 과거 주문 확인
5. **새 주문**: POST /api/orders → 새 세션 생성 확인

### Scenario 4: 인증 보안
1. **잘못된 비밀번호 5회**: POST /api/admin/login → 423 계정 잠금 확인
2. **잠금 상태 로그인**: POST /api/admin/login → 잠금 메시지 확인
3. **만료된 토큰**: 만료된 JWT로 API 호출 → 401 에러 확인
4. **다른 매장 리소스 접근**: 타 매장 메뉴 수정 시도 → 404 에러 확인

## Run Integration Tests

```bash
# httpx 또는 curl로 수동 테스트
# 또는 pytest로 통합 테스트 실행 (DB 필요)
cd table-order/backend
pytest tests/ -v -m integration
```

## Cleanup
```bash
# 테스트 데이터 정리
# DROP DATABASE table_order_test;
# 또는 테스트 후 자동 롤백 (트랜잭션 기반 테스트)
```
