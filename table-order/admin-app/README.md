# Table Order - Admin App

관리자용 테이블오더 웹 앱 (React + TypeScript)

## 기술 스택
- React 18
- TypeScript
- Zustand (상태 관리)
- React Router v6
- Vite (빌드 도구)
- Axios (HTTP 클라이언트)
- SSE (Server-Sent Events)

## 로컬 개발

```bash
npm install
npm run dev
```

http://localhost:3001 에서 실행됩니다.
백엔드 API는 Vite proxy를 통해 http://localhost:8000 으로 프록시됩니다.

## 주요 페이지
- `/` — 주문 대시보드 (테이블별 그리드, 실시간 업데이트)
- `/menus` — 메뉴 관리 (CRUD)
