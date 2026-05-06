# 테이블오더 서비스 - 서비스 레이어 설계

---

## 서비스 정의

### 1. AuthService (관리자 인증 서비스)
- **책임**: 관리자 자격 증명 검증, JWT 토큰 발급/검증, 로그인 시도 제한
- **주요 메서드**:
  - `authenticate(store_id, username, password) → Token`
  - `validate_token(token) → AdminInfo`
  - `check_login_attempts(store_id, username) → bool`
  - `invalidate_token(token) → void`

### 2. TableAuthService (테이블 인증 서비스)
- **책임**: 테이블 자격 증명 검증, 테이블 세션 토큰 발급/검증
- **주요 메서드**:
  - `authenticate_table(store_id, table_number, password) → TableToken`
  - `validate_table_token(token) → TableSessionInfo`
  - `get_or_create_session(table_id) → SessionInfo`

### 3. MenuService (메뉴 서비스)
- **책임**: 메뉴 CRUD 비즈니스 로직, 카테고리 관리, 순서 관리
- **주요 메서드**:
  - `get_categories() → List[Category]`
  - `get_menus(category_id?) → List[MenuItem]`
  - `get_menu(id) → MenuItem`
  - `create_menu(data) → MenuItem`
  - `update_menu(id, data) → MenuItem`
  - `delete_menu(id) → void`
  - `update_sort_order(items) → void`

### 4. OrderService (주문 서비스)
- **책임**: 주문 생성, 조회, 상태 관리, 삭제, 이벤트 발행
- **주요 메서드**:
  - `create_order(table_id, session_id, items) → Order`
  - `get_orders(table_id?, session_id?, status?) → List[Order]`
  - `get_order(id) → Order`
  - `update_status(id, status) → Order`
  - `delete_order(id) → void`
- **이벤트 발행**: 주문 생성/상태 변경/삭제 시 SSE 이벤트 발행

### 5. TableService (테이블 서비스)
- **책임**: 테이블 등록/관리, 세션 라이프사이클, 과거 내역 관리
- **주요 메서드**:
  - `create_table(table_number, password) → Table`
  - `get_tables() → List[Table]`
  - `get_table(id) → Table`
  - `complete_session(table_id) → void` (주문 이력 이동, 리셋)
  - `get_history(table_id, date_from?, date_to?) → List[OrderHistory]`

### 6. SSEService (실시간 통신 서비스)
- **책임**: SSE 연결 관리, 이벤트 브로드캐스트, 연결 상태 관리
- **주요 메서드**:
  - `connect(admin_id) → EventStream`
  - `broadcast_event(event_type, data) → void`
  - `disconnect(connection_id) → void`
- **이벤트 타입**: `new_order`, `status_change`, `order_deleted`, `session_completed`

---

## 서비스 오케스트레이션 패턴

### 주문 생성 플로우
```
고객 → OrderService.create_order()
  → 메뉴 유효성 검증 (MenuService)
  → 주문 저장 (DB)
  → SSEService.broadcast_event("new_order", order_data)
  → 응답 반환
```

### 주문 상태 변경 플로우
```
관리자 → OrderService.update_status()
  → 상태 전이 검증
  → 상태 업데이트 (DB)
  → SSEService.broadcast_event("status_change", {order_id, new_status})
  → 응답 반환
```

### 테이블 이용 완료 플로우
```
관리자 → TableService.complete_session()
  → 현재 세션 주문 조회
  → 주문 이력 테이블로 이동
  → 현재 주문/총액 리셋
  → 새 세션 준비
  → SSEService.broadcast_event("session_completed", {table_id})
  → 응답 반환
```

---

## 통신 패턴

### 동기 호출 (기본)
- 모든 API 요청 → 서비스 호출 → DB 접근은 동기 방식
- FastAPI의 async/await 활용하여 비동기 I/O 처리

### 이벤트 기반 (SSE)
- 주문 관련 상태 변경 시 내부 이벤트 발행
- SSEService가 이벤트를 구독하여 연결된 관리자 클라이언트에 브로드캐스트
- 인메모리 이벤트 큐 사용 (단일 서버 환경)
