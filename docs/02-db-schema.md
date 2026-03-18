# 납골당 플랫폼 — DB 스키마 초안 (ERD 수준)

## 1. 설계 원칙

- 모든 핵심 테이블: `created_at`, `updated_at` 포함.
- 멀티 사업자: `operator_id` 명시.
- Soft delete 필요 시 `deleted_at` 사용.
- 계약 이력 덮어쓰기 금지. 재판매는 기존 계약 종료 + 신규 계약 생성.

---

## 2. 인증·회원

### 2.1 users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| login_id | VARCHAR(64) UNIQUE NOT NULL | 로그인 아이디 |
| password_hash | VARCHAR(255) | 일반 로그인 시 (소셜만 있으면 NULL) |
| name | VARCHAR(100) NOT NULL | |
| birth_date | DATE | 생년월일 |
| phone | VARCHAR(20) | 휴대폰 (인증 연동용) |
| email | VARCHAR(255) | |
| role | ENUM | USER, SALES_MANAGER, OPERATOR_ADMIN, SUPER_ADMIN |
| address_road | VARCHAR(255) | 도로명 주소 |
| address_jibun | VARCHAR(255) | 지번 주소 |
| address_detail | VARCHAR(255) | 상세 주소 |
| postal_code | VARCHAR(20) | |
| terms_agreed_at | TIMESTAMPTZ | 이용약관 동의 |
| privacy_agreed_at | TIMESTAMPTZ | 개인정보 처리 동의 |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**인덱스**: login_id, email, phone, role.

### 2.2 auth_identities
소셜/일반 계정 병합용.
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| user_id | UUID FK users NOT NULL | |
| provider | VARCHAR(32) NOT NULL | 'local', 'naver', 'kakao' |
| provider_user_id | VARCHAR(255) NOT NULL | 외부 식별자 |
| metadata | JSONB | 프로필 등 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**UNIQUE**: (provider, provider_user_id). **인덱스**: user_id.

### 2.3 phone_verifications
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| phone | VARCHAR(20) NOT NULL | |
| code | VARCHAR(10) | 인증번호 |
| purpose | VARCHAR(32) | signup, login, reset 등 |
| verified_at | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

**인덱스**: phone, expires_at.

### 2.4 user_agreements
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| user_id | UUID FK users | |
| agreement_type | VARCHAR(64) | terms, privacy, marketing 등 |
| version | VARCHAR(20) | |
| agreed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

---

## 3. 사업자·시설·배치·칸

### 3.1 operators
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| name | VARCHAR(200) NOT NULL | 사업자명 |
| business_number | VARCHAR(20) | 사업자등록번호 |
| contact_phone | VARCHAR(20) | |
| contact_email | VARCHAR(255) | |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 3.2 operator_admins
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| operator_id | UUID FK operators NOT NULL | |
| user_id | UUID FK users NOT NULL | |
| role | VARCHAR(32) | OPERATOR_ADMIN 등 |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**UNIQUE**: (operator_id, user_id).

### 3.3 facilities
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| operator_id | UUID FK operators NOT NULL | |
| name | VARCHAR(200) NOT NULL | |
| address_road | VARCHAR(255) | 도로명 |
| address_jibun | VARCHAR(255) | 지번 |
| address_detail | VARCHAR(255) | 상세 |
| postal_code | VARCHAR(20) | |
| lat | DECIMAL(10,7) | |
| lng | DECIMAL(10,7) | |
| phone | VARCHAR(20) | |
| description | TEXT | |
| business_hours | JSONB | |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**인덱스**: operator_id, (lat, lng).

