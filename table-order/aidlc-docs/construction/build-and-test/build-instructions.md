# Build Instructions

## Prerequisites
- **Python**: 3.11+
- **Node.js**: 18+
- **PostgreSQL**: 15+
- **Redis**: 7+
- **Docker**: 24+ (선택)

## Backend Build

### 1. Install Dependencies
```bash
cd table-order/backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements-dev.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# .env 파일에서 DATABASE_URL, REDIS_URL 등 수정
```

### 3. Database Setup
```bash
# PostgreSQL에 데이터베이스 생성
createdb table_order

# 마이그레이션 실행
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### 4. Run Backend Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Verify
- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Customer App Build

### 1. Install Dependencies
```bash
cd table-order/customer-app
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
- http://localhost:3000 에서 실행

### 3. Production Build
```bash
npm run build
# dist/ 디렉토리에 빌드 결과물 생성
```

## Admin App Build

### 1. Install Dependencies
```bash
cd table-order/admin-app
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
- http://localhost:3001 에서 실행

### 3. Production Build
```bash
npm run build
# dist/ 디렉토리에 빌드 결과물 생성
```

## Docker Build (전체)

```bash
cd table-order/backend
docker build -t table-order-backend .
docker run -p 8000:8000 --env-file .env table-order-backend
```

## Troubleshooting

### DB 연결 실패
- PostgreSQL 서비스 실행 확인: `pg_isready`
- DATABASE_URL 형식 확인: `postgresql+asyncpg://user:pass@host:5432/dbname`

### Redis 연결 실패
- Redis 서비스 실행 확인: `redis-cli ping`
- Redis 없이도 서비스 동작 (캐시 비활성화, graceful degradation)

### npm install 실패
- Node.js 18+ 버전 확인: `node --version`
- `node_modules` 삭제 후 재설치: `rm -rf node_modules && npm install`
