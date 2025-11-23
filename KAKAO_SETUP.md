# 카카오 디벨로퍼스 설정 가이드

## 1. 애플리케이션 생성

1. **카카오 디벨로퍼스 접속**: https://developers.kakao.com/
2. **내 애플리케이션** 메뉴 클릭
3. **애플리케이션 추가하기** 클릭
4. 앱 정보 입력:
   - **앱 이름**: ASG 출퇴근 시스템
   - **사업자명**: (선택사항)

## 2. 앱 키 확인

1. 생성한 애플리케이션 선택
2. **[앱 설정] > [앱 키]** 메뉴로 이동
3. 다음 키를 복사하여 `.env` 파일에 저장:
   - **REST API 키** → `NEXT_PUBLIC_KAKAO_CLIENT_ID`
   - **JavaScript 키** → `NEXT_PUBLIC_KAKAO_JS_KEY`

```bash
# .env 파일에 추가
NEXT_PUBLIC_KAKAO_CLIENT_ID=복사한_REST_API_키
NEXT_PUBLIC_KAKAO_JS_KEY=복사한_JavaScript_키
```

## 3. 플랫폼 설정

### Web 플랫폼 등록
1. **[앱 설정] > [플랫폼]** 메뉴로 이동
2. **Web 플랫폼 등록** 클릭
3. 사이트 도메인 입력:
   - 개발: `http://localhost:3000`
   - 프로덕션: `https://your-domain.vercel.app`

## 4. 카카오 로그인 설정 (중요!)

### 4-1. 카카오 로그인 활성화
1. **[제품 설정] > [카카오 로그인]** 메뉴로 이동
2. **활성화 설정** → **ON** (활성화)

### 4-2. Redirect URI 등록
1. **Redirect URI** 섹션에서 **등록** 클릭
2. 다음 URI들을 등록:
   ```
   http://localhost:3000/api/auth/callback/kakao
   https://your-domain.vercel.app/api/auth/callback/kakao
   ```
   > ⚠️ **중요**: Vercel 배포 후 실제 도메인으로 변경 필요

### 4-3. 동의 항목 설정
1. **[제품 설정] > [카카오 로그인] > [동의 항목]** 메뉴로 이동
2. 다음 항목 설정:
   - **닉네임**: 필수 동의 (직원명 표시용)
   - **카카오계정(이메일)**: 선택 동의 (선택사항)
   - **프로필 사진**: 선택 동의 (선택사항)

## 5. OpenID Connect 설정 (ID 토큰 사용)

1. **[제품 설정] > [카카오 로그인] > [OpenID Connect]** 메뉴로 이동
2. **활성화 설정** → **ON** (활성화)
3. **ID 토큰** 사용 가능 확인

## 6. 환경 변수 최종 확인

`.env` 파일이 다음과 같이 설정되어 있는지 확인:

```bash
# 카카오 설정
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_rest_api_key
NEXT_PUBLIC_KAKAO_JS_KEY=your_javascript_key

# Apps Script
NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/.../exec

# NextAuth
NEXTAUTH_SECRET=generated_secret_string
NEXTAUTH_URL=http://localhost:3000  # 또는 https://your-domain.vercel.app
```

## 7. NextAuth Secret 생성

PowerShell에서 실행:
```powershell
# 랜덤 문자열 생성
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

또는 온라인 도구 사용: https://generate-secret.vercel.app/32

## 8. 테스트

1. 로컬 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 브라우저에서 `http://localhost:3000` 접속

3. **카카오 로그인** 버튼 클릭

4. 카카오 계정으로 로그인

5. 동의 항목 확인 후 동의

6. 위치 권한 허용

7. 출퇴근 스캔 완료!

## 트러블슈팅

### "redirect_uri mismatch" 오류
→ 카카오 디벨로퍼스에서 Redirect URI를 정확히 등록했는지 확인

### "invalid client" 오류
→ REST API 키가 올바르게 입력되었는지 확인

### "OpenID Connect is not enabled" 오류
→ 카카오 로그인 > OpenID Connect 활성화 확인
