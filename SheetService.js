var SheetService = {
    SPREADSHEET_ID: "1rh8T_CDJOj9_ldxzcOSzCRXIln5MfLPRc0TkCbXeHTI", // PRD에 명시된 ID
    SHEET_NAME: "출퇴근기록",

    /**
     * 스프레드시트와 시트를 가져옵니다. 시트가 없으면 생성합니다.
     */
    getSheet: function () {
        var ss = SpreadsheetApp.openById(this.SPREADSHEET_ID);
        var sheet = ss.getSheetByName(this.SHEET_NAME);
        if (!sheet) {
            sheet = ss.insertSheet(this.SHEET_NAME);
            // 헤더 초기화
            sheet.appendRow([
                "date", "employee_id", "employee_name",
                "first_check_in_at", "last_check_out_at",
                "check_in_lat", "check_in_lng",
                "check_out_lat", "check_out_lng",
                "raw_events", "created_at", "updated_at", "device_agent"
            ]);
        }
        return sheet;
    },

    /**
     * 날짜와 직원 ID로 행을 찾습니다.
     * @param {string} dateKey YYYY-MM-DD
     * @param {string} employeeId 
     * @return {Object|null} 행 데이터 객체 또는 null
     */
    findRow: function (dateKey, employeeId) {
        var sheet = this.getSheet();
        var data = sheet.getDataRange().getValues();

        // 헤더 제외하고 검색 (1행부터 시작)
        for (var i = 1; i < data.length; i++) {
            var rowDate = data[i][0]; // date 컬럼 (문자열로 비교 필요)
            var rowEmpId = data[i][1]; // employee_id

            // 날짜 포맷 통일 (Date 객체일 수 있으므로 변환)
            var rowDateStr = rowDate instanceof Date ? Utils.formatDateKey(rowDate) : rowDate;

            if (rowDateStr === dateKey && String(rowEmpId) === String(employeeId)) {
                return {
                    rowIndex: i + 1, // 1-based index
                    data: data[i]
                };
            }
        }
        return null;
    },

    /**
     * 새로운 출퇴근 기록 행을 생성합니다.
     */
    createRow: function (rowData) {
        var sheet = this.getSheet();
        var now = new Date();

        var newRow = [
            rowData.date,
            rowData.employee_id,
            rowData.employee_name || "",
            rowData.first_check_in_at || "",
            rowData.last_check_out_at || "",
            rowData.check_in_lat || "",
            rowData.check_in_lng || "",
            rowData.check_out_lat || "",
            rowData.check_out_lng || "",
            JSON.stringify(rowData.raw_events || []),
            now, // created_at
            now, // updated_at
            rowData.device_agent || ""
        ];

        sheet.appendRow(newRow);
        return newRow;
    },

    /**
     * 기존 행을 업데이트합니다.
     * @param {number} rowIndex 1-based index
     * @param {Object} updates 업데이트할 필드들
     * @param {Array} currentData 현재 행 데이터 (raw_events 병합용)
     */
    updateRow: function (rowIndex, updates, currentData) {
        var sheet = this.getSheet();
        var now = new Date();

        // 컬럼 인덱스 매핑 (0-based)
        // 0:date, 1:id, 2:name, 3:in_at, 4:out_at, 5:in_lat, 6:in_lng, 7:out_lat, 8:out_lng, 9:events, 10:created, 11:updated, 12:agent

        if (updates.first_check_in_at) {
            sheet.getRange(rowIndex, 4).setValue(updates.first_check_in_at);
            if (updates.check_in_lat) sheet.getRange(rowIndex, 6).setValue(updates.check_in_lat);
            if (updates.check_in_lng) sheet.getRange(rowIndex, 7).setValue(updates.check_in_lng);
        }

        if (updates.last_check_out_at) {
            sheet.getRange(rowIndex, 5).setValue(updates.last_check_out_at);
            if (updates.check_out_lat) sheet.getRange(rowIndex, 8).setValue(updates.check_out_lat);
            if (updates.check_out_lng) sheet.getRange(rowIndex, 9).setValue(updates.check_out_lng);
        }

        // Raw Events 병합
        var existingEventsStr = currentData[9];
        var existingEvents = [];
        try {
            existingEvents = JSON.parse(existingEventsStr);
        } catch (e) {
            existingEvents = [];
        }

        if (updates.new_event) {
            existingEvents.push(updates.new_event);
            sheet.getRange(rowIndex, 10).setValue(JSON.stringify(existingEvents));
        }

        // Updated At
        sheet.getRange(rowIndex, 12).setValue(now);
    }
};
