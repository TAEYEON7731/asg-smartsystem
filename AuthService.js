var AuthService = {
    /**
     * 카카오 ID 토큰을 검증하고 사용자 정보를 반환합니다.
     * 현재는 Mock 구현으로, 실제 검증 로직은 카카오 API 연동이 필요합니다.
     * @param {string} token 카카오 ID 토큰
     * @return {Object} 사용자 정보 (id, nickname 등)
     */
    verifyKakaoToken: function (token) {
        // TODO: 실제 카카오 OIDC 공개키 목록 조회 및 서명 검증 로직 구현 필요
        // 임시로 토큰이 존재하면 유효한 것으로 간주하고 더미 데이터 반환

        if (!token) {
            throw new Error("Token is missing");
        }

        // 개발/테스트 편의를 위해 특정 프리픽스가 있으면 테스트 계정으로 처리
        if (token.startsWith("TEST_TOKEN_")) {
            var userId = token.replace("TEST_TOKEN_", "");
            return {
                sub: userId, // 카카오 회원번호 (String)
                nickname: "Test User " + userId
            };
        }

        // 실제 구현 시에는 UrlFetchApp을 사용하여 카카오 API 호출 가능
        // var response = UrlFetchApp.fetch("https://kapi.kakao.com/v1/user/access_token_info", {
        //   headers: { Authorization: "Bearer " + token }
        // });

        // 여기서는 단순히 토큰 자체를 ID로 가정 (위험하지만 초기 구조용)
        // 실제로는 JWT 디코딩 및 검증 필수
        return {
            sub: "KAKAO_USER_" + token.substring(0, 10),
            nickname: "Kakao User"
        };
    }
};
