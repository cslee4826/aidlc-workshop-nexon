# 테이블오더 서비스 - 컴포넌트 의존성

---

## 의존성 매트릭스 (백엔드)

| 컴포넌트 | 의존 대상 | 관계 유형 |
|---|---|---|
| auth | database, models | 직접 의존 |
| table-auth | database, models | 직접 의존 |
| menus | database, models | 직접 의존 |
| orders | database, models, sse, menus | 직접 의존 (sse는 이벤트 발행) |
| tables | database, models, orders, sse | 직접 의존 (orders 조회, sse 이벤트) |
| sse | models | 직접 의존 |
| database | - | 독립 (인프라 모듈) |
| models | - | 독립 (정의 모듈) |

---

## 데이터 흐름 다이어그램

```
+------------------+     +------------------+     +------------------+
|  Customer App    |     |   Admin App      |     |   Admin App      |
|  (React)         |     |   (React)        |     |   (SSE Client)   |
+--------+---------+     +--------+---------+     +--------+---------+
         |                         |                         |
         | HTTP REST               | HTTP REST               | SSE Stream
         v                         v                         v
+--------+---------+     +--------+---------+     +--------+---------+
| table-auth       |     | auth             |     | sse              |
| menus            |     | menus            |     |                  |
| orders           |     | orders           |     |                  |
| (고객 API)       |     | tables           |     |                  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                         |                         ^
         v                         v                         |
+--------+-------------------------+-------------------------+--------+
|                        Service Layer                                 |
|  AuthService | TableAuthService | MenuService | OrderService        |
|  TableService | SSEService                                          |
+--------+------------------------------------------------------------+
         |
         v
+--------+---------+
|   PostgreSQL     |
|   (database)     |
+------------------+
```

---

## 프론트엔드 의존성

### Customer App → Backend API
| 프론트엔드 컴포넌트 | 사용 API |
|---|---|
| Auth | POST /api/tables/login, GET /api/tables/session |
| Menu | GET /api/categories, GET /api/menus |
| Cart | (로컬 상태만, API 호출 없음) |
| Order | POST /api/orders |
| OrderHistory | GET /api/orders (session 필터) |

### Admin App → Backend API
| 프론트엔드 컴포넌트 | 사용 API |
|---|---|
| Auth | POST /api/admin/login, POST /api/admin/logout |
| Dashboard | GET /api/tables, GET /api/sse/orders |
| OrderManagement | PATCH /api/orders/{id}/status, DELETE /api/orders/{id} |
| TableManagement | POST /api/tables, POST /api/tables/{id}/complete, GET /api/tables/{id}/history |
| MenuManagement | GET/POST/PUT/DELETE /api/menus, /api/categories |

---

## 통신 패턴 요약

| 패턴 | 사용처 | 방향 |
|---|---|---|
| HTTP REST (동기) | 모든 CRUD 작업 | Client → Server |
| SSE (이벤트) | 주문 실시간 업데이트 | Server → Admin Client |
| 내부 이벤트 | OrderService → SSEService | Server 내부 |
| LocalStorage | 장바구니 데이터 | Client 내부 |
