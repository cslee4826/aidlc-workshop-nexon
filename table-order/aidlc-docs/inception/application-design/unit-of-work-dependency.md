# 테이블오더 서비스 - Unit of Work 의존성

---

## 의존성 매트릭스

| Unit | 의존 대상 | 의존 유형 | 설명 |
|---|---|---|---|
| Backend API | - | 독립 | 다른 단위에 의존하지 않음 |
| Customer App | Backend API | 런타임 의존 | API 호출로 데이터 조회/생성 |
| Admin App | Backend API | 런타임 의존 | API 호출 + SSE 스트림 구독 |

---

## 의존성 다이어그램

```
+------------------+
|   Backend API    |  ← 독립 (먼저 개발 가능)
+--------+---------+
         ^
         |
    +----+----+
    |         |
+---+---+ +---+---+
|Customer| | Admin |
|  App   | |  App  |
+--------+ +-------+
```

---

## 개발 순서 및 통합 포인트

### Phase 1: Backend API 설계 + 구현
- Functional Design, NFR, Infrastructure Design 수행
- 모든 API 엔드포인트 구현
- DB 스키마 및 마이그레이션 완성
- **통합 포인트**: API 스펙 확정 → 프론트엔드 개발 시작 가능

### Phase 2: Customer App 구현
- Backend API가 제공하는 엔드포인트 기반으로 개발
- Code Generation만 수행 (설계 단계 건너뜀)
- **통합 포인트**: 고객 주문 플로우 E2E 테스트

### Phase 3: Admin App 구현
- Backend API + SSE 엔드포인트 기반으로 개발
- Code Generation만 수행 (설계 단계 건너뜀)
- **통합 포인트**: 관리자 모니터링 + 주문 상태 변경 E2E 테스트

### Phase 4: 통합 Build and Test
- 3개 단위 통합 테스트
- 전체 플로우 검증 (고객 주문 → 관리자 확인 → 상태 변경 → 고객 확인)

---

## 공유 리소스

| 리소스 | 공유 단위 | 관리 방식 |
|---|---|---|
| API 스키마 (타입) | Backend ↔ Customer/Admin | Backend의 Pydantic 스키마가 기준 |
| 인증 토큰 | Backend ↔ Customer/Admin | JWT 토큰 형식 공유 |
| SSE 이벤트 형식 | Backend ↔ Admin | 이벤트 타입/페이로드 스키마 공유 |
| 주문 상태 enum | 전체 | Backend에서 정의, 프론트엔드에서 동일하게 사용 |
