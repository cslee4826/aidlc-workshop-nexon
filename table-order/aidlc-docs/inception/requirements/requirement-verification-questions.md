# 요구사항 확인 질문

아래 질문에 답변해 주세요. 각 질문의 [Answer]: 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.
선택지 중 맞는 것이 없으면 마지막 옵션(Other)을 선택하고 설명을 추가해 주세요.

---

## Question 1
백엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) Node.js + Express (TypeScript)
B) Node.js + NestJS (TypeScript)
C) Python + FastAPI
D) Java + Spring Boot
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 2
프론트엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) React (TypeScript)
B) Next.js (TypeScript)
C) Vue.js (TypeScript)
D) Svelte/SvelteKit
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
데이터베이스로 어떤 것을 사용하시겠습니까?

A) PostgreSQL
B) MySQL
C) MongoDB
D) SQLite (개발/프로토타입용)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
프로젝트 구조를 어떻게 구성하시겠습니까?

A) 모노레포 (프론트엔드 + 백엔드를 하나의 저장소에서 관리)
B) 분리된 저장소 (프론트엔드와 백엔드를 별도 저장소로 관리)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
배포 환경은 어떻게 계획하고 계십니까?

A) AWS (EC2, ECS, Lambda 등)
B) Docker 컨테이너 기반 (로컬/온프레미스)
C) 클라우드 PaaS (Heroku, Railway, Render 등)
D) 배포 환경은 아직 미정 (개발 환경만 우선 구축)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
고객용 인터페이스와 관리자용 인터페이스를 어떻게 구성하시겠습니까?

A) 하나의 프론트엔드 앱에서 라우팅으로 분리
B) 별도의 프론트엔드 앱으로 분리 (고객용 앱 + 관리자용 앱)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 7
메뉴 이미지 관리는 어떻게 하시겠습니까?

A) 외부 이미지 URL 직접 입력 (별도 이미지 호스팅 사용)
B) 서버에 이미지 파일 업로드 기능 구현
C) 클라우드 스토리지 연동 (S3, CloudFront 등)
D) 이미지 없이 텍스트만으로 MVP 구현
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
매장(Store) 관리 범위는 어떻게 되나요?

A) 단일 매장만 지원 (하나의 매장에 대한 시스템)
B) 다중 매장 지원 (여러 매장을 하나의 시스템에서 관리)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) Yes — 모든 보안 규칙을 블로킹 제약으로 적용 (프로덕션 수준 애플리케이션에 권장)
B) No — 보안 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 10: Property-Based Testing Extension
이 프로젝트에 속성 기반 테스팅(PBT) 규칙을 적용하시겠습니까?

A) Yes — 모든 PBT 규칙을 블로킹 제약으로 적용 (비즈니스 로직, 데이터 변환이 있는 프로젝트에 권장)
B) Partial — 순수 함수와 직렬화 라운드트립에만 PBT 규칙 적용
C) No — PBT 규칙 건너뛰기 (단순 CRUD, UI 전용 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: C
