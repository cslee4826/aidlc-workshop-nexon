# Customer App Code Generation Plan

## Unit 2: Customer App - 코드 생성 계획

### Unit Context
- **디렉토리**: `table-order/customer-app/`
- **기술 스택**: React 18 + TypeScript + Zustand + Vite
- **스토리**: US-1.1~5.2 (고객 대면 기능 15개)
- **의존성**: Backend API

---

## 코드 생성 단계

### Step 1: 프로젝트 초기화
- [x] Vite + React + TypeScript 프로젝트 구조
- [x] package.json
- [x] tsconfig.json
- [x] vite.config.ts
- [x] index.html

### Step 2: 공통 설정
- [x] API 클라이언트 (axios)
- [x] 타입 정의
- [x] Zustand 스토어 (auth, cart)
- [x] 라우터 설정

### Step 3: 페이지 및 컴포넌트
- [x] SetupPage (초기 설정)
- [x] MenuPage (메뉴 조회)
- [x] CartPage (장바구니)
- [x] OrderConfirmPage (주문 확인)
- [x] OrderHistoryPage (주문 내역)
- [x] 공통 컴포넌트 (Layout, MenuCard, CartItem 등)

### Step 4: 문서
- [x] README.md
