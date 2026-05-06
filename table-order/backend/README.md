# Table Order Backend API

테이블오더 서비스 백엔드 API (FastAPI + PostgreSQL)

## 기술 스택
- Python 3.11+
- FastAPI
- SQLAlchemy 2.0 (async)
- PostgreSQL 15+
- Redis (캐싱)
- Alembic (마이그레이션)

## 로컬 개발 환경 설정

```bash
# 가상환경 생성
python -m venv venv
source venv/bin/activate

# 의존성 설치
pip install -r requirements-dev.txt

# 환경 변수 설정
cp .env.example .env

# DB 마이그레이션
alembic upgrade head

# 서버 실행
uvicorn app.main:app --reload --port 8000
```

## API 문서
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 테스트
```bash
pytest -v
```

## 프로젝트 구조
```
backend/
+-- app/
|   +-- main.py          # FastAPI 앱 엔트리포인트
|   +-- config.py        # 환경 설정
|   +-- database.py      # DB 연결
|   +-- redis.py         # Redis 연결
|   +-- exceptions.py    # 커스텀 예외
|   +-- models/          # SQLAlchemy 모델
|   +-- schemas/         # Pydantic 스키마
|   +-- routers/         # API 라우터
|   +-- services/        # 비즈니스 로직
|   +-- dependencies/    # FastAPI 의존성
|   +-- utils/           # 유틸리티
+-- tests/               # 테스트
+-- alembic/             # DB 마이그레이션
```
