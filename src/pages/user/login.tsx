import firebaseClient from "@config/firebaseClient"
import { useAuth } from "@hooks/auth"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()
  const redirect = (router.query.redirect as string) || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // 登入成功後自動跳轉
  useEffect(() => {
    if (user) router.replace(redirect)
  }, [user, redirect, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await firebaseClient.auth().signInWithEmailAndPassword(email, password)
      // useEffect 會處理跳轉
    } catch (err: any) {
      const code = err?.code || ""
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("帳號或密碼不正確")
      } else if (code === "auth/too-many-requests") {
        setError("嘗試次數過多，請稍後再試")
      } else {
        setError("登入失敗，請稍後再試")
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#1A1A1B] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold">
            <span className="text-[#00B14F]">Foodomo</span>
            <span className="text-gray-800 dark:text-gray-100"> 校園版</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            {redirect !== "/" ? "登入後加入揪團" : "登入你的帳號"}
          </p>
        </div>

        {/* 表單卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                電子信箱
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B14F] focus:border-transparent text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B14F] focus:border-transparent text-sm transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00B14F] hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm text-sm"
            >
              {loading ? "登入中…" : "登入"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">還沒有帳號？</span>
            <button
              onClick={() => router.push(`/user/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`)}
              className="ml-1 text-sm font-bold text-[#00B14F] hover:underline"
            >
              立即註冊
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
