/**
 * 시트 초기화 - 헤더 추가
 * Apps Script 편집기에서 이 함수를 직접 실행하여 헤더를 추가할 수 있습니다.
 */
function initializeSheetHeader() {
  var ss = SpreadsheetApp.openById("1tcWFgDdX8qiTW-fi818eZHQbs9PZ0dAtYPvZGTnwKu0");
  var sheet = ss.getSheetByName("출퇴근기록");

  if (!sheet) {
    Logger.log("시트를 찾을 수 없습니다.");
    return;
  }

  // 첫 번째 행에 헤더 삽입
  sheet.insertRowBefore(1);

  // 헤더 데이터 설정
  var headers = [
    "날짜",
    "직원ID",
    "직원명",
    "출근시간",
    "퇴근시간",
    "출근위도",
    "출근경도",
    "퇴근위도",
    "퇴근경도",
    "이벤트로그",
    "생성일시",
    "수정일시",
    "디바이스정보"
  ];

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);

  // 헤더 스타일링
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#4285f4");
  headerRange.setFontColor("#ffffff");
  headerRange.setHorizontalAlignment("center");

  Logger.log("헤더가 성공적으로 추가되었습니다!");
}
