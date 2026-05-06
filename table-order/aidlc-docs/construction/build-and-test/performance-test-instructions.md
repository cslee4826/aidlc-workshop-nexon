# Performance Test Instructions

## Performance Requirements
- **API 응답 시간**: < 200ms (p95)
- **SSE 이벤트 전달**: < 1초
- **동시 접속**: 50~100명
- **처리량**: 100 req/s
- **에러율**: < 1%

## Setup Performance Test Environment

### 1. Prepare Environment
```bash
# 프로덕션과 유사한 환경 구성
# Docker Compose로 전체 스택 실행
docker-compose up -d

# 또는 로컬에서 실행
cd table-order/backend
uvicorn app.main:app --workers 2 --port 8000
```

### 2. Seed Test Data
```bash
# 충분한 테스트 데이터 생성
# - 1개 매장
# - 30개 테이블
# - 5개 카테고리, 50개 메뉴
# - 100개 기존 주문
```

## Performance Test Scenarios

### Load Test: 메뉴 조회 (읽기 부하)
```bash
# k6 또는 locust 사용
# 50 동시 사용자, 5분간 메뉴 조회 반복
# Target: p95 < 200ms, 에러율 < 1%
```

### Load Test: 주문 생성 (쓰기 부하)
```bash
# 30 동시 테이블에서 주문 생성
# 1분간 각 테이블 2초 간격 주문
# Target: p95 < 200ms, 에러율 < 1%
```

### SSE 연결 테스트
```bash
# 10개 동시 SSE 연결 유지
# 주문 생성 시 모든 연결에 1초 이내 이벤트 전달 확인
```

### Stress Test: 한계 확인
```bash
# 점진적으로 동시 사용자 증가 (10 → 50 → 100 → 200)
# 응답 시간 저하 시점 및 에러 발생 시점 확인
```

## Tools

### k6 (권장)
```bash
# 설치
brew install k6

# 실행 예시
k6 run --vus 50 --duration 5m performance-test.js
```

### locust (Python 기반)
```bash
pip install locust
locust -f locustfile.py --headless -u 50 -r 10 --run-time 5m
```

## Analyze Results
- **p50, p95, p99 응답 시간** 확인
- **초당 요청 수 (RPS)** 확인
- **에러율** 확인
- **DB 연결 풀 사용률** 모니터링
- **메모리/CPU 사용량** 모니터링

## Optimization (필요 시)
1. Redis 캐시 히트율 확인 및 TTL 조정
2. DB 쿼리 최적화 (인덱스 추가)
3. 연결 풀 크기 조정
4. 워커 수 조정
