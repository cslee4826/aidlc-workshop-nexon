# 테이블오더 서비스 - Unit of Work 정의

---

## 분해 전략
- **분해 기준**: 배포 단위 (3개 독립 단위)
- **개발 순서**: 기능 슬라이스 (기능별로 백엔드+프론트엔드 함께 개발)
- **설계 깊이**: 백엔드 전체 설계 / 프론트엔드 Code Generation만

---

## Unit 1: Backend API (백엔드)

### 개요
- **이름**: backend
- **기술 스택**: Python + FastAPI + PostgreSQL + SQLAlchemy
- **배포 단위**: 단일 FastAPI 서버
- **디렉토리**: `table-order/backend/`

### 범위 및 책임
- 모든 REST API 엔드포인트 제공
- 데이터베이스 모델 및 마이그레이션 관리
- 비즈니스 로직 처리 (인증, 주문, 메뉴, 테이블 관리)
- SSE 실시간 이벤트 스트리밍
- 보안 (JWT, bcrypt, rate limiting, 입력 검증)

### 포함 컴포넌트
- auth (관리자 인증)
- table-auth (테이블 인증)
- menus (메뉴 관리)
- orders (주문 관리)
- tables (테이블 관리)
- sse (실시간 통신)
- database (DB 연결)
- models (데이터 모델)

### CONSTRUCTION 단계
- [x] Functional Design — 실행
- [x] NFR Requirements — 실행
- [x] NFR Design — 실행
- [x] Infrastructure Design — 실행
- [x] Code Generation — 실행

---

## Unit 2: Customer App (고객용 앱)

### 개요
- **이름**: customer-app
- **기술 스택**: React + TypeScript + Zustand
- **배포 단위**: 정적 웹 앱 (S3 + CloudFront)
- **디렉토리**: `table-order/customer-app/`

### 범위 및 책임
- 고객 대면 UI (메뉴 조회, 장바구니, 주문, 주문 내역)
- 테이블 자동 로그인 및 세션 관리
- 로컬 스토리지 기반 장바구니 관리
- Backend API 호출

### 포함 컴포넌트
- Auth (자동 로그인, 초기 설정)
- Menu (카테고리, 메뉴 카드, 상세)
- Cart (장바구니 관리)
- Order (주문 확인, 전송)
- OrderHistory (주문 내역 조회)

### CONSTRUCTION 단계
- [ ] Functional Design — 건너뜀
- [ ] NFR Requirements — 건너뜀
- [ ] NFR Design — 건너뜀
- [ ] Infrastructure Design — 건너뜀
- [x] Code Generation — 실행

---

## Unit 3: Admin App (관리자용 앱)

### 개요
- **이름**: admin-app
- **기술 스택**: React + TypeScript + Zustand
- **배포 단위**: 정적 웹 앱 (S3 + CloudFront)
- **디렉토리**: `table-order/admin-app/`

### 범위 및 책임
- 관리자 대면 UI (대시보드, 주문 모니터링, 테이블/메뉴 관리)
- 관리자 로그인 및 세션 관리
- SSE 기반 실시간 주문 수신
- Backend API 호출

### 포함 컴포넌트
- Auth (관리자 로그인)
- Dashboard (테이블별 주문 그리드)
- OrderManagement (주문 상세, 상태 변경, 삭제)
- TableManagement (테이블 설정, 이용 완료, 과거 내역)
- MenuManagement (메뉴 CRUD, 순서 조정)

### CONSTRUCTION 단계
- [ ] Functional Design — 건너뜀
- [ ] NFR Requirements — 건너뜀
- [ ] NFR Design — 건너뜀
- [ ] Infrastructure Design — 건너뜀
- [x] Code Generation — 실행

---

## 기능 슬라이스 개발 순서

기능 슬라이스 방식으로 각 기능을 백엔드+프론트엔드 함께 개발합니다.
단, CONSTRUCTION 단계에서는 단위별로 순차 실행합니다:

1. **Unit 1 (Backend)**: Functional Design → NFR Requirements → NFR Design → Infrastructure Design → Code Generation
2. **Unit 2 (Customer App)**: Code Generation
3. **Unit 3 (Admin App)**: Code Generation
4. **Build and Test**: 전체 통합 빌드/테스트
