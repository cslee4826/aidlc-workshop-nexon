# 테이블오더 서비스 - 컴포넌트 메서드 정의

---

## 백엔드 API 엔드포인트

### auth 모듈 (관리자 인증)

| Method | Endpoint | Purpose | Input | Output |
|---|---|---|---|---|
| POST | /api/admin/login | 관리자 로그인 | AdminLoginRequest(store_id, username, password) | TokenResponse(access_token, token_type, expires_in) |
| POST | /api/admin/logout | 관리자 로그아웃 | Header: Authorization | SuccessResponse |
| GET | /api/admin/me | 현재 관리자 정보 | Header: Authorization | AdminInfo(id, username, store_id) |

### table-auth 모듈 (테이블 인증)

| Method | Endpoint | Purpose | Input | Output |
|---|---|---|---|---|
| POST | /api/tables/login | 테이블 태블릿 로그인 | TableLoginRequest(store_id, table_number, password) | TableTokenResponse(access_token, table_id, session_id) |
| GET | /api/tables/session | 현재 테이블 세션 정보 | Header: Authorization | TableSessionInfo(table_id, table_number, session_id, session_start) |

### menus 모듈

| Method | Endpoint | Purpose | Input | Output |
|---|---|---|---|---|
| GET | /api/categories | 카테고리 목록 조회 | - | List[CategoryResponse] |
| GET | /api/menus | 메뉴 목록 조회 (카테고리별) | Query: category_id (optional) | List[MenuItemResponse] |
| GET | /api/menus/{id} | 메뉴 상세 조회 | Path: id | MenuItemResponse |
| POST | /api/menus | 메뉴 등록 (관리자) | MenuCreateRequest(name, price, description, category_id, image_url, sort_order) | MenuItemResponse |
| PUT | /api/menus/{id} | 메뉴 수정 (관리자) | MenuUpdateRequest(name?, price?, description?, category_id?, image_url?, sort_order?) | MenuItemResponse |
| DELETE | /api/menus/{id} | 메뉴 삭제 (관리자) | Path: id | SuccessResponse |
| PATCH | /api/menus/sort | 메뉴 순서 변경 (관리자) | MenuSortRequest(items: [{id, sort_order}]) | SuccessResponse |
| POST | /api/categories | 카테고리 등록 (관리자) | CategoryCreateRequest(name, sort_order) | CategoryResponse |
| PUT | /api/categories/{id} | 카테고리 수정 (관리자) | CategoryUpdateRequest(name?, sort_order?) | CategoryResponse |
| DELETE | /api/categories/{id} | 카테고리 삭제 (관리자) | Path: id | SuccessResponse |

### orders 모듈

| Method | Endpoint | Purpose | Input | Output |
|---|---|---|---|---|
| POST | /api/orders | 주문 생성 (고객) | OrderCreateRequest(items: [{menu_item_id, quantity}]) | OrderResponse(order_id, order_number, items, total_amount, status, created_at) |
| GET | /api/orders | 주문 목록 조회 | Query: table_id, session_id, status | List[OrderResponse] |
| GET | /api/orders/{id} | 주문 상세 조회 | Path: id | OrderResponse |
| PATCH | /api/orders/{id}/status | 주문 상태 변경 (관리자) | StatusUpdateRequest(status: pending/preparing/completed) | OrderResponse |
| DELETE | /api/orders/{id} | 주문 삭제 (관리자) | Path: id | SuccessResponse |

### tables 모듈

| Method | Endpoint | Purpose | Input | Output |
|---|---|---|---|---|
| POST | /api/tables | 테이블 등록 (관리자) | TableCreateRequest(table_number, password) | TableResponse |
| GET | /api/tables | 테이블 목록 조회 (관리자) | - | List[TableResponse(id, number, current_session, total_amount)] |
| GET | /api/tables/{id} | 테이블 상세 조회 | Path: id | TableDetailResponse |
| POST | /api/tables/{id}/complete | 테이블 이용 완료 (관리자) | Path: id | SuccessResponse |
| GET | /api/tables/{id}/history | 과거 주문 내역 (관리자) | Query: date_from, date_to | List[OrderHistoryResponse] |

### sse 모듈

| Method | Endpoint | Purpose | Input | Output |
|---|---|---|---|---|
| GET | /api/sse/orders | 주문 실시간 스트림 (관리자) | Header: Authorization | EventStream(event: new_order/status_change/order_deleted) |
