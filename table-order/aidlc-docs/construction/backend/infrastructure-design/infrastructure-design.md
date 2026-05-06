# Backend - 인프라 설계

---

## 1. AWS 서비스 매핑

| 논리적 컴포넌트 | AWS 서비스 | 사양 | 환경 |
|---|---|---|---|
| 웹 서버 (FastAPI) | ECS Fargate | 0.5 vCPU / 1GB RAM | dev, prod |
| 로드 밸런서 | ALB | HTTPS 종단 | dev, prod |
| 데이터베이스 | RDS PostgreSQL 15 | db.t3.small / 20GB gp3 | dev, prod |
| 캐시 | ElastiCache Redis | cache.t3.micro | prod only |
| 정적 파일 (프론트엔드) | S3 + CloudFront | - | dev, prod |
| 로깅/모니터링 | CloudWatch | 로그 그룹 + 메트릭 | dev, prod |
| 시크릿 관리 | AWS Secrets Manager | DB 비밀번호, JWT 시크릿 | dev, prod |
| 컨테이너 레지스트리 | ECR | Docker 이미지 저장 | 공유 |
| DNS | Route 53 | 도메인 관리 | prod |
| 인증서 | ACM | HTTPS 인증서 | prod |

---

## 2. 네트워크 토폴로지

```
+-------------------------------------------------------------------+
|  VPC: 10.0.0.0/16                                                  |
|                                                                     |
|  +-- AZ-a -------------------------+  +-- AZ-b ------------------+ |
|  |                                  |  |                          | |
|  |  Public Subnet: 10.0.1.0/24     |  |  Public: 10.0.2.0/24    | |
|  |  +-- ALB                        |  |  +-- ALB               | |
|  |  +-- NAT Gateway                |  |                          | |
|  |                                  |  |                          | |
|  |  Private Subnet: 10.0.10.0/24   |  |  Private: 10.0.11.0/24  | |
|  |  +-- ECS Tasks                  |  |  +-- ECS Tasks          | |
|  |  +-- RDS (Primary)              |  |  +-- RDS (Standby)*     | |
|  |  +-- ElastiCache                |  |                          | |
|  |                                  |  |                          | |
|  +----------------------------------+  +--------------------------+ |
+-------------------------------------------------------------------+

* RDS Standby: prod 환경에서 향후 Multi-AZ 활성화 시
```

---

## 3. 보안 설정

### IAM 역할
| 역할 | 권한 | 용도 |
|---|---|---|
| ecs-task-execution-role | ECR Pull, CloudWatch Logs, Secrets Manager Read | ECS 태스크 실행 |
| ecs-task-role | S3 Read (필요 시), Secrets Manager Read | 애플리케이션 런타임 |

### 보안 그룹
| 이름 | 인바운드 | 아웃바운드 |
|---|---|---|
| alb-sg | 0.0.0.0/0:443 | ecs-sg:8000 |
| ecs-sg | alb-sg:8000 | rds-sg:5432, redis-sg:6379, 0.0.0.0/0:443 |
| rds-sg | ecs-sg:5432 | - |
| redis-sg | ecs-sg:6379 | - |

### 암호화
| 대상 | 방식 |
|---|---|
| RDS 스토리지 | AWS KMS (기본 키) |
| RDS 연결 | TLS 1.2+ 필수 |
| ElastiCache | 전송 중 암호화 (TLS) |
| ALB | ACM 인증서 (HTTPS) |
| S3 | SSE-S3 기본 암호화 |
| Secrets Manager | AWS KMS 암호화 |

---

## 4. 환경별 설정

### dev 환경
| 항목 | 설정 |
|---|---|
| ECS 태스크 수 | 1 (고정) |
| RDS | db.t3.micro, 10GB, Single-AZ |
| Redis | 없음 (캐싱 비활성화, DB 직접 조회) |
| CloudFront | 없음 (S3 직접 접근) |
| 도메인 | dev.tableorder.example.com |
| 로그 보존 | 7일 |

### prod 환경
| 항목 | 설정 |
|---|---|
| ECS 태스크 수 | 1~3 (오토스케일링, CPU 70%) |
| RDS | db.t3.small, 20GB, Single-AZ (MVP) |
| Redis | cache.t3.micro |
| CloudFront | 활성화 (프론트엔드 CDN) |
| 도메인 | tableorder.example.com |
| 로그 보존 | 90일 |

---

## 5. 비용 추정 (월간, prod 기준)

| 서비스 | 예상 비용 (USD) | 비고 |
|---|---|---|
| ECS Fargate (1 태스크) | ~$15 | 0.5 vCPU, 1GB, 24/7 |
| RDS PostgreSQL (t3.small) | ~$30 | Single-AZ, 20GB |
| ElastiCache Redis (t3.micro) | ~$13 | 단일 노드 |
| ALB | ~$20 | 기본 요금 + LCU |
| CloudFront | ~$5 | 정적 파일 배포 |
| S3 | ~$1 | 정적 파일 저장 |
| CloudWatch | ~$5 | 로그 + 메트릭 |
| Secrets Manager | ~$1 | 시크릿 2~3개 |
| NAT Gateway | ~$35 | 시간당 + 데이터 |
| Route 53 | ~$1 | 호스팅 존 |
| **합계** | **~$126/월** | |

---

## 6. Terraform 모듈 구조

```
infra/
+-- environments/
|   +-- dev/
|   |   +-- main.tf
|   |   +-- variables.tf
|   |   +-- terraform.tfvars
|   +-- prod/
|       +-- main.tf
|       +-- variables.tf
|       +-- terraform.tfvars
+-- modules/
|   +-- vpc/              # VPC, 서브넷, NAT, IGW
|   +-- ecs/              # ECS 클러스터, 서비스, 태스크 정의
|   +-- rds/              # RDS 인스턴스, 서브넷 그룹
|   +-- redis/            # ElastiCache 클러스터
|   +-- alb/              # ALB, 타겟 그룹, 리스너
|   +-- s3-cloudfront/    # S3 버킷, CloudFront 배포
|   +-- ecr/              # ECR 리포지토리
|   +-- security/         # 보안 그룹, IAM 역할
+-- backend.tf            # Terraform 상태 저장 (S3 + DynamoDB)
```