### 3.4 facility_buildings
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| facility_id | UUID FK facilities NOT NULL | |
| name | VARCHAR(100) | 건물/관명 |
| sort_order | INT DEFAULT 0 | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 3.5 facility_floors
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| facility_id | UUID FK facilities NOT NULL | |
| building_id | UUID FK facility_buildings | NULL 가능 |
| floor_name | VARCHAR(50) | 층명 |
| floor_no | INT | 층 번호 |
| sort_order | INT DEFAULT 0 | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 3.6 facility_sections
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| facility_id | UUID FK facilities NOT NULL | |
| floor_id | UUID FK facility_floors | NULL 가능 |
| name | VARCHAR(100) | 구역명 |
| sort_order | INT DEFAULT 0 | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 3.7 facility_layouts
배치도 메타(이미지, 스케일 등).
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| facility_id | UUID FK facilities NOT NULL | |
| floor_id | UUID FK facility_floors | NULL |
| section_id | UUID FK facility_sections | NULL |
| name | VARCHAR(100) | |
| image_url | VARCHAR(500) | 배치도 이미지 |
| width_px | INT | |
| height_px | INT | |
| scale_to_meter | DECIMAL(10,4) | 픽셀-미터 비율 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 3.8 memorial_units
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| facility_id | UUID FK facilities NOT NULL | |
| operator_id | UUID FK operators NOT NULL | |
| building_id | UUID FK facility_buildings | NULL |
| floor_id | UUID FK facility_floors | NULL |
| section_id | UUID FK facility_sections | NULL |
| layout_id | UUID FK facility_layouts | NULL |
| row_code | VARCHAR(10) | A, B, C |
| col_no | INT | |
| unit_code | VARCHAR(32) NOT NULL | 예: A-12 |
| x | DECIMAL(10,4) | 배치 좌표 |
| y | DECIMAL(10,4) | |
| width | DECIMAL(10,4) | |
| height | DECIMAL(10,4) | |
| rotation | DECIMAL(5,2) DEFAULT 0 | |
| status | VARCHAR(32) NOT NULL | AVAILABLE, WAITING_QUEUE, ACTIVE_OFFER, CONTRACTED, RESALE_LISTED, BLOCKED |
| base_price | DECIMAL(15,0) | 일반 분양가 |
| pre_sale_price | DECIMAL(15,0) | 선분양가 (NULL 가능) |
| contract_years | INT DEFAULT 30 | |
| resale_allowed | BOOLEAN DEFAULT true | |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**UNIQUE**: (facility_id, unit_code). **인덱스**: operator_id, facility_id, status, (floor_id, section_id).

---

## 4. 대기열

### 4.1 queue_entries
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| unit_id | UUID FK memorial_units NOT NULL | |
| facility_id | UUID FK facilities NOT NULL | |
| operator_id | UUID FK operators NOT NULL | |
| user_id | UUID FK users NOT NULL | |
| partner_id | UUID FK partner_profiles | NULL, 영업 귀속 |
| queue_position | INT NOT NULL | 동일 unit 내 순번 |
| status | VARCHAR(32) NOT NULL | WAITING, ACTIVE, EXPIRED, COMPLETED, CANCELLED |
| activated_at | TIMESTAMPTZ | ACTIVE 된 시각 |
| expires_at | TIMESTAMPTZ | ACTIVE 만료 시각 |
| notified_7d_at | TIMESTAMPTZ | 7일 전 알림 발송 |
| notified_1d_at | TIMESTAMPTZ | 1일 전 알림 |
| notified_active_at | TIMESTAMPTZ | ACTIVE 즉시 알림 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**제약**: 동일 (unit_id, user_id)로 WAITING/ACTIVE 중복 금지. 동일 unit에 ACTIVE는 1건만.
**인덱스**: (unit_id, queue_position), (user_id, status), (operator_id, status), expires_at(worker용).

---

## 5. 계약·문서·결제

### 5.1 contracts
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| contract_no | VARCHAR(32) UNIQUE NOT NULL | 계약번호 규칙 |
| operator_id | UUID FK operators NOT NULL | |
| facility_id | UUID FK facilities NOT NULL | |
| unit_id | UUID FK memorial_units NOT NULL | |
| buyer_user_id | UUID FK users NOT NULL | |
| seller_user_id | UUID FK users | 재판매 시 매도자 |
| contract_type | VARCHAR(32) NOT NULL | NEW, RESALE |
| base_price | DECIMAL(15,0) | |
| discount_amount | DECIMAL(15,0) DEFAULT 0 | |
| final_price | DECIMAL(15,0) NOT NULL | |
| partner_id | UUID FK partner_profiles | 영업 귀속 |
| commission_amount | DECIMAL(15,0) DEFAULT 0 | |
| start_date | DATE | |
| end_date | DATE | |
| contract_years | INT | |
| status | VARCHAR(32) NOT NULL | PENDING, ACTIVE, TRANSFERRED, CANCELLED, EXPIRED |
| signed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**인덱스**: contract_no, operator_id, buyer_user_id, unit_id, status.

