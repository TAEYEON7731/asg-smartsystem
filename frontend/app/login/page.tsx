"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Login() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-yellow-50 to-white p-4">
      <main className="w-full max-w-md space-y-8 text-center">
        {/* 로고 및 타이틀 */}
        <div>
          <h1 className="text-5xl font-bold text-gray-900">
            ASG
          </h1>
          <p className="mt-4 text-2xl font-semibold text-gray-700">
            출퇴근 시스템
          </p>
          <p className="mt-2 text-gray-600">
            카카오톡으로 간편하게 로그인하세요
          </p>
        </div>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={() => signIn("kakao", { callbackUrl: "/" })}
          className="w-full rounded-lg bg-[#FEE500] px-6 py-4 text-lg font-semibold text-[#000000] transition hover:bg-[#FDD835] flex items-center justify-center gap-3"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 3C6.477 3 2 6.356 2 10.5c0 2.617 1.674 4.906 4.197 6.303l-1.086 3.976a.5.5 0 00.725.568l4.637-3.077c.502.072 1.016.109 1.527.109 5.523 0 10-3.356 10-7.5S17.523 3 12 3z" />
          </svg>
          카카오 로그인
        </button>

        {/* 안내 문구 */}
        <div className="space-y-2 text-sm text-gray-500">
          <p>✨ QR 코드로 간편한 출퇴근 기록</p>
          <p>📱 모바일에서도 사용 가능</p>
          <p>🔒 안전한 카카오 인증</p>
        </div>
      </main>
    </div>
  )
}
