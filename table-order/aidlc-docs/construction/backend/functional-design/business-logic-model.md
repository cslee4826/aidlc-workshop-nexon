# Backend - 비즈니스 로직 모델

---

## 1. 주문 생성 플로우

```
1. 고객이 주문 확정 요청 (POST /api/orders)
2. 입력 검증:
   - items 배열이 비어있지 않은지 확인
   - 각 item의 menu_item_id가 유효한지 확인
   - 각 item의 quantity가 1 이상인지 확인
   - 메뉴가 현재 매장에 속하는지 확인
   - 메뉴가 판매 가능 상태(is_available=true)인지 확인
3. 테이블 세션 확인:
   - 현재 활성 세션이 있는지 확인
   - 없으면 새 세션 자동 생성 (첫 주문 = 세션 시작)
4. 주문 번호 생성:
   - 형식: YYYYMMDD-NNN (당일 매장 내 순차)
   - 당일 해당 매장의 마지막 주문 번호 조회
   - 다음 순번 할당 (001부터 시작)
5. 주문 데이터 생성:
   - Order 레코드 생성 (status='pending')
   - OrderItem 레코드 생성 (메뉴명, 단가 스냅샷 저장)
   - total_amount 계산 (sum of subtotals)
6. SSE 이벤트 발행:
   - event_type: 'new_order'
   - payload: {order_id, table_number, order_number, items, total_amount}
7. 응답 반환:
   - order_id, order_number, items, total_amount, status, created_at
```

---

## 2. 테이블 세션 라이프사이클

```
[세션 없음] → (첫 주문 생성) → [세션 활성]
[세션 활성] → (추가 주문) → [세션 활성] (동일 세션에 주문 추가)
[세션 활성] → (이용 완료) → [세션 종료]
[세션 종료] → (다음 고객 첫 주문) → [새 세션 활성]
```

### 세션 시작 로직
1. 주문 생성 시 해당 테이블의 활성 세션(is_active=true) 조회
2. 활성 세션이 없으면:
   - 새 TableSession 생성 (is_active=true, started_at=now)
   - 생성된 session_id를 주문에 할당
3. 활성 세션이 있으면:
   - 기존 session_id를 주문에 할당

### 세션 종료 (이용 완료) 로직
1. 관리자가 이용 완료 요청 (POST /api/tables/{id}/complete)
2. 해당 테이블의 활성 세션 조회
3. 활성 세션이 없으면 에러 반환 ("활성 세션이 없습니다")
4. 세션의 모든 주문을 OrderHistory로 이동:
   - 각 주문의 항목을 JSONB로 직렬화
   - OrderHistory 레코드 생성 (completed_at=now)
5. 원본 OrderItem, Order 삭제
6. TableSession.is_active = false, completed_at = now
7. SSE 이벤트 발행: 'session_completed'

---

## 3. 관리자 인증 플로우

### 로그인
```
1. 요청: store_identifier + username + password
2. Store 조회 (store_identifier로)
   - 없으면: "매장을 찾을 수 없습니다" 에러
3. Admin 조회 (store_id + username으로)
   - 없으면: "아이디 또는 비밀번호가 올바르지 않습니다" 에러
4. 잠금 상태 확인:
   - locked_until > now이면: "계정이 잠겨있습니다. N분 후 다시 시도해주세요" 에러
5. 비밀번호 검증 (bcrypt.verify):
   - 실패: failed_login_attempts += 1
     - 5회 도달 시: locked_until = now + 15분
     - "아이디 또는 비밀번호가 올바르지 않습니다" 에러
   - 성공: failed_login_attempts = 0, locked_until = null
6. JWT 토큰 발급:
   - payload: {admin_id, store_id, exp: now + 16h}
   - 토큰 반환
```

### 테이블 인증
```
1. 요청: store_identifier + table_number + password
2. Store 조회 → Table 조회
3. 비밀번호 검증 (bcrypt.verify)
4. 테이블 토큰 발급:
   - payload: {table_id, store_id, table_number, exp: now + 16h}
5. 토큰 반환
```

---

## 4. SSE 이벤트 발행 로직

### 아키텍처
```
OrderService/TableService → asyncio.Queue → SSEService → EventStream → Admin Client
```

### 이벤트 타입 및 페이로드

| 이벤트 | 트리거 | 페이로드 |
|---|---|---|
| new_order | 주문 생성 | {order_id, table_number, order_number, items, total_amount, created_at} |
| status_change | 상태 변경 | {order_id, table_number, order_number, old_status, new_status} |
| order_deleted | 주문 삭제 | {order_id, table_number, order_number} |
| session_completed | 이용 완료 | {table_id, table_number, completed_at} |

### 연결 관리
- 관리자 인증 토큰으로 SSE 연결 인증
- 연결 시 해당 매장의 이벤트만 수신
- 연결 끊김 시 자동 정리 (asyncio task 취소)
- 클라이언트 측 EventSource 자동 재연결 활용

---

## 5. 주문 상태 변경 로직

```
1. 관리자가 상태 변경 요청 (PATCH /api/orders/{id}/status)
2. 주문 조회 (해당 매장 소속 확인)
3. 상태 전이 검증 (단방향만 허용):
   - pending → preparing: 허용
   - preparing → completed: 허용
   - 그 외: "허용되지 않는 상태 전이입니다" 에러
4. 상태 업데이트
5. SSE 이벤트 발행: 'status_change'
6. 응답 반환
```

---

## 6. 주문 삭제 로직

```
1. 관리자가 주문 삭제 요청 (DELETE /api/orders/{id})
2. 주문 조회 (해당 매장 소속 확인)
3. OrderItem 삭제
4. Order 삭제
5. SSE 이벤트 발행: 'order_deleted'
6. 응답 반환
```
