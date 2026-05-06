# 🍽️ 테이블오더 서비스

디지털 주문 시스템을 통해 고객에게는 편리한 주문 경험을, 매장 운영자에게는 효율적인 운영 환경을 제공하는 테이블오더 플랫폼입니다.

## 프로젝트 구조

```
table-order/
├── backend/          # FastAPI 백엔드 API
├── customer-app/     # React 고객용 앱
├── admin-app/        # React 관리자용 앱
└── aidlc-docs/       # AI-DLC 설계 문서
```

## 기술 스택

| 영역 | 기술 |
|---|---|
| Backend | Python 3.9+ / FastAPI / SQLAlchemy 2.0 / SQLite (dev) / PostgreSQL (prod) |
| Customer App | React 18 / TypeScript / Zustand / Vite |
| Admin App | React 18 / TypeScript / Zustand / Vite |
| 실시간 통신 | Server-Sent Events (SSE) |
| 인증 | JWT (16시간 세션) / bcrypt |
| 인프라 | AWS (ECS Fargate, RDS, ElastiCache, ALB, CloudFront) |
| IaC | Terraform |
| CI/CD | GitHub Actions |

## 주요 기능

### 고객용 앱
- 테이블 태블릿 자동 로그인
- 카테고리별 메뉴 조회 (카드 UI + 상세 모달)
- 장바구니 관리 (로컬 저장, 새로고침 유지)
- 주문 생성 (5초 카운트다운 후 메뉴 복귀)
- 주문 내역 조회 (현재 세션)

### 관리자용 앱
- 관리자 로그인 (5회 실패 시 15분 잠금)
- 실시간 주문 대시보드 (SSE 기반, 테이블별 그리드)
- 주문 상태 관리 (대기중 → 준비중 → 완료)
- 테이블 이용 완료 (세션 종료, 이력 이동)
- 메뉴 관리 (CRUD, 카테고리, 순서 조정)
- 매출 달력 (일별 매출 조회)

## 로컬 실행 방법

### 1. 백엔드

```bash
cd table-order/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install bcrypt==4.0.1  # passlib 호환성
python seed.py             # 테스트 데이터 생성
uvicorn app.main:app --reload --port 8000
```

### 2. 고객 앱

```bash
cd table-order/customer-app
npm install
npm run dev
# http://localhost:3000
```

### 3. 관리자 앱

```bash
cd table-order/admin-app
npm install
npm run dev
# http://localhost:3001
```

## 테스트 계정

| 구분 | 매장 식별자 | 사용자명/테이블번호 | 비밀번호 |
|---|---|---|---|
| 관리자 | mystore | admin | admin1234 |
| 테이블 1~5 | mystore | 1 ~ 5 | 1234 |

## API 문서

백엔드 실행 후: http://localhost:8000/docs (Swagger UI)

## 설계 문서

AI-DLC 워크플로우로 생성된 전체 설계 문서는 `table-order/aidlc-docs/`에 있습니다:

- 요구사항 분석 (`inception/requirements/`)
- 유저 스토리 (`inception/user-stories/`)
- 애플리케이션 설계 (`inception/application-design/`)
- 기능 설계 (`construction/backend/functional-design/`)
- NFR 설계 (`construction/backend/nfr-design/`)
- 인프라 설계 (`construction/backend/infrastructure-design/`)

## 라이선스

MIT
