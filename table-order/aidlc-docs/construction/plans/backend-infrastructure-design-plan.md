# Backend Infrastructure Design Plan

## Unit 1: Backend API - 인프라 설계 계획

---

## Part A: 인프라 결정 질문

### Question 1
IaC(Infrastructure as Code) 도구를 어떤 것을 사용하시겠습니까?

A) AWS CDK (TypeScript)
B) AWS CDK (Python)
C) Terraform
D) AWS CloudFormation (YAML)
X) Other (please describe after [Answer]: tag below)

[Answer]: C 

### Question 2
CI/CD 파이프라인을 어떻게 구성하시겠습니까?

A) GitHub Actions
B) AWS CodePipeline + CodeBuild
C) GitLab CI/CD
D) CI/CD는 나중에 구성 (수동 배포로 시작)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
환경 분리를 어떻게 하시겠습니까?

A) 2개 환경 (dev + prod)
B) 3개 환경 (dev + staging + prod)
C) 1개 환경 (prod만, MVP 단계)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Part B: 생성 단계 (승인 후 실행)

### Step 1: 인프라 설계
- [x] AWS 서비스 매핑 상세화
- [x] 네트워크 토폴로지 확정
- [x] 보안 설정 상세화
- [x] 비용 추정
- [x] `infrastructure-design.md` 생성

### Step 2: 배포 아키텍처
- [x] 컨테이너 빌드 전략
- [x] 배포 프로세스 정의
- [x] 환경별 설정 관리
- [x] `deployment-architecture.md` 생성
