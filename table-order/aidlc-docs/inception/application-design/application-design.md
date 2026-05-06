# 테이블오더 서비스 - 애플리케이션 설계 통합 문서

---

## 1. 설계 결정사항

| 결정 항목 | 선택 | 근거 |
|---|---|---|
| 백엔드 API 구조 | 도메인별 라우터 분리 | 단순하고 직관적인 구조, FastAPI 라우터 활용 |
| 통신 패턴 | 동기 + SSE 하이브리드 | 기본 CRUD는 동기, 실시간 업데이트만 이벤트 기반 |
| 데이터 접근 | ORM + Raw SQL 혼합 | 기본은 SQLAlchemy ORM, 복잡한 쿼리는 Raw SQL |
| 인증 모듈 | 관리자/테이블 분리 | 인증 방식과 세션 정책이 다르므로 분리 |
| 상태 관리 | Zustand | 경량, 간단한 API, React 생태계 호환 |

---

## 2. 시스템 아키텍처 개요

```
+-------------------------------------------------------------------+
|                        Client Layer                                 |
+-------------------+-------------------+---------------------------+
| Customer App      | Admin App         | Admin App (SSE)           |
| (React + TS)      | (React + TS)      | (EventSource)             |
| - Menu Browse     | - Login           | - Real-time Orders        |
| - Cart (Local)    | - Dashboard       |                           |
| - Order           | - Order Mgmt      |                           |
| - Order History   | - Table Mgmt      |                           |
|                   | - Menu Mgmt       |                           |
+--------+----------+--------+----------+-------------+-------------+
         |                   |                        |
         | HTTPS             | HTTPS                  | SSE
         v                   v                        v
+-------------------------------------------------------------------+
|                     FastAPI Backend                                 |
+-------------------------------------------------------------------+
| Routers: auth | table-auth | menus | orders | tables | sse        |
+-------------------------------------------------------------------+
| Services: AuthService | TableAuthService | MenuService            |
|           OrderService | TableService | SSEService                |
+-------------------------------------------------------------------+
| Data: SQLAlchemy ORM + Raw SQL | Pydantic Schemas                 |
+-------------------------------------------------------------------+
         |
         v
+-------------------------------------------------------------------+
|                     PostgreSQL Database                             |
+-------------------------------------------------------------------+
| Tables: stores | admins | tables | table_sessions | categories    |
|         menu_items | orders | order_items | order_history          |
+-------------------------------------------------------------------+
```

---

## 3. 모노레포 프로젝트 구조

```
table-order/
+-- backend/                    # FastAPI 백엔드
|   +-- app/
|   |   +-- main.py            # FastAPI 앱 엔트리포인트
|   |   +-- config.py          # 설정 관리
|   |   +-- database.py        # DB 연결 관리
|   |   +-- models/            # SQLAlchemy 모델
|   |   +-- schemas/           # Pydantic 스키마
|   |   +-- routers/           # API 라우터 (도메인별)
|   |   |   +-- auth.py
|   |   |   +-- table_auth.py
|   |   |   +-- menus.py
|   |   |   +-- orders.py
|   |   |   +-- tables.py
|   |   |   +-- sse.py
|   |   +-- services/          # 비즈니스 로직
|   |   +-- middleware/        # 미들웨어 (CORS, 보안 헤더, 에러 핸들링)
|   |   +-- utils/             # 유틸리티
|   +-- tests/
|   +-- alembic/               # DB 마이그레이션
|   +-- requirements.txt
|
+-- customer-app/              # 고객용 React 앱
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- stores/            # Zustand 스토어
|   |   +-- api/               # API 클라이언트
|   |   +-- types/
|   +-- package.json
|
+-- admin-app/                 # 관리자용 React 앱
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- stores/            # Zustand 스토어
|   |   +-- api/               # API 클라이언트
|   |   +-- types/
|   +-- package.json
```

---

## 4. 핵심 설계 패턴

### 인증 패턴
- **관리자**: JWT (16시간 만료) → Authorization 헤더
- **테이블**: 테이블 토큰 (세션 기반) → Authorization 헤더
- **미들웨어**: 라우터별 인증 의존성 주입 (FastAPI Depends)

### 실시간 통신 패턴
- **SSE 연결**: 관리자 앱 → GET /api/sse/orders
- **이벤트 발행**: OrderService → 내부 asyncio.Queue → SSEService → 클라이언트
- **재연결**: 클라이언트 측 EventSource 자동 재연결

### 데이터 접근 패턴
- **기본**: SQLAlchemy async ORM (CRUD 작업)
- **복잡 쿼리**: Raw SQL (집계, 과거 내역 조회 등)
- **트랜잭션**: 서비스 레이어에서 관리

### 에러 처리 패턴
- **글로벌 에러 핸들러**: FastAPI exception_handler
- **도메인 예외**: 커스텀 예외 클래스 (NotFound, Unauthorized, ValidationError)
- **응답 형식**: 일관된 에러 응답 스키마

---

## 5. 보안 설계 (Security Baseline 준수)

| 규칙 | 적용 방안 |
|---|---|
| SECURITY-04 | 보안 헤더 미들웨어 (CSP, HSTS, X-Content-Type-Options 등) |
| SECURITY-05 | Pydantic 스키마 기반 입력 검증, 파라미터화된 쿼리 |
| SECURITY-08 | 라우터별 인증 의존성, 리소스 소유권 검증 |
| SECURITY-11 | 인증 모듈 분리, Rate Limiting 미들웨어 |
| SECURITY-12 | bcrypt 해싱, 로그인 시도 제한, Secure/HttpOnly 쿠키 |
| SECURITY-15 | 글로벌 에러 핸들러, try/finally 리소스 정리 |
