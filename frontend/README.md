# ASG 출퇴근 시스템 - 프론트엔드

Next.js 기반의 출퇴근 기록 시스템 프론트엔드입니다.

## 🚀 빠른 시작

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# 카카오 설정 (필수)
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_rest_api_key
NEXT_PUBLIC_KAKAO_JS_KEY=your_kakao_javascript_key

# Apps Script (필수)
NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/.../exec

# NextAuth (필수)
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000

# 카카오 OAuth (필수)
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
```

자세한 설정 방법은 루트 디렉토리의 [KAKAO_SETUP.md](../KAKAO_SETUP.md)를 참고하세요.

### 2. 패키지 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
frontend/
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth API 라우트
│   ├── login/                    # 로그인 페이지
│   ├── scan/                     # 출퇴근 스캔 페이지
│   ├── page.tsx                  # 메인 페이지 (QR 코드 표시)
│   └── layout.tsx                # 레이아웃
├── components/
│   └── SessionProvider.tsx       # NextAuth 세션 프로바이더
├── types/
│   └── next-auth.d.ts           # NextAuth 타입 정의
└── .env.local                    # 환경 변수 (git 제외)
```

## 🔑 기능

### 1. 카카오 로그인
- `/login` 페이지에서 카카오 계정으로 로그인
- NextAuth를 사용한 안전한 인증

### 2. QR 코드 생성
- 메인 페이지(`/`)에서 QR 코드 자동 생성
- QR 코드는 `/scan` 페이지로 연결

### 3. 출퇴근 스캔
- `/scan` 페이지에서 자동으로 위치 수집 및 API 호출
- 15:00 이전: 출근 기록
- 15:00 이후: 퇴근 기록
- 실시간 결과 표시

## 🔧 환경 변수 상세 설명

| 변수명 | 설명 | 필수 | 예시 |
|--------|------|------|------|
| `NEXT_PUBLIC_KAKAO_CLIENT_ID` | 카카오 REST API 키 | ✅ | `abc123...` |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | 카카오 JavaScript 키 | ⚠️ | `def456...` |
| `NEXT_PUBLIC_API_URL` | Apps Script 웹 앱 URL | ✅ | `https://script.google.com/...` |
| `NEXTAUTH_SECRET` | NextAuth 암호화 시크릿 | ✅ | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | NextAuth 콜백 URL | ✅ | `http://localhost:3000` |
| `KAKAO_CLIENT_ID` | 카카오 REST API 키 (OAuth용) | ✅ | `abc123...` |
| `KAKAO_CLIENT_SECRET` | 카카오 Client Secret | ✅ | 카카오 설정에서 확인 |

## 🚀 Vercel 배포

### 1. GitHub에 푸시

```bash
git add frontend/
git commit -m "프론트엔드 구현 완료"
git push
```

### 2. Vercel에 배포

1. [Vercel](https://vercel.com) 접속 및 로그인
2. **New Project** 클릭
3. GitHub 저장소 연결
4. **Root Directory** 설정: `frontend`
5. **Environment Variables** 추가:
   - 위의 환경 변수 표를 참고하여 모든 변수 입력
   - `NEXTAUTH_URL`은 Vercel 도메인으로 변경 (예: `https://your-app.vercel.app`)
6. **Deploy** 클릭

### 3. 카카오 Redirect URI 업데이트

배포 후 카카오 디벨로퍼스에서 Redirect URI 추가:
```
https://your-app.vercel.app/api/auth/callback/kakao
```

## 📱 사용 흐름

1. **관리자**: 메인 페이지에서 QR 코드 생성
2. **직원**: 모바일 카메라로 QR 코드 스캔
3. **자동**: 카카오 로그인 화면으로 이동
4. **로그인**: 카카오 계정으로 로그인
5. **자동**: `/scan` 페이지로 리다이렉트
6. **자동**: 위치 수집 및 출퇴근 API 호출
7. **완료**: 출근/퇴근 결과 표시

## 🐛 트러블슈팅

### "redirect_uri mismatch" 오류
→ 카카오 디벨로퍼스에서 Redirect URI 확인

### 위치 정보 접근 거부
→ 브라우저 설정에서 위치 권한 허용

### API 호출 실패
→ `NEXT_PUBLIC_API_URL` 환경 변수 확인
→ Apps Script 웹 앱 배포 상태 확인

## 📚 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **HTTP Client**: Axios
- **QR Code**: qrcode.react
