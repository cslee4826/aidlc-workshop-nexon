# Backend - 도메인 엔티티 설계

---

## 엔티티 관계도 (ERD)

```
+----------+       +----------+       +----------------+
|  Store   |1----N |  Admin   |       | TableSession   |
+----------+       +----------+       +----------------+
     |1                                      |1
     |N                                      |N
+----------+                           +----------+
|  Table   |1--------------------------| Order    |
+----------+                           +----------+
     |1                                      |1
     |N                                      |N
+----------------+                     +------------+
| TableSession   |                     | OrderItem  |
+----------------+                     +------------+
                                             |N
+----------+       +----------+              |1
| Category |1----N | MenuItem |<-------------+
+----------+       +----------+

+----------------+
| OrderHistory   |  (과거 이력 저장)
+----------------+
```

---

## 엔티티 상세 정의

### Store (매장)
| 속성 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 매장 고유 식별자 |
| store_identifier | VARCHAR(50) | UNIQUE, NOT NULL | 매장 식별자 (로그인용) |
| name | VARCHAR(100) | NOT NULL | 매장명 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | 생성 시각 |

### Admin (관리자)
| 속성 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 관리자 고유 식별자 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| username | VARCHAR(50) | NOT NULL | 사용자명 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시 비밀번호 |
| failed_login_attempts | INTEGER | DEFAULT 0 | 연속 로그인 실패 횟수 |
| locked_until | TIMESTAMP | NULLABLE | 잠금 해제 시각 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | 생성 시각 |
| **UNIQUE** | (store_id, username) | | 매장 내 사용자명 고유 |

### Table (테이블)
| 속성 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 테이블 고유 식별자 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| table_number | INTEGER | NOT NULL | 테이블 번호 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시 비밀번호 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | 생성 시각 |
| **UNIQUE** | (store_id, table_number) | | 매장 내 테이블 번호 고유 |

### TableSession (테이블 세션)
| 속성 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 세션 고유 식별자 |
| table_id | UUID | FK(Table), NOT NULL | 소속 테이블 |
| started_at | TIMESTAMP | NOT NULL, DEFAULT NOW | 세션 시작 시각 |
| completed_at | TIMESTAMP | NULLABLE | 세션 종료 시각 (이용 완료) |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | 활성 세션 여부 |

### Category (카테고리)
| 속성 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 카테고리 고유 식별자 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| name | VARCHAR(50) | NOT NULL | 카테고리명 |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | 노출 순서 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | 생성 시각 |

### MenuItem (메뉴 항목)
| 속성 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 메뉴 고유 식별자 |
| category_id | UUID | FK(Category), NOT NULL | 소속 카테고리 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| name | VARCHAR(100) | NOT NULL | 메뉴명 |
| price | INTEGER | NOT NULL, CHECK(1000~500000) | 가격 (원) |
| description | TEXT | NULLABLE | 메뉴 설명 |
| image_url | VARCHAR(500) | NULLABLE | 이미지 URL |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | 노출 순서 |
| is_available | BOOLEAN | NOT NULL, DEFAULT TRUE | 판매 가능 여부 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | 생성 시각 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | 수정 시각 |

### Order (주문)
| 속성 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 주문 고유 식별자 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| table_id | UUID | FK(Table), NOT NULL | 주문 테이블 |
| session_id | UUID | FK(TableSession), NOT NULL | 소속 세션 |
| order_number | VARCHAR(20) | NOT NULL, UNIQUE | 주문 번호 (YYYYMMDD-NNN) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 주문 상태 |
| total_amount | INTEGER | NOT NULL | 총 주문 금액 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | 주문 시각 |
| **CHECK** | status IN ('pending', 'preparing', 'completed') | | 유효 상태값 |

### OrderItem (주문 항목)
| 속성 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 주문 항목 고유 식별자 |
| order_id | UUID | FK(Order), NOT NULL | 소속 주문 |
| menu_item_id | UUID | FK(MenuItem), NOT NULL | 메뉴 항목 |
| menu_name | VARCHAR(100) | NOT NULL | 주문 시점 메뉴명 (스냅샷) |
| quantity | INTEGER | NOT NULL, CHECK(>=1) | 수량 |
| unit_price | INTEGER | NOT NULL | 주문 시점 단가 (스냅샷) |
| subtotal | INTEGER | NOT NULL | 소계 (quantity * unit_price) |

### OrderHistory (과거 주문 이력)
| 속성 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| id | UUID | PK | 이력 고유 식별자 |
| store_id | UUID | FK(Store), NOT NULL | 소속 매장 |
| table_id | UUID | FK(Table), NOT NULL | 테이블 |
| session_id | UUID | NOT NULL | 원본 세션 ID |
| order_number | VARCHAR(20) | NOT NULL | 원본 주문 번호 |
| order_items | JSONB | NOT NULL | 주문 항목 스냅샷 |
| total_amount | INTEGER | NOT NULL | 총 금액 |
| ordered_at | TIMESTAMP | NOT NULL | 원본 주문 시각 |
| completed_at | TIMESTAMP | NOT NULL | 이용 완료 시각 |

---

## 엔티티 관계 요약

| 관계 | 유형 | 설명 |
|---|---|---|
| Store → Admin | 1:N | 매장에 여러 관리자 |
| Store → Table | 1:N | 매장에 여러 테이블 |
| Store → Category | 1:N | 매장에 여러 카테고리 |
| Store → MenuItem | 1:N | 매장에 여러 메뉴 |
| Category → MenuItem | 1:N | 카테고리에 여러 메뉴 |
| Table → TableSession | 1:N | 테이블에 여러 세션 (시간순) |
| TableSession → Order | 1:N | 세션에 여러 주문 |
| Order → OrderItem | 1:N | 주문에 여러 항목 |
| MenuItem → OrderItem | 1:N | 메뉴가 여러 주문 항목에 참조 |
