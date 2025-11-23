# 배포 및 테스트 가이드

`clasp push`로 코드가 업로드되었으므로, 이제 Google Apps Script를 **웹 앱(Web App)**으로 배포하고 테스트할 차례입니다.

## 1. 웹 앱 배포하기

1. 터미널에서 `clasp open`을 입력하여 Apps Script 에디터를 엽니다.
2. 우측 상단의 **[배포]** -> **[새 배포]**를 클릭합니다.
3. **유형 선택** 톱니바퀴 아이콘 -> **웹 앱**을 선택합니다.
4. 설정:
   - **설명**: `v1` (또는 원하는 설명)
   - **다음 사용자로 실행**: `나(웹 앱을 액세스하는 사용자)` -> **`나(스크립트 소유자)`** 로 변경 (중요! 시트 접근 권한 때문)
   - **액세스 권한이 있는 사용자**: **`모든 사용자`** (카카오 로그인 연동 전 테스트를 위해)
5. **[배포]** 클릭.
6. **웹 앱 URL**을 복사합니다. (예: `https://script.google.com/macros/s/.../exec`)

## 2. 동작 확인 (GET 요청)

브라우저 주소창에 복사한 **웹 앱 URL**을 붙여넣고 이동합니다.
- **성공 화면**: `Smart System Backend is Running.` 문구가 보이면 정상입니다.

## 3. 기능 테스트 (POST 요청)

터미널(PowerShell)에서 아래 명령어를 사용하여 출퇴근 시나리오를 테스트합니다.
**`[WEB_APP_URL]` 부분을 위에서 복사한 실제 URL로 바꿔주세요.**

### A. 출근 테스트 (15시 이전 가정)
```powershell
$body = @{
    action = "scan"
    id_token = "TEST_TOKEN_12345"
    ts_client = "2024-01-01T09:00:00"
    lat = 37.5
    lng = 127.0
    ua = "PowerShell Client"
} | ConvertTo-Json

Invoke-RestMethod -Uri "[WEB_APP_URL]" -Method Post -Body $body -ContentType "application/json"
```

### B. 퇴근 테스트 (15시 이후 가정)
서버 시간이 15시 이후라면 자동으로 퇴근으로 처리됩니다. 15시 이전이라도 로직상 15시 이후에 실행하면 퇴근 처리됩니다.

### C. 결과 확인
구글 스프레드시트(`출퇴근기록` 시트)에 데이터가 들어왔는지 확인합니다.
- `clasp open` -> 좌측 메뉴 **[개요]** -> **[스프레드시트]** 아이콘 클릭하여 이동 가능.
