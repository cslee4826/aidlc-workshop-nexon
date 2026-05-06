# Backend Code Generation Plan

## Unit 1: Backend API - 코드 생성 계획

### Unit Context
- **디렉토리**: `table-order/backend/`
- **기술 스택**: Python 3.11+ / FastAPI / SQLAlchemy 2.0 / asyncpg / Pydantic 2.0
- **스토리**: US-1.1~9.5 (서버 측 로직 26개)
- **의존성**: PostgreSQL, Redis

---

## 코드 생성 단계

### Step 1: 프로젝트 구조 및 설정 파일
- [x] `backend/` 디렉토리 구조 생성
- [x] `pyproject.toml` 생성
- [x] `requirements.txt` 생성 (고정 버전)
- [x] `requirements-dev.txt` 생성
- [x] `.env.example` 생성
- [x] `Dockerfile` 생성 (multi-stage)
- [x] `alembic.ini` 생성

### Step 2: 애플리케이션 코어
- [x] `app/main.py` — FastAPI 앱 엔트리포인트, 미들웨어 등록
- [x] `app/config.py` — 환경 변수 설정 (Pydantic Settings)
- [x] `app/database.py` — DB 연결, 세션 팩토리, 의존성
- [x] `app/redis.py` — Redis 연결 관리
- [x] `app/exceptions.py` — 커스텀 예외 클래스
- [x] `app/middleware/` — 보안 헤더, 요청 ID, 에러 핸들러 (main.py에 통합)

### Step 3: 데이터 모델 (SQLAlchemy)
- [x] `app/models/__init__.py`
- [x] `app/models/store.py` — Store 모델
- [x] `app/models/admin.py` — Admin 모델
- [x] `app/models/table.py` — Table, TableSession 모델
- [x] `app/models/menu.py` — Category, MenuItem 모델
- [x] `app/models/order.py` — Order, OrderItem, OrderHistory 모델

### Step 4: Pydantic 스키마
- [x] `app/schemas/__init__.py`
- [x] `app/schemas/auth.py` — 인증 요청/응답 스키마
- [x] `app/schemas/menu.py` — 메뉴 요청/응답 스키마
- [x] `app/schemas/order.py` — 주문 요청/응답 스키마
- [x] `app/schemas/table.py` — 테이블 요청/응답 스키마
- [x] `app/schemas/common.py` — 공통 응답 스키마

### Step 5: 서비스 레이어
- [x] `app/services/__init__.py`
- [x] `app/services/auth_service.py` — 관리자 인증 (JWT, bcrypt, 잠금)
- [x] `app/services/table_auth_service.py` — 테이블 인증
- [x] `app/services/order_service.py` — 주문 생성, 상태 변경, 삭제
- [x] `app/services/sse_service.py` — SSE 이벤트 브로드캐스트

### Step 6: API 라우터
- [x] `app/routers/__init__.py`
- [x] `app/routers/auth.py` — POST /api/admin/login, logout, me
- [x] `app/routers/table_auth.py` — POST /api/tables/login, GET session
- [x] `app/routers/menus.py` — 메뉴/카테고리 CRUD 엔드포인트
- [x] `app/routers/orders.py` — 주문 생성, 조회, 상태 변경, 삭제
- [x] `app/routers/tables.py` — 테이블 등록, 이용 완료, 과거 내역
- [x] `app/routers/sse.py` — SSE 스트림 엔드포인트
- [x] `app/routers/health.py` — 헬스체크

### Step 7: 인증 의존성 및 유틸리티
- [x] `app/dependencies/auth.py` — AdminAuth, TableAuth 의존성
- [x] `app/utils/security.py` — JWT 생성/검증, 비밀번호 해싱
- [x] `app/utils/order_number.py` — 주문 번호 생성 로직

### Step 8: DB 마이그레이션
- [x] `alembic/` 디렉토리 구조
- [x] `alembic/env.py` 설정
- [x] 초기 마이그레이션 스크립트 구조 (alembic revision으로 생성)

### Step 9: 단위 테스트
- [x] `tests/conftest.py` — 테스트 설정, 픽스처
- [x] `tests/test_auth.py` — 인증 유틸리티 테스트
- [x] `tests/test_health.py` — 헬스체크 테스트

### Step 10: 배포 및 문서
- [x] `.github/workflows/ci.yml` — CI 파이프라인
- [x] `backend/README.md` — 프로젝트 설명, 실행 방법
