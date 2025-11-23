📘 PRD — 출퇴근 기록 시스템 (Google Sheet + Apps Script 기반)
1. 🟦 배경 & 목표
1.1 배경

ASG 내부 직원(행정팀 & TM팀) 출퇴근 기록이 수작업 또는 여러 채널로 분산되어 관리 효율이 낮음.
신뢰도 높은 출퇴근 데이터 축적 + 자동화된 통합 관리 시스템이 필요.

1.2 목표

QR 스캔만으로 “출근/퇴근”을 자동 판단

Google Sheet에 자동 기록 (Apps Script Webhook 방식)

중복 방지, 덮어쓰기, 위치 기록 등 실사용에 필요한 규칙 구현

관리자가 Excel 시트만으로 집계 편하게 가능하도록 구조 통일

1.3 성공지표
구분	정의	목표
기록 완결률	출근+퇴근 모두 기록된 비율	95% 이상
기록 누락률	기록 실패 건	1% 이하
위치 포함률	위치 정보가 정상 기록된 비율	90% 이상
오류율	API 실패, 토큰 오류 등	2% 이하
1.4 비범위(Non-Goals)

급여계산 기능(이번 스코프 제외)

GPS 지오펜스 강제 정책(추후 옵션)

하이엔드 프론트엔드 제공(X)

2. 🟦 핵심 사용자 시나리오
A) 직원이 14:59에 스캔

카카오 로그인 → now=14:59

15:00 이전 → 출근으로 판단

해당 날짜·employee_id 행이 없으면 생성 & first_check_in_at 기록

이후 반복 스캔은 무시(출근 중복 차단)

B) 직원이 15:01에 스캔

now=15:01

퇴근 기록(last_check_out_at 갱신)

행 없으면 새 행 생성 후 퇴근 시간만 기록(특수 케이스)

C) 직원이 09:00 / 09:05 두 번 스캔 (중복 차단)

첫 스캔: 출근 저장

두 번째 스캔: 이미 출근 기록 존재 → 무시

D) 직원이 18:00 / 18:10 두 번 스캔 (덮어쓰기)

첫 스캔: 퇴근 기록 초기 저장

두 번째 스캔: 마지막 값으로 덮어쓰기

E) 자정 이후(00:10) 스캔

now date_key 변경됨

이전 날짜와 무관하게 새로운 행 생성

출근 or 퇴근 규칙은 시간 기준 동일하게 적용

3. 🟦 기능 요구사항 (Functional)
3.1 QR → 로그인 → 기록 저장 플로우

직원이 QR 스캔

QR landing → 카카오 OAuth 인증

인증 후 위치 권한 요청

위치 lat/lng 수집

Web App POST /scan 호출

Apps Script 내부에서 비즈니스 규칙 적용

Google Sheet에 Upsert

사용자에게 “오늘 출근/퇴근” 상태 반환

3.2 15:00 커트오프 로직

서버(now_kr) 기준 15:00 이전: 출근

이후: 퇴근

클라이언트 시간(ts_client)은 참고만 하고 신뢰하지 않음

3.3 중복 방지/덮어쓰기 알고리즘 (의사코드)
now_kr = getServerTimeAsiaSeoul()
date_key = format(now_kr, 'YYYY-MM-DD')

row = findRow(date_key, employee_id)

if now_kr.time < 15:00:
    if row does not exist:
        create row with first_check_in_at = now_kr
        store lat/lng
    else:
        if row.first_check_in_at exists:
            ignore (중복 출근 금지)
        else:
            set first_check_in_at = now_kr
            store lat/lng
else:
    if row does not exist:
        create row with last_check_out_at = now_kr
        store lat/lng
    else:
        row.last_check_out_at = now_kr (덮어쓰기)
        store lat/lng

3.4 자정 경계 처리

date_key는 완전히 독립

23:59 → 00:01 스캔 시 날짜가 다르므로 기존 row와 무관

반드시 "새 행" 생성

3.5 위치 취득 실패 시 처리

정책 = 위치 미기록 허용 + 관리자 노트 처리

상황	처리
권한 거부	위치 null 저장
타임아웃	위치 null 저장
IP 기반 추정	기본 미사용
3.6 스프레드시트 CRUD 규칙

(date, employee_id) 복합키

없으면 Insert

있으면 Update

raw_events는 append 방식(JSON 문자열)

4. 🟦 비기능 요구사항 (Non-Functional)
보안

OAuth 카카오 id_token 검증

Web App URL 서명 or 제한(URL guess 방지)

최소 데이터 수집(이름 optional)

성능

API 응답 ≤ 500ms 목표

Sheet Update 최대 1초 이내

가용성

