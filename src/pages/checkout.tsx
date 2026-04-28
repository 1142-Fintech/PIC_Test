import { useRouter } from "next/router"
import { useState } from "react"

const GROUP_DATA = {
  title: "統資部午餐揪團",
  organizer: "顧北辰",
  members: [
    {
      id: 1,
      name: "你 (發起人)",
      initial: "維",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      items: [{ name: "經典排骨便當", price: 120, qty: 1 }],
    },
    {
      id: 2,
      name: "柳如煙",
      initial: "涵",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
      items: [{ name: "健康舒肥雞胸餐", price: 150, qty: 1 }],
    },
  ],
}

export default function CheckoutPage() {
  const router = useRouter()
  const [paid, setPaid] = useState<Record<number, boolean>>({})
  const [pointsUsed, setPointsUsed] = useState(false)
  const AVAILABLE_POINTS = 320

  const memberTotals = GROUP_DATA.members.map(m => ({
    ...m,
    total: m.items.reduce((s, i) => s + i.price * i.qty, 0),
  }))

  const grandTotal = memberTotals.reduce((s, m) => s + m.total, 0)
  const discount = pointsUsed ? AVAILABLE_POINTS : 0
  const finalTotal = Math.max(0, grandTotal - discount)
  const aaAmount = Math.ceil(finalTotal / GROUP_DATA.members.length)
  const paidCount = Object.values(paid).filter(Boolean).length
  const allPaid = paidCount >= GROUP_DATA.members.length

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#1A1A1B] py-6 px-4">
      <div className="max-w-xl mx-auto space-y-4">

        {/* 返回按鈕 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          ← 返回點餐
        </button>

        {/* 標題 */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">AA 結帳與折抵</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {GROUP_DATA.title} · 發起人：{GROUP_DATA.organizer}
          </p>
        </div>

        {/* AA 金額摘要 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">訂單總金額</span>
            <span className="text-lg font-bold text-gray-700 dark:text-gray-200">${grandTotal}</span>
          </div>
          {pointsUsed && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">點數折抵</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">-${discount}</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">參與人數</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{GROUP_DATA.members.length} 人</span>
          </div>
          <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <span className="text-sm font-extrabold text-[#00B14F]">每人應付（AA）</span>
            <span className="text-3xl font-extrabold text-[#FF6B00]">${aaAmount}</span>
          </div>
        </div>

        {/* 個人點餐明細 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-extrabold text-gray-800 dark:text-white">個人點餐明細</h2>
          </div>
          {memberTotals.map((member, i) => (
            <div
              key={member.id}
              className={`p-5 ${i < memberTotals.length - 1 ? "border-b border-gray-50 dark:border-gray-700" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${member.bgColor} flex items-center justify-center ${member.textColor} font-extrabold text-sm flex-shrink-0`}>
                    {member.initial}
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white text-sm">{member.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-gray-900 dark:text-white">${member.total}</span>
                  <button
                    onClick={() => setPaid(p => ({ ...p, [member.id]: !p[member.id] }))}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      paid[member.id]
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {paid[member.id] ? "✓ 已付款" : "未付款"}
                  </button>
                </div>
              </div>
              {member.items.map((item, j) => (
                <div key={j} className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-12">
                  <span>{item.name} × {item.qty}</span>
                  <span>${item.price * item.qty}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 點數折抵 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-extrabold text-gray-800 dark:text-white mb-4">點數折抵</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/60 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">可用點數</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">1 點 = $1 元折抵</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-[#00B14F]">{AVAILABLE_POINTS} 點</span>
              <button
                onClick={() => setPointsUsed(p => !p)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  pointsUsed
                    ? "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300"
                    : "bg-[#00B14F] text-white hover:bg-green-600"
                }`}
              >
                {pointsUsed ? "取消折抵" : "使用折抵"}
              </button>
            </div>
          </div>
        </div>

        {/* 付款進度 + 確認按鈕 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">付款確認進度</span>
              <span className="font-bold text-gray-800 dark:text-white">{paidCount} / {GROUP_DATA.members.length} 人</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#00B14F] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(paidCount / GROUP_DATA.members.length) * 100}%` }}
              />
            </div>
          </div>
          <button
            disabled={!allPaid}
            className={`w-full py-4 font-extrabold rounded-2xl transition-all text-base ${
              allPaid
                ? "bg-[#00B14F] hover:bg-green-600 text-white shadow-md hover:-translate-y-0.5"
                : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            {allPaid ? "完成揪團結帳 🎉" : `等待 ${GROUP_DATA.members.length - paidCount} 人確認付款`}
          </button>
        </div>

      </div>
    </div>
  )
}
