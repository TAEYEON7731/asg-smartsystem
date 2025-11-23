/**
 * 한국 시간(KST) 기준의 Date 객체를 반환하거나 포맷팅된 문자열을 반환하는 유틸리티
 */
var Utils = {
  /**
   * 현재 한국 시간을 반환합니다.
   * @return {Date} 한국 시간 기준의 Date 객체
   */
  getKoreaTime: function() {
    // Apps Script의 기본 타임존이 appsscript.json에서 Asia/Seoul로 설정되어 있다고 가정
    return new Date();
  },

  /**
   * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환합니다.
   * @param {Date} date 
   * @return {string} YYYY-MM-DD
   */
  formatDateKey: function(date) {
    return Utilities.formatDate(date, "Asia/Seoul", "yyyy-MM-dd");
  },

  /**
   * Date 객체를 HH:mm 형식의 문자열로 변환합니다.
   * @param {Date} date 
   * @return {string} HH:mm
   */
  formatTime: function(date) {
    return Utilities.formatDate(date, "Asia/Seoul", "HH:mm");
  },

  /**
   * 성공 응답을 생성합니다.
   * @param {Object} data 
   * @return {TextOutput} JSON 응답
   */
  createSuccessResponse: function(data) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  },

  /**
   * 에러 응답을 생성합니다.
   * @param {string} message 
   * @param {number} code 
   * @return {TextOutput} JSON 응답
   */
  createErrorResponse: function(message, code) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      error: {
        message: message,
        code: code || 500
      }
    })).setMimeType(ContentService.MimeType.JSON);
  }
};
