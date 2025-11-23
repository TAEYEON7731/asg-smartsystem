# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

ASG 출퇴근 기록 시스템 - QR 코드 스캔과 카카오 OAuth 인증을 사용하는 Google Apps Script 기반 출퇴근 관리 시스템입니다. 15:00 기준으로 출근/퇴근을 자동 판단하여 Google Sheets에 기록합니다.

## 기술 스택

- **백엔드**: Google Apps Script (Web App)
- **데이터 저장소**: Google Sheets
- **인증**: Kakao OAuth (ID 토큰 검증)
- **배포**: clasp CLI
- **버전 관리**: Git/GitHub

## 필수 명령어

### 배포
```bash
# Google Apps Script에 코드 푸시
clasp push

# Apps Script 편집기 브라우저에서 열기
clasp open

# 배포 상태 확인
clasp deployments
```

### Git 작업 흐름
코드 변경 후에는 반드시 배포와 버전 관리를 모두 실행해야 합니다:
```bash
clasp push
git add .
git commit -m "커밋 메시지 (한국어로 작성)"
git push
```

**중요**: [RULES.md](RULES.md)에 따라 커밋 메시지는 반드시 한국어로 작성해야 합니다.

## 아키텍처

### 핵심 비즈니스 로직 흐름

1. **QR 스캔** → **카카오 OAuth** → **위치 수집** → **POST /scan** → **시트 업데이트**

2. **15:00 기준 규칙** ([Code.js](Code.js:42-47)):
   - 15:00 이전 (KST): 출근 처리
   - 15:00 이후: 퇴근 처리
   - 서버 시간(`Utils.getKoreaTime()`)이 기준이며, 클라이언트 타임스탬프는 신뢰하지 않음

3. **중복 처리 로직** ([Code.js](Code.js:64-107)):
   - **출근**: 첫 스캔만 기록, 이후 스캔은 무시 (덮어쓰기 없음)
   - **퇴근**: 매번 스캔할 때마다 `last_check_out_at` 덮어쓰기 (수정 허용)

4. **날짜 경계 처리** ([Code.js](Code.js:41)):
   - `date_key` 형식: `YYYY-MM-DD`
   - 자정을 넘어가면 자동으로 새 행 생성
   - 각 날짜+직원ID 조합은 유일함

### 파일별 역할

- **[Code.js](Code.js)**: 진입점(`doPost`, `doGet`)과 핵심 비즈니스 로직(`handleScan`)
- **[SheetService.js](SheetService.js)**: Google Sheets CRUD 작업 (행 찾기/생성/업데이트)
  - 스프레드시트 ID: `1tcWFgDdX8qiTW-fi818eZHQbs9PZ0dAtYPvZGTnwKu0`
  - 시트 이름: `출퇴근기록`
- **[AuthService.js](AuthService.js)**: 카카오 토큰 검증 (현재는 Mock 구현)
  - 테스트 토큰: 개발용으로 `TEST_TOKEN_*` 패턴 사용
- **[Utils.js](Utils.js)**: 시간 유틸리티, 응답 포맷팅, 날짜 변환

### 데이터 모델

Primary key: `(date, employee_id)`

[SheetService.js](SheetService.js:14-19) 컬럼 구조:
```
date, employee_id, employee_name,
first_check_in_at, last_check_out_at,
check_in_lat, check_in_lng, check_out_lat, check_out_lng,
raw_events (JSON), created_at, updated_at, device_agent
```

### 설정 파일

- **[appsscript.json](appsscript.json)**:
  - 타임존: `Asia/Seoul` (시간 계산에 필수)
  - OAuth 스코프: Spreadsheets, External requests
  - 웹 앱 설정: 배포 사용자로 실행, 누구나 접근 가능

- **[.clasp.json](.clasp.json)**:
  - 배포용 스크립트 ID
  - **주의**: .gitignore에 있지만 현재 추적 중 (보안 고려 필요)

- **[.env](.env)**:
  - 테스트용 웹 앱 URL 저장
  - **절대** 민감한 정보 커밋 금지 (이미 .gitignore에 포함)

## 주요 구현 세부사항

### 시간 처리
모든 시간 연산은 `Utils.getKoreaTime()`을 사용하며, 이는 `appsscript.json`의 타임존 설정에 의존합니다. 비즈니스 로직 판단에는 절대 클라이언트가 제출한 타임스탬프를 신뢰하지 마세요.

### 멱등성 (Idempotency)
시스템은 재시도를 안전하게 처리하도록 설계되었습니다:
- 출근: 중복 스캔이 최초 시간을 변경하지 않음
- 퇴근: 여러 번 스캔하면 가장 최근 시간으로 업데이트
- `raw_events`에 모든 시도를 감사용으로 기록

### 에러 응답
일관된 에러 포맷을 위해 `Utils.createErrorResponse(message, code)` 사용. 주요 코드:
- 400: 잘못된 요청
- 401: 인증 실패
- 500: 서버 에러

## 테스트 작업 흐름

1. **로컬 코드 수정** → `clasp push`
2. **새 버전 배포**: Apps Script 편집기 → 배포 → 배포 관리 → 수정 → 새 버전 만들기
3. **PowerShell로 테스트** ([walkthrough.md](walkthrough.md:27-39) 예제 참고)
4. **시트에서 확인**: 레코드가 제대로 생성/업데이트되었는지 확인

### 테스트 시나리오 ([prd.md](prd.md:298-307) 참고)
- 14:59 스캔 → 출근 처리
- 15:00:00 스캔 → 퇴근 처리
- 오전 중복 스캔 → 최초만 기록
- 오후 중복 스캔 → 마지막 값으로 갱신
- 자정 경계 → 새 행 생성
- 잘못된 토큰 → 401 에러

## 중요 참고 문서

- **[prd.md](prd.md)**: 비즈니스 규칙, 데이터 모델, 테스트 케이스를 포함한 완전한 제품 요구사항
- **[RULES.md](RULES.md)**: 프로젝트 수행 규칙 (한국어 요구사항, 배포 워크플로우)
- **[walkthrough.md](walkthrough.md)**: 배포 가이드 및 문제 해결 단계
- **[task.md](task.md)**: 현재 구현 체크리스트

## 개발 제약사항

- Google Apps Script는 30초 실행 타임아웃 제한이 있음
- npm 패키지 사용 불가 (순수 JavaScript만 가능)
- 시트 작업은 최소화해야 함 (가능한 곳에서 일괄 읽기/쓰기)
- 올바른 기준 시간 로직을 위해 타임존은 반드시 `Asia/Seoul`을 유지해야 함
