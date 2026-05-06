# 테이블오더 서비스 - 컴포넌트 정의

---

## 백엔드 컴포넌트 (FastAPI)

### 1. auth (인증 모듈 - 관리자)
- **책임**: 관리자 로그인, JWT 발급/검증, 세션 관리
- **인터페이스**: POST /api/admin/login, POST /api/admin/logout, GET /api/admin/me

### 2. table-auth (인증 모듈 - 테이블)
- **책임**: 테이블 태블릿 인증, 테이블 세션 토큰 발급/검증
- **인터페이스**: POST /api/tables/login, GET /api/tables/session

### 3. menus (메뉴 모듈)
- **책임**: 메뉴 CRUD, 카테고리 관리, 메뉴 순서 관리
- **인터페이스**: GET /api/menus, POST /api/menus, PUT /api/menus/{id}, DELETE /api/menus/{id}, GET /api/categories

### 4. orders (주문 모듈)
- **책임**: 주문 생성, 주문 조회, 주문 상태 변경, 주문 삭제
- **인터페이스**: POST /api/orders, GET /api/orders, PATCH /api/orders/{id}/status, DELETE /api/orders/{id}

### 5. tables (테이블 모듈)
- **책임**: 테이블 등록/관리, 세션 시작/종료, 과거 내역 조회
- **인터페이스**: POST /api/tables, GET /api/tables, POST /api/tables/{id}/complete, GET /api/tables/{id}/history

### 6. sse (실시간 통신 모듈)
- **책임**: SSE 연결 관리, 주문 이벤트 브로드캐스트
- **인터페이스**: GET /api/sse/orders (EventStream)

### 7. database (데이터베이스 모듈)
- **책임**: DB 연결 관리, 세션 팩토리, 마이그레이션
- **인터페이스**: 내부 모듈 (get_db 의존성 주입)

### 8. models (데이터 모델 모듈)
- **책임**: SQLAlchemy 모델 정의, Pydantic 스키마 정의
- **인터페이스**: 내부 모듈 (다른 모듈에서 import)

---

## 고객용 프론트엔드 컴포넌트 (React - customer-app)

### 1. Auth (인증)
- **책임**: 자동 로그인, 초기 설정 화면, 세션 관리
- **페이지**: SetupPage, (자동 리다이렉트)

### 2. Menu (메뉴)
- **책임**: 카테고리 탭, 메뉴 카드 목록, 메뉴 상세 모달
- **페이지**: MenuPage
- **컴포넌트**: CategoryTabs, MenuCard, MenuDetailModal

### 3. Cart (장바구니)
- **책임**: 장바구니 항목 관리, 수량 조절, 총액 계산
- **페이지**: CartPage
- **컴포넌트**: CartItem, CartSummary, CartFloatingBar

### 4. Order (주문)
- **책임**: 주문 확인, 주문 전송, 주문 성공/실패 처리
- **페이지**: OrderConfirmPage, OrderSuccessPage

### 5. OrderHistory (주문 내역)
- **책임**: 현재 세션 주문 목록, 주문 상태 표시
- **페이지**: OrderHistoryPage
- **컴포넌트**: OrderCard, StatusBadge

---

## 관리자용 프론트엔드 컴포넌트 (React - admin-app)

### 1. Auth (인증)
- **책임**: 관리자 로그인, 세션 관리, 로그아웃
- **페이지**: LoginPage

### 2. Dashboard (대시보드)
- **책임**: 테이블별 주문 현황 그리드, 실시간 업데이트
- **페이지**: DashboardPage
- **컴포넌트**: TableCard, OrderPreview, SSEConnectionStatus

### 3. OrderManagement (주문 관리)
- **책임**: 주문 상세 보기, 상태 변경, 주문 삭제
- **컴포넌트**: OrderDetailModal, StatusChangeButton, DeleteOrderButton

### 4. TableManagement (테이블 관리)
- **책임**: 테이블 설정, 이용 완료, 과거 내역 조회
- **컴포넌트**: TableSetupForm, CompleteSessionButton, HistoryModal

### 5. MenuManagement (메뉴 관리)
- **책임**: 메뉴 CRUD, 카테고리 관리, 순서 조정
- **페이지**: MenuManagementPage
- **컴포넌트**: MenuForm, MenuList, CategoryManager, SortableMenuList
