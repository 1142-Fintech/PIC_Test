import { useAuth } from "@hooks/auth"
import { OrderRecord, subscribeToUserOrders } from "@utils/groupOrders"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function HistoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToUserOrders(user.uid, data => {
      setOrders(data)
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#1A1A1B] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-5xl">🔒</p>
          <p className="font-extrabold text-gray-700 dark:text-gray-200 text-lg">請先登入</p>
          <button onClick={() => router.push("/user/login?redirect=/user/history")} className="px-6 py-2 bg-[#00B14F] text-white font-bold rounded-xl text-sm hover:bg-green-600 transition-colors">
            前往登入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#1A1A1B] py-6 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          ← 返回
        </button>

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">歷史訂單</h1>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#00B14F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-base font-semibold text-gray-500 dark:text-gray-400">還沒有任何歷史訂單</p>
            <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">完成結帳後訂單會出現在這裡</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const date = new Date(order.closedAt)
              const dateStr = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
              return (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {/* 標題行 */}
                  <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700 flex items-start justify-between">
                    <div>
                      <p className="font-extrabold text-gray-800 dark:text-white text-base">{order.title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {dateStr} · 發起人：{order.organizerName} · {order.memberCount} 人揪團
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-lg font-extrabold text-[#FF6B00]">${order.myTotal}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">我的金額</p>
                    </div>
                  </div>

                  {/* 餐點明細 */}
                  <div className="px-5 py-3 space-y-1.5">
                    {order.myItems.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500">未點餐</p>
                    ) : (
                      order.myItems.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {item.name} <span className="text-gray-400">× {item.qty}</span>
                          </span>
                          <span className="font-semibold text-gray-700 dark:text-gray-200">${item.price * item.qty}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 底部：全團總金額 */}
                  <div className="px-5 py-3 border-t border-gray-50 dark:border-gray-700 flex justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>全團總金額</span>
                    <span className="font-semibold">${order.grandTotal}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
