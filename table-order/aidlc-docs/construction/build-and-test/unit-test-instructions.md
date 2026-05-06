# Unit Test Execution

## Backend Unit Tests

### 1. Execute All Unit Tests
```bash
cd table-order/backend
source venv/bin/activate
pytest -v
```

### 2. Run with Coverage
```bash
pytest --cov=app --cov-report=html
# htmlcov/index.html 에서 커버리지 리포트 확인
```

### 3. Run Specific Test Files
```bash
pytest tests/test_auth.py -v
pytest tests/test_health.py -v
```

### 4. Expected Results
- **test_auth.py**: 비밀번호 해싱, JWT 토큰 생성/검증 테스트 통과
- **test_health.py**: 헬스체크 엔드포인트 응답 확인

### 5. Lint Check
```bash
ruff check .
ruff format --check .
```

### 6. Security Scan
```bash
pip-audit
```

## Frontend Unit Tests (향후 추가)

Customer App과 Admin App의 단위 테스트는 다음 도구로 추가 가능:
- Vitest (Vite 네이티브 테스트 러너)
- React Testing Library
- MSW (Mock Service Worker)

```bash
# 추가 시
cd table-order/customer-app
npm run test

cd table-order/admin-app
npm run test
```

## Fix Failing Tests

1. 테스트 출력에서 실패 원인 확인
2. 관련 코드 수정
3. `pytest -v` 재실행하여 통과 확인
