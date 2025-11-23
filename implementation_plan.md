# 구현 계획 - 출퇴근 기록 시스템 (GAS 백엔드)

출퇴근 기록 시스템의 핵심 백엔드 로직을 Google Apps Script로 구현합니다. `prd.md`에 정의된 비즈니스 로직(15시 기준 출/퇴근 판단, 중복 방지, 시트 저장 등)을 충실히 이행합니다.

## 사용자 리뷰 필요 사항
> [!IMPORTANT]
> **카카오 OAuth 설정**: 카카오 로그인 검증을 위해서는 카카오 앱 키 설정이 필요합니다. 현재는 구조만 잡고 실제 검증 로직은 추후 연동하거나 Mock으로 처리할 예정입니다.
> **스프레드시트 ID**: `prd.md`에 명시된 ID(`1rh8T_CDJOj9_ldxzcOSzCRXIln5MfLPRc0TkCbXeHTI`)를 사용합니다. 권한 문제가 없는지 확인이 필요합니다.

## 제안된 변경 사항

### Google Apps Script (백엔드)

#### [NEW] [Code.js](file:///c:/Users/user/Desktop/git/asg-smartsystem/Code.js)
- `doPost(e)`: 웹 앱 진입점. 요청 파싱 및 라우팅.
- `handleScan(request)`: 핵심 비즈니스 로직.
    - 15:00 기준 출/퇴근 판단.
    - 중복 스캔 및 덮어쓰기 로직.
    - 자정 경계 처리.

#### [NEW] [SheetService.js](file:///c:/Users/user/Desktop/git/asg-smartsystem/SheetService.js)
- 스프레드시트 연결 및 조작 담당.
- `findRow(date, employeeId)`: 기존 기록 검색.
- `createRow(...)`: 새로운 행 생성.
- `updateRow(...)`: 기존 행 업데이트.
- `appendRawEvent(...)`: 로그 기록.

#### [NEW] [AuthService.js](file:///c:/Users/user/Desktop/git/asg-smartsystem/AuthService.js)
- 카카오 ID 토큰 검증 로직.
- (초기에는 테스트를 위해 간단한 검증 또는 바이패스 로직 포함 가능)

#### [NEW] [Utils.js](file:///c:/Users/user/Desktop/git/asg-smartsystem/Utils.js)
- `getKoreaTime()`: 한국 시간 구하기.
- 날짜 포맷팅 등 유틸리티 함수.

#### [MODIFY] [appsscript.json](file:///c:/Users/user/Desktop/git/asg-smartsystem/appsscript.json)
- 타임존 설정 (`Asia/Seoul`)
- 필요한 스코프 추가 (Spreadsheet 접근 권한 등)

## 검증 계획

### 자동화 테스트
- GAS 환경 특성상 로컬 단위 테스트는 제한적입니다.
- 주요 로직(시간 판단 등)은 순수 JS 함수로 분리하여 로컬에서 테스트 가능하도록 구성합니다.

### 수동 검증
1. `clasp push`로 코드 배포.
2. 웹 앱으로 배포 (Deploy as Web App).
3. `curl` 명령어를 사용하여 다양한 시나리오 테스트:
    - 14:59 출근 요청 -> 성공 확인
    - 15:01 퇴근 요청 -> 성공 확인
    - 중복 요청 -> 무시/갱신 확인
    - 자정 이후 요청 -> 새 행 생성 확인
4. 구글 시트에 데이터가 올바르게 쌓이는지 확인.