### 5.2 contract_documents
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| contract_id | UUID FK contracts NOT NULL | |
| document_type | VARCHAR(64) | contract, attachment 등 |
| file_url | VARCHAR(500) | |
| signature_url | VARCHAR(500) | |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 5.3 payment_records
PG 연동 전 상태 관리.
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| contract_id | UUID FK contracts | NULL 가능 |
| amount | DECIMAL(15,0) NOT NULL | |
| payment_method | VARCHAR(32) | card, transfer, mock 등 |
| pg_provider | VARCHAR(32) | 추후 PG사 |
| pg_tid | VARCHAR(100) | PG 거래 ID |
| status | VARCHAR(32) NOT NULL | READY, PENDING, PAID, FAILED, CANCELLED, REFUNDED |
| requested_at | TIMESTAMPTZ | |
| paid_at | TIMESTAMPTZ | |
| raw_payload | JSONB | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**인덱스**: contract_id, status.

---

## 6. 재판매

### 6.1 resale_listings
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| operator_id | UUID FK operators NOT NULL | |
| facility_id | UUID FK facilities NOT NULL | |
| unit_id | UUID FK memorial_units NOT NULL | |
| source_contract_id | UUID FK contracts NOT NULL | 매도자 계약 |
| seller_user_id | UUID FK users NOT NULL | |
| asking_price | DECIMAL(15,0) NOT NULL | |
| status | VARCHAR(32) NOT NULL | REQUESTED, APPROVED, LISTED, UNDER_CONTRACT, SOLD, REJECTED, CANCELLED |
| approved_by | UUID FK users | |
| approved_at | TIMESTAMPTZ | |
| rejection_reason | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**인덱스**: operator_id, unit_id, status, seller_user_id.

---

## 7. 영업(추천)

### 7.1 partner_profiles
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| user_id | UUID FK users NOT NULL | |
| operator_id | UUID FK operators | NULL(플랫폼 전체) 가능 |
| role_type | VARCHAR(32) | FUNERAL_DIRECTOR, SALES_AGENT |
| referral_code | VARCHAR(32) UNIQUE | |
| referral_link_token | VARCHAR(64) UNIQUE | |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**인덱스**: user_id, operator_id, referral_code, referral_link_token.

---

## 8. 알림

### 8.1 notifications
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| user_id | UUID FK users NOT NULL | |
| type | VARCHAR(64) | queue_7d, queue_1d, active_now, contract_done, resale_approved 등 |
| title | VARCHAR(200) | |
| body | TEXT | |
| channel | VARCHAR(32) | PUSH, SMS, EMAIL, IN_APP |
| status | VARCHAR(32) | PENDING, SENT, READ, FAILED |
| sent_at | TIMESTAMPTZ | |
| read_at | TIMESTAMPTZ | |
| metadata | JSONB | queue_entry_id, contract_id 등 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**인덱스**: user_id, status, created_at, (type, channel).

---

## 9. ER 관계 요약

- **users** ← auth_identities, user_agreements, operator_admins, partner_profiles, queue_entries, contracts(구매/판매), resale_listings, notifications.
- **operators** → operator_admins, facilities, memorial_units, queue_entries, contracts, resale_listings, partner_profiles(소속).
- **facilities** → facility_buildings, facility_floors, facility_sections, facility_layouts, memorial_units, queue_entries, contracts, resale_listings.
- **memorial_units** → queue_entries, contracts, resale_listings. (unit 상태와 queue 상태 분리 유지)
- **contracts** → contract_documents, payment_records. resale_listings.source_contract_id → contracts.
- **queue_entries** → notifications(metadata 또는 별도 연계).

---

## 10. 주의사항 정리

- **queue_position**: 동일 unit 내에서만 유니크. 순번 부여/승격 시 트랜잭션으로 일관성 유지.
- **contract_no**: 규칙 정의 필요 (예: OP코드+연도+일련번호).
- **동일 unit ACTIVE 1건**: 애플리케이션 레벨 + DB 체크(부분 유니크 또는 트리거) 권장.
- **휴대폰/이메일 유니크**: 비즈니스 정책에 따라 UNIQUE 여부 결정.
- **Soft delete**: operators, facilities, users 등에 필요 시 deleted_at 추가.

---

*문서 버전: 1.0 | 프로젝트: 납골당 분양/예약/재판매 플랫폼*
