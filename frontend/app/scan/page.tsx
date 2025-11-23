"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"

type ScanResult = {
  status: "success" | "error"
  data?: {
    message: string
    type: string
    timestamp: string
  }
  error?: {
    message: string
    code: number
  }
}

export default function Scan() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    // 로그인이 완료되면 자동으로 스캔 시작
    if (session && !scanning && !result) {
      handleScan()
    }
  }, [session])

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("위치 정보를 지원하지 않는 브라우저입니다"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("위치 정보 가져오기 실패:", error)
          // 위치 정보 실패해도 null로 진행 (PRD 정책)
          resolve({ lat: 0, lng: 0 })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }

  const handleScan = async () => {
    if (!session) {
      return
    }

    setScanning(true)
    setResult(null)

    try {
      // 1. 위치 정보 가져오기
      const loc = await getLocation()
      setLocation(loc)

      // 2. API 호출
      const apiUrl = process.env.NEXT_PUBLIC_API_URL!
      const response = await axios.post<ScanResult>(
        apiUrl,
        {
          action: "scan",
          id_token: session.idToken,
          ts_client: new Date().toISOString(),
          lat: loc.lat,
          lng: loc.lng,
          ua: navigator.userAgent,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      setResult(response.data)
    } catch (error: any) {
      console.error("스캔 오류:", error)
      setResult({
        status: "error",
        error: {
          message: error.response?.data?.error?.message || error.message || "알 수 없는 오류가 발생했습니다",
          code: error.response?.data?.error?.code || 500,
        },
      })
    } finally {
      setScanning(false)
    }
  }

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <main className="w-full max-w-md space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">출퇴근 스캔</h1>
          <p className="mt-2 text-gray-600">{session.user.nickname || session.user.name}님</p>
        </div>

        {/* 스캔 중 */}
        {scanning && (
          <div className="rounded-lg bg-blue-50 p-8 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">처리 중...</p>
            <p className="mt-2 text-sm text-gray-500">위치 정보 수집 및 기록 중</p>
          </div>
        )}

        {/* 결과 표시 */}
        {result && result.status === "success" && result.data && (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-6 border-2 border-green-500">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {result.data.type.includes("CHECK_IN") ? "🌅" : "🌆"}
                </div>
                <p className="text-2xl font-bold text-green-700 mb-2">
                  {result.data.message}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(result.data.timestamp).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>

            {location && location.lat !== 0 && location.lng !== 0 && (
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <p className="font-medium text-gray-700">📍 위치 정보</p>
                <p className="text-gray-600">위도: {location.lat.toFixed(6)}</p>
                <p className="text-gray-600">경도: {location.lng.toFixed(6)}</p>
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full rounded-lg bg-blue-500 px-4 py-3 text-white font-medium transition hover:bg-blue-600"
            >
              홈으로 돌아가기
            </button>
          </div>
        )}

        {/* 에러 표시 */}
        {result && result.status === "error" && result.error && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-6 border-2 border-red-500">
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <p className="text-xl font-bold text-red-700 mb-2">오류 발생</p>
                <p className="text-sm text-gray-700">{result.error.message}</p>
                <p className="text-xs text-gray-500 mt-2">코드: {result.error.code}</p>
              </div>
            </div>

            <button
              onClick={handleScan}
              className="w-full rounded-lg bg-blue-500 px-4 py-3 text-white font-medium transition hover:bg-blue-600"
            >
              다시 시도
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300"
            >
              홈으로 돌아가기
            </button>
          </div>
        )}

        {/* 재스캔 버튼 (성공한 경우에도 표시) */}
        {result && result.status === "success" && (
          <button
            onClick={handleScan}
            className="w-full rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300"
          >
            다시 스캔하기
          </button>
        )}
      </main>
    </div>
  )
}
