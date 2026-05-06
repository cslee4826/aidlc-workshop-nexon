# Backend - 배포 아키텍처

---

## 1. 컨테이너 빌드 전략

### Dockerfile
```dockerfile
# Multi-stage build
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim AS runtime
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY ./app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 이미지 태깅
- **형식**: `{ecr-repo}:{git-sha-short}` (예: `table-order-backend:a1b2c3d`)
- **latest 태그**: 사용하지 않음 (SECURITY-10)
- **빌드 시점**: GitHub Actions에서 main 브랜치 push 시

---

## 2. CI/CD 파이프라인 (GitHub Actions)

### 워크플로우: `.github/workflows/deploy.yml`

```
[Push to main] → [Lint & Test] → [Build Docker] → [Push to ECR] → [Deploy to ECS]
```

### 단계별 상세

| 단계 | 동작 | 조건 |
|---|---|---|
| Lint | ruff check, ruff format --check | 모든 PR/push |
| Test | pytest (단위 + 통합) | 모든 PR/push |
| Security Scan | pip-audit (취약점 검사) | 모든 PR/push |
| Build | Docker 이미지 빌드 | main push만 |
| Push | ECR에 이미지 푸시 | main push만 |
| Deploy (dev) | ECS 서비스 업데이트 (dev) | main push만 |
| Deploy (prod) | ECS 서비스 업데이트 (prod) | 수동 승인 후 |

### PR 워크플로우
```
[PR 생성] → [Lint] → [Test] → [Security Scan] → [리뷰 대기]
```

---

## 3. 배포 프로세스

### Rolling Update (ECS)
- **배포 방식**: ECS Rolling Update
- **최소 건강 태스크**: 100% (기존 태스크 유지하며 새 태스크 시작)
- **최대 태스크**: 200% (새 태스크 추가 후 기존 태스크 제거)
- **헬스체크 유예 기간**: 60초
- **롤백**: 헬스체크 실패 시 자동 롤백

### 배포 순서
```
1. GitHub Actions 트리거 (main push)
2. 테스트 통과 확인
3. Docker 이미지 빌드 + ECR 푸시
4. ECS 태스크 정의 업데이트 (새 이미지 태그)
5. ECS 서비스 업데이트 (Rolling Update)
6. 새 태스크 시작 → 헬스체크 통과 → 기존 태스크 종료
7. 배포 완료 확인
```

---

## 4. 환경별 설정 관리

### 설정 소스
| 설정 유형 | 저장소 | 예시 |
|---|---|---|
| 인프라 설정 | Terraform tfvars | 인스턴스 크기, 태스크 수 |
| 애플리케이션 설정 | ECS 태스크 정의 환경 변수 | APP_ENV, LOG_LEVEL |
| 시크릿 | AWS Secrets Manager | DB 비밀번호, JWT 시크릿 |
| CORS 오리진 | ECS 환경 변수 | CORS_ORIGINS |

### 환경 변수 (환경별)

| 변수 | dev | prod |
|---|---|---|
| APP_ENV | development | production |
| LOG_LEVEL | DEBUG | INFO |
| DB_POOL_SIZE | 5 | 20 |
| CORS_ORIGINS | http://localhost:3000,3001 | https://tableorder.example.com |
| REDIS_URL | (없음) | redis://... |

---

## 5. DB 마이그레이션 전략

### Alembic 마이그레이션
- **실행 시점**: 배포 전 (ECS 태스크 시작 전)
- **실행 방법**: GitHub Actions에서 별도 단계로 실행
- **롤백**: `alembic downgrade -1` (수동)

### 마이그레이션 순서
```
1. 마이그레이션 파일 생성 (개발 시)
2. PR 리뷰에서 마이그레이션 검토
3. main 머지 후 배포 파이프라인에서:
   a. alembic upgrade head (DB 스키마 업데이트)
   b. ECS 서비스 업데이트 (새 코드 배포)
```

---

## 6. 모니터링 및 알림

### CloudWatch 알람
| 알람 | 조건 | 액션 |
|---|---|---|
| ECS CPU 높음 | CPU > 70% (5분) | 스케일 아웃 |
| ECS 5xx 에러 | 5xx > 5/min (3분) | SNS 알림 |
| RDS CPU 높음 | CPU > 80% (5분) | SNS 알림 |
| RDS 연결 수 | > 15 (5분) | SNS 알림 |
| ALB 응답 시간 | p95 > 500ms (5분) | SNS 알림 |

### 대시보드
- ECS: CPU, 메모리, 태스크 수, 요청 수
- RDS: CPU, 연결 수, IOPS, 스토리지
- ALB: 요청 수, 응답 시간, 에러율
- Redis: 히트율, 메모리 사용량, 연결 수
