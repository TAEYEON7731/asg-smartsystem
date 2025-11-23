"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // QR 코드 URL - /scan 페이지로 연결
  const qrUrl = typeof window !== "undefined"
    ? `${window.location.origin}/scan`
    : "https://your-domain.vercel.app/scan"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <main className="w-full max-w-md space-y-8 text-center">
        {/* 헤더 */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            ASG 출퇴근 시스템
          </h1>
          <p className="mt-2 text-gray-600">
            QR 코드를 스캔하여 출퇴근을 기록하세요
          </p>
        </div>

        {/* QR 코드 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <QRCodeSVG
              value={qrUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-sm text-gray-500">
            카메라로 QR 코드를 스캔하세요
          </p>
        </div>

        {/* 사용자 정보 */}
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-gray-600">로그인:</p>
          <p className="text-lg font-semibold text-gray-900">
            {session.user.nickname || session.user.name}
          </p>
        </div>

        {/* 안내 사항 */}
        <div className="space-y-2 text-left text-sm text-gray-600">
          <p>📱 <strong>출근:</strong> 오후 3시 이전 스캔</p>
          <p>🏠 <strong>퇴근:</strong> 오후 3시 이후 스캔</p>
          <p>📍 <strong>위치:</strong> 위치 권한 허용 필요</p>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={() => router.push("/api/auth/signout")}
          className="w-full rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300"
        >
          로그아웃
        </button>
      </main>
    </div>
  )
}