Apps Script Execution Timeout 고려(최대 30초)

로깅 & 감사

raw_events 필수

error_log 별도 시트 권장

확장성

조직 추가 시 employee_id prefix 사용

지점별 QR 도입 가능

5. 🟦 데이터 모델 (스프레드시트 스키마)
컬럼	타입	설명
date	string	YYYY-MM-DD
employee_id	string	카카오 user_id
employee_name	string	optional
first_check_in_at	datetime	최초 출근
last_check_out_at	datetime	최종 퇴근
check_in_lat	number	출근 위도
check_in_lng	number	출근 경도
check_out_lat	number	퇴근 위도
check_out_lng	number	퇴근 경도
raw_events	string(JSON)	모든 시도 로그
created_at	datetime	최초 생성
updated_at	datetime	갱신
device_agent	string	UA 정보

Primary Key = date + employee_id

6. 🟦 아키텍처 & 컴포넌트
백엔드 — Apps Script Web App
POST /scan

토큰 검증

employee_id 추출

now_kr 계산

Upsert

현재 상태 반환

프론트 (옵션) — Next.js (Vercel)

QR 랜딩 화면

로그인 & 위치 권한 안내

“오늘 기록 보기” 뷰(옵션)

7. 🟦 시스템 시퀀스

QR 스캔

Next.js Landing

카카오 OAuth

위치 권한 획득

POST /scan

시트 업데이트

상태 반영 리턴

사용자 화면 표시

8. 🟦 비즈니스 로직 의사코드 (전체)
function handleScan(request):
    token = request.id_token
    employee_id = verifyKakaoToken(token)
    now_kr = getKoreaTime()
    date_key = formatDate(now_kr)

    row = findRow(date_key, employee_id)

    event = {
      ts_client: request.ts_client,
      ts_server: now_kr,
      lat: request.lat,
      lng: request.lng,
      ua: request.ua
    }

    if now_kr < 15:00:
        if row is null:
            createRow(...)
            row.first_check_in_at = now_kr
        else if row.first_check_in_at is null:
            row.first_check_in_at = now_kr
        else:
            ignore
    else:
        if row is null:
            createRow(...)
        row.last_check_out_at = now_kr

    append raw_events
    update updated_at
    save row

9. 🟦 보안 / 프라이버시

카카오 OAuth만 사용자 식별에 사용

위치는 출퇴근 시점만 저장

GPS 권한 설명: “출근·퇴근 인증을 위해 한 번만 위치가 필요합니다.”

raw_events 보존기간: 1년 후 자동 정리(권장)

10. 🟦 운영 & 어드민
관리자 기능(시트 기반)

날짜로 필터

직원별 피벗 테이블

누락값(출근만 있고 퇴근 없는 경우) 하이라이팅

스크립트 메뉴: “일별 리포트 생성”(옵션)

장애 시 복구

raw_events 기반 수동 보정

실패 로그(error_log 시트) 참고

11. 🟦 테스트 케이스
테스트	입력	기대 결과
14:59 스캔	14:59	출근 기록
15:00:00	15:00	퇴근으로 분류
오전 중복	09:00/09:05	최초만 기록
오후 중복	18:00/18:10	마지막 값 갱신
위치 실패	권한 차단	위치 null
자정 경계	23:59→00:01	새로운 행 생성
토큰 오류	invalid token	401 에러
네트워크 재시도	retry=2	멱등성 유지
12. 🟦 KPI & 대시보드

출근/퇴근 완료율

위치 포함 비율

중복 방지 성공률

에러 발생 추이

직원별 근무 패턴 통계

13. 🟦 릴리즈 플랜
마일스톤	내용
M0	파일럿(행정팀 시험 운영)
M1	관리자 리포트 자동화
M2	지점/조직 확장
14. 🟦 리스크 & 대응
리스크	내용	대응
인앱 브라우저 GPS 제한	카카오 인앱 제한 가능	외부 브라우저 열기 안내
위치 정확도 편차	실내 GPS 부정확	허용 오차 정책 운영
시트 동시성	다수 요청 시 race 가능	행 index 재검증 + retry
QR 공유/대리찍기	프록시 출근 가능	위치 + raw_events로 감사
15. 🟦 오픈 이슈 (의사결정 필요)
이슈	옵션	추천
QR 전략	공용 / 개인 / 지점별	공용
지오펜스	50m / 100m / 미사용	미사용(1차)
위치 미동의	실패 처리 / 보류	미기록 허용 + 관리자 보정
✔️ 완료

원하면 바로 이어서:

🔹 Apps Script Web App 코드
🔹 시트 초기화 스크립트
🔹 Next.js QR 랜딩 페이지