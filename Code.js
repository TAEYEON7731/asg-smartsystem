/**
 * 웹 앱 진입점 (POST 요청 처리)
 */
function doPost(e) {
    try {
        if (!e || !e.postData || !e.postData.contents) {
            return Utils.createErrorResponse("Invalid request body", 400);
        }

        var requestBody = JSON.parse(e.postData.contents);
        var action = requestBody.action;

        if (action === 'scan') {
            return handleScan(requestBody);
        } else {
            return Utils.createErrorResponse("Unknown action: " + action, 400);
        }

    } catch (error) {
        return Utils.createErrorResponse(error.toString(), 500);
    }
}

/**
 * QR 스캔 요청 처리 (핵심 비즈니스 로직)
 */
function handleScan(request) {
    // 1. 토큰 검증
    var user;
    try {
        user = AuthService.verifyKakaoToken(request.id_token);
    } catch (e) {
        return Utils.createErrorResponse("Unauthorized: " + e.message, 401);
    }

    var employeeId = user.sub;
    var employeeName = user.nickname;

    // 2. 시간 계산
    var nowKr = Utils.getKoreaTime();
    var dateKey = Utils.formatDateKey(nowKr);
    var currentHour = nowKr.getHours();
    var currentMinute = nowKr.getMinutes();

    // 15:00 기준 (15시 00분 00초부터 퇴근으로 간주)
    // 14:59:59 까지는 출근
    var isCheckInTime = (currentHour < 15);

    // 3. 기존 기록 조회
    var existingRow = SheetService.findRow(dateKey, employeeId);

    var eventLog = {
        ts_client: request.ts_client,
        ts_server: nowKr.toISOString(),
        lat: request.lat,
        lng: request.lng,
        ua: request.ua,
        action_type: isCheckInTime ? "CHECK_IN" : "CHECK_OUT"
    };

    var resultMessage = "";
    var resultType = "";

    if (isCheckInTime) {
        // [출근 시간대]
        if (!existingRow) {
            // 신규 출근
            SheetService.createRow({
                date: dateKey,
                employee_id: employeeId,
                employee_name: employeeName,
                first_check_in_at: nowKr,
                check_in_lat: request.lat,
                check_in_lng: request.lng,
                raw_events: [eventLog],
                device_agent: request.ua
            });
            resultMessage = "출근 처리되었습니다.";
            resultType = "CHECK_IN_SUCCESS";
        } else {
            // 이미 행이 존재함
            var rowData = existingRow.data;
            var firstCheckIn = rowData[3]; // first_check_in_at

            if (!firstCheckIn) {
                // 행은 있는데 출근 기록이 없는 경우 (드문 케이스, 예: 퇴근만 먼저 찍힌 경우?)
                SheetService.updateRow(existingRow.rowIndex, {
                    first_check_in_at: nowKr,
                    check_in_lat: request.lat,
                    check_in_lng: request.lng,
                    new_event: eventLog
                }, rowData);
                resultMessage = "출근 처리되었습니다.";
                resultType = "CHECK_IN_SUCCESS";
            } else {
                // 이미 출근 기록 있음 -> 중복 무시
                // 로그만 남길지, 아예 무시할지 결정. PRD에는 "ignore"라고 되어 있음.
                // 하지만 사용자가 스캔했으므로 "이미 출근 처리됨"을 알려주는게 좋음.
                resultMessage = "이미 출근 처리되었습니다.";
                resultType = "CHECK_IN_DUPLICATED";

                // (선택) 중복 시도도 로그에 남기고 싶다면 updateRow 호출하되 시간은 갱신 X
                SheetService.updateRow(existingRow.rowIndex, {
                    new_event: eventLog
                }, rowData);
            }
        }
    } else {
        // [퇴근 시간대]
        if (!existingRow) {
            // 출근 없이 퇴근만 찍는 경우 (지각, 혹은 데이터 누락) -> 새 행 생성
            SheetService.createRow({
                date: dateKey,
                employee_id: employeeId,
                employee_name: employeeName,
                last_check_out_at: nowKr, // 퇴근 시간만 기록
                check_out_lat: request.lat,
                check_out_lng: request.lng,
                raw_events: [eventLog],
                device_agent: request.ua
            });
            resultMessage = "퇴근 처리되었습니다. (출근 기록 없음)";
            resultType = "CHECK_OUT_SUCCESS_NO_IN";
        } else {
            // 기존 행 존재 -> 퇴근 시간 갱신 (덮어쓰기)
            SheetService.updateRow(existingRow.rowIndex, {
                last_check_out_at: nowKr,
                check_out_lat: request.lat,
                check_out_lng: request.lng,
                new_event: eventLog
            }, existingRow.data);
            resultMessage = "퇴근 처리되었습니다.";
            resultType = "CHECK_OUT_SUCCESS";
        }
    }

    return Utils.createSuccessResponse({
        message: resultMessage,
        type: resultType,
        timestamp: nowKr.toISOString()
    });
}

/**
 * GET 요청 처리 (테스트용)
 */
function doGet(e) {
    return ContentService.createTextOutput("Smart System Backend is Running.");
}
