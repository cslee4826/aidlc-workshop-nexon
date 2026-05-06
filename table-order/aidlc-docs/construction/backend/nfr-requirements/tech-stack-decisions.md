# Backend - 기술 스택 결정

---

## 핵심 프레임워크

| 기술 | 버전 | 용도 | 선택 근거 |
|---|---|---|---|
| Python | 3.11+ | 런타임 | 안정적, FastAPI 호환 |
| FastAPI | 0.100+ | 웹 프레임워크 | 비동기, 자동 문서화, Pydantic 통합 |
| Uvicorn | 0.23+ | ASGI 서버 | 고성능 비동기 서버 |
| Pydantic | 2.0+ | 데이터 검증 | 타입 안전, 자동 검증 |

---

## 데이터베이스

| 기술 | 버전 | 용도 | 선택 근거 |
|---|---|---|---|
| PostgreSQL | 15+ | 주 데이터베이스 | JSONB 지원, 안정성, AWS RDS 호환 |
| SQLAlchemy | 2.0+ | ORM | 비동기 지원, 성숙한 생태계 |
| asyncpg | 0.28+ | DB 드라이버 | 고성능 비동기 PostgreSQL 드라이버 |
| Alembic | 1.12+ | 마이그레이션 | SQLAlchemy 통합, 버전 관리 |

---

## 인증/보안

| 기술 | 용도 | 선택 근거 |
|---|---|---|
| python-jose | JWT 토큰 생성/검증 | 경량, 표준 준수 |
| passlib[bcrypt] | 비밀번호 해싱 | bcrypt 지원, 안전한 기본값 |
| slowapi | Rate Limiting | FastAPI 통합, 간단한 설정 |

---

## 로깅/모니터링

| 기술 | 용도 | 선택 근거 |
|---|---|---|
| structlog | 구조화된 로깅 | JSON 출력, 컨텍스트 바인딩 |
| uvicorn.access | 접근 로그 | 기본 제공 |

---

## 개발/테스트

| 기술 | 용도 | 선택 근거 |
|---|---|---|
| pytest | 테스트 프레임워크 | 표준, 풍부한 플러그인 |
| pytest-asyncio | 비동기 테스트 | FastAPI 비동기 테스트 지원 |
| httpx | HTTP 테스트 클라이언트 | 비동기 지원, FastAPI TestClient 호환 |
| factory-boy | 테스트 데이터 생성 | 모델 팩토리 패턴 |
| ruff | 린터/포매터 | 빠른 속도, 통합 도구 |

---

## 인프라 관련

| 기술 | 용도 | 선택 근거 |
|---|---|---|
| Docker | 컨테이너화 | 일관된 배포 환경 |
| AWS RDS (PostgreSQL) | 관리형 DB | 자동 백업, 암호화, 고가용성 |
| AWS ECS Fargate | 컨테이너 실행 | 서버리스 컨테이너, 자동 스케일링 |
| AWS ALB | 로드 밸런서 | HTTPS 종단, 헬스체크 |
| AWS CloudWatch | 로깅/모니터링 | 통합 모니터링, 알림 |

---

## 의존성 관리

| 항목 | 방식 |
|---|---|
| 패키지 관리 | pip + requirements.txt (고정 버전) |
| Lock 파일 | requirements.txt에 정확한 버전 명시 |
| 취약점 스캔 | pip-audit (CI/CD 통합) |
| Python 버전 | pyproject.toml에 명시 |

---

## 프로젝트 설정 파일

```
backend/
+-- pyproject.toml          # 프로젝트 메타데이터, 도구 설정
+-- requirements.txt        # 프로덕션 의존성 (고정 버전)
+-- requirements-dev.txt    # 개발 의존성
+-- Dockerfile              # 컨테이너 빌드
+-- .env.example            # 환경 변수 템플릿
+-- alembic.ini             # 마이그레이션 설정
```
