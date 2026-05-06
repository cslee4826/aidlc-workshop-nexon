# Backend - 논리적 컴포넌트

---

## 1. 미들웨어 스택 (요청 처리 순서)

```
[Client Request]
       |
       v
+------------------+
| 1. CORS          |  ← 오리진 검증, 프리플라이트 처리
+------------------+
       |
       v
+------------------+
| 2. Security      |  ← 보안 헤더 추가 (CSP, HSTS, X-Content-Type-Options)
|    Headers       |
+------------------+
       |
       v
+------------------+
| 3. Request ID    |  ← UUID 생성, 로깅 컨텍스트 바인딩
+------------------+
       |
       v
+------------------+
| 4. Rate Limiter  |  ← slowapi, 엔드포인트별 제한
+------------------+
       |
       v
+------------------+
| 5. Error Handler |  ← 글로벌 예외 처리, 일반화된 응답
+------------------+
       |
       v
+------------------+
| 6. Auth (per     |  ← JWT/테이블 토큰 검증 (라우터별 Depends)
|    router)       |
+------------------+
       |
       v
+------------------+
| 7. Router/       |  ← 비즈니스 로직 실행
|    Handler       |
+------------------+
       |
       v
[Response]
```

---

## 2. 인프라 컴포넌트 매핑

```
+-------------------------------------------------------------------+
|                         AWS Cloud                                   |
+-------------------------------------------------------------------+
|                                                                     |
|  +------------------+     +------------------+                     |
|  |   ALB            |     |   CloudFront     |                     |
|  |   (HTTPS 종단)   |     |   (정적 파일)    |                     |
|  +--------+---------+     +--------+---------+                     |
|           |                         |                               |
|           v                         v                               |
|  +------------------+     +------------------+                     |
|  |   ECS Fargate    |     |   S3 Bucket      |                     |
|  |   (FastAPI)      |     |   (React Apps)   |                     |
|  +--------+---------+     +------------------+                     |
|           |                                                         |
|     +-----+-----+                                                  |
|     |           |                                                   |
|     v           v                                                   |
|  +------+  +--------+                                              |
|  | RDS  |  | Redis  |                                              |
|  | (PG) |  | (Cache)|                                              |
|  +------+  +--------+                                              |
|                                                                     |
|  +------------------+                                              |
|  |   CloudWatch     |                                              |
|  |   (Logs/Metrics) |                                              |
|  +------------------+                                              |
|                                                                     |
+-------------------------------------------------------------------+
```

---

## 3. 컴포넌트 상세

### ALB (Application Load Balancer)
- **역할**: HTTPS 종단, 헬스체크, 트래픽 분배
- **리스너**: 443 (HTTPS) → ECS 타겟 그룹
- **헬스체크**: GET /health, 30초 간격
- **액세스 로그**: S3에 저장 (SECURITY-02)

### ECS Fargate (FastAPI 컨테이너)
- **CPU**: 0.5 vCPU
- **메모리**: 1GB
- **최소 태스크**: 1
- **최대 태스크**: 3 (오토스케일링)
- **스케일링 조건**: CPU 70% 이상 시 스케일 아웃

### RDS PostgreSQL
- **인스턴스**: db.t3.small
- **스토리지**: 20GB gp3 (암호화)
- **백업**: 일 1회 자동, 7일 보존
- **Multi-AZ**: 비활성 (MVP, 비용 절감)
- **TLS**: 필수 (SECURITY-01)
- **서브넷**: 프라이빗 서브넷 (SECURITY-07)

### ElastiCache Redis
- **노드 타입**: cache.t3.micro
- **용도**: 메뉴/카테고리 캐싱, Rate Limiting 카운터
- **암호화**: 전송 중 암호화 (TLS)
- **서브넷**: 프라이빗 서브넷

### CloudWatch
- **로그 그룹**: /ecs/table-order-backend
- **보존 기간**: 90일
- **메트릭**: 커스텀 메트릭 (응답 시간, 에러율)
- **알람**: 5xx 에러 > 5/min, DB 연결 실패

### S3 + CloudFront (프론트엔드)
- **S3**: 정적 파일 호스팅 (퍼블릭 액세스 차단, CloudFront OAI)
- **CloudFront**: HTTPS, 캐싱, 보안 헤더
- **버킷**: customer-app, admin-app 별도

---

## 4. 네트워크 설계

```
VPC (10.0.0.0/16)
+-- Public Subnet (10.0.1.0/24, 10.0.2.0/24)
|   +-- ALB
|   +-- NAT Gateway
|
+-- Private Subnet (10.0.10.0/24, 10.0.11.0/24)
    +-- ECS Fargate Tasks
    +-- RDS PostgreSQL
    +-- ElastiCache Redis
```

### 보안 그룹
| 리소스 | 인바운드 | 아웃바운드 |
|---|---|---|
| ALB | 0.0.0.0/0:443 | ECS SG:8000 |
| ECS | ALB SG:8000 | RDS SG:5432, Redis SG:6379, 0.0.0.0/0:443 (외부 API) |
| RDS | ECS SG:5432 | - |
| Redis | ECS SG:6379 | - |

---

## 5. 환경 변수 설계

```env
# 애플리케이션
APP_ENV=production|development
APP_PORT=8000
APP_HOST=0.0.0.0

# 데이터베이스
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10

# Redis
REDIS_URL=redis://host:6379/0
REDIS_TIMEOUT=500

# 인증
JWT_SECRET_KEY=<secret>
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=16

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# 로깅
LOG_LEVEL=INFO
```
