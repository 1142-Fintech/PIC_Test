import firebaseClient from "@config/firebaseClient"
import { useAuth } from "@hooks/auth"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function RegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const redirect = (router.query.redirect as string) || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) router.replace(redirect)
  }, [user, redirect, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirm) {
      setError("兩次輸入的密碼不一致")
      return
    }
    if (password.length < 6) {
      setError("密碼至少需要 6 個字元")
      return
    }
    setLoading(true)
    try {
      await firebaseClient.auth().createUserWithEmailAndPassword(email, password)
    } catch (err: any) {
      const code = err?.code || ""
      if (code === "auth/email-already-in-use") {
        setError("此信箱已被註冊，請直接登入")
      } else if (code === "auth/invalid-email") {
        setError("信箱格式不正確")
      } else if (code === "auth/weak-password") {
        setError("密碼強度不足，請使用更複雜的密碼")
      } else {
        setError("註冊失敗，請稍後再試")
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
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">建立新帳號</p>
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
                placeholder="至少 6 個字元"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B14F] focus:border-transparent text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
                確認密碼
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="再輸入一次密碼"
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
              {loading ? "註冊中…" : "建立帳號"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">已有帳號？</span>
            <button
              onClick={() => router.push(`/user/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`)}
              className="ml-1 text-sm font-bold text-[#00B14F] hover:underline"
            >
              直接登入
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
