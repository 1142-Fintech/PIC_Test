import { useAuth } from "@hooks/auth"
import { useCart } from "@hooks/cart/cart"
import { AVATAR_COLORS, GroupOrder, closeGroup, saveOrderHistory, subscribeToGroup, updatePaymentStatus } from "@utils/groupOrders"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

// ── 個人結帳（無 groupId）──────────────────────────────────
function IndividualCheckout() {
  const router = useRouter()
  const { state } = useCart()
  const [paid, setPaid] = useState(false)
  const [pointsUsed, setPointsUsed] = useState(false)
  const AVAILABLE_POINTS = 320

  const cartItems = state?.cartItems ?? []
  const myTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)
  const discount = pointsUsed ? Math.min(AVAILABLE_POINTS, myTotal) : 0
  const finalTotal = Math.max(0, myTotal - discount)

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#1A1A1B] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-5xl">🛒</p>
          <p className="font-extrabold text-gray-700 dark:text-gray-200 text-lg">購物車是空的</p>
          <button onClick={() => router.push("/")} className="px-6 py-2 bg-[#00B14F] text-white font-bold rounded-xl text-sm hover:bg-green-600 transition-colors">
            回去選餐點
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#1A1A1B] py-6 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          ← 返回點餐
        </button>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">個人結帳</h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-2">
          {cartItems.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">{item.name} <span className="text-gray-400">× {item.qty}</span></span>
              <span className="font-bold">${item.price * item.qty}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between font-extrabold">
            <span>總金額</span><span className="text-[#FF6B00]">${myTotal}</span>
          </div>
          {pointsUsed && (
            <div className="flex justify-between text-sm text-green-600 font-bold">
              <span>點數折抵</span><span>-${discount}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-extrabold pt-1">
            <span>應付</span><span className="text-[#FF6B00]">${finalTotal}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">可用點數：{AVAILABLE_POINTS} 點</p>
            <p className="text-xs text-gray-400 mt-0.5">1 點 = $1 元</p>
          </div>
          <button onClick={() => setPointsUsed(p => !p)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${pointsUsed ? "bg-gray-200 dark:bg-gray-600 text-gray-600" : "bg-[#00B14F] text-white hover:bg-green-600"}`}>
            {pointsUsed ? "取消折抵" : "使用折抵"}
          </button>
        </div>

        <button
          onClick={() => setPaid(p => !p)}
          className={`w-full py-4 font-extrabold rounded-2xl transition-all text-base ${paid ? "bg-[#00B14F] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
        >
          {paid ? "✓ 已付款 完成結帳 🎉" : "確認付款"}
        </button>
      </div>
    </div>
  )
}

// ── 揪團結帳（有 groupId）──────────────────────────────────
function GroupCheckout({ groupId }: { groupId: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const { dispatch } = useCart()
  const [group, setGroup] = useState<GroupOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const unsub = subscribeToGroup(groupId, data => {
      setGroup(data)
      setLoading(false)
    })
    return () => unsub()
  }, [groupId])

  // 揪團結束後自動清空購物車並返回首頁
  useEffect(() => {
    if (!group || group.status !== "closed") return
    setRedirecting(true)
    dispatch({ type: "CLEAR_CART" })
    const t = setTimeout(() => router.replace("/"), 2000)
    return () => clearTimeout(t)
  }, [group?.status])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00B14F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">找不到揪團資料</p>
      </div>
    )
  }

  const isOrganizer = user?.uid === group.organizer.uid
  const isClosed = group.status === "closed"
  const memberList = Object.entries(group.members).sort(([, a], [, b]) => a.joinedAt - b.joinedAt)
  const grandTotal = memberList.reduce((s, [, m]) => s + m.items.reduce((ss, i) => ss + i.price * i.qty, 0), 0)
  // 發起人不需要確認轉帳，只計算非發起人的付款狀態
  const nonOrganizerList = memberList.filter(([uid]) => uid !== group.organizer.uid)
  const paidCount = nonOrganizerList.filter(([, m]) => m.paid).length
  const allPaid = nonOrganizerList.length === 0 || paidCount >= nonOrganizerList.length

  async function handleConfirmPayment() {
    if (!user) return
    await updatePaymentStatus(groupId, user.uid, true)
  }

  async function handleClose() {
    if (!group) return
    setClosing(true)
    await saveOrderHistory(group, groupId)
    await closeGroup(groupId)
    // useEffect 監聽 status 變化後會自動跳轉
    setClosing(false)
  }

  return (
    <>
      {/* 結束揪團後的跳轉覆蓋層 */}
      {redirecting && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl">
            <p className="text-5xl mb-3">🎉</p>
            <p className="font-extrabold text-gray-800 dark:text-white text-xl mb-1">揪團已結束！</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">購物車已清空，正在返回首頁…</p>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#1A1A1B] py-6 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          ← 返回點餐
        </button>

        {/* 標題 */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">揪團結帳</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {group.title} · 發起人：{group.organizer.name}
            </p>
          </div>
          {isClosed && (
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold px-3 py-1.5 rounded-xl">
              已結束
            </span>
          )}
        </div>

        {/* 訂單總覽 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">全團總金額</span>
            <span className="text-2xl font-extrabold text-[#FF6B00]">${grandTotal}</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">各自付各自的金額，請轉帳給發起人</p>
        </div>

        {/* 每人明細 + 付款狀態 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-extrabold text-gray-800 dark:text-white">個人點餐明細</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">已付 {paidCount}/{memberList.length} 人</span>
          </div>

          {memberList.map(([uid, member], i) => {
            const color = AVATAR_COLORS[member.colorIndex % AVATAR_COLORS.length]
            const isMe = uid === user?.uid
            const memberTotal = member.items.reduce((s, item) => s + item.price * item.qty, 0)

            return (
              <div key={uid} className={`p-5 ${i < memberList.length - 1 ? "border-b border-gray-50 dark:border-gray-700" : ""}`}>
                {/* 頭部：頭像 + 姓名 + 金額 + 付款按鈕 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${color.bg} ${color.text} flex items-center justify-center font-extrabold text-sm flex-shrink-0`}>
                      {member.initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-800 dark:text-white text-sm">{member.name}</span>
                        {isMe && <span className="text-xs bg-[#00B14F] text-white px-1.5 py-0.5 rounded font-bold">我</span>}
                        {uid === group.organizer.uid && <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">發起人</span>}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        應付 <span className="font-extrabold text-[#FF6B00]">${memberTotal}</span>
                      </p>
                    </div>
                  </div>

                  {/* 付款按鈕：發起人免轉帳；非發起人只能單向確認 */}
                  {uid === group.organizer.uid ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                      發起人
                    </span>
                  ) : isMe && !isClosed && !member.paid ? (
                    <button
                      onClick={handleConfirmPayment}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00B14F] text-white hover:bg-green-600 shadow-sm transition-all"
                    >
                      確認我已轉帳
                    </button>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      member.paid
                        ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                    }`}>
                      {member.paid ? "✓ 已轉帳" : "尚未轉帳"}
                    </span>
                  )}
                </div>

                {/* 餐點清單 */}
                {member.items.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 pl-12">未選餐點</p>
                ) : (
                  <div className="pl-12 space-y-1">
                    {member.items.map((item, j) => (
                      <div key={j} className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{item.name} × {item.qty}</span>
                        <span className="font-semibold">${item.price * item.qty}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-extrabold text-gray-700 dark:text-gray-200 pt-1 border-t border-gray-100 dark:border-gray-700">
                      <span>小計</span>
                      <span>${memberTotal}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 付款進度 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">轉帳確認進度</span>
              <span className="font-bold text-gray-800 dark:text-white">{paidCount} / {nonOrganizerList.length} 人</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-[#00B14F] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${nonOrganizerList.length > 0 ? (paidCount / nonOrganizerList.length) * 100 : 100}%` }}
              />
            </div>
          </div>

          {isClosed ? (
            <div className="w-full py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-center">
              <p className="font-extrabold text-gray-500 dark:text-gray-400">此揪團已結束</p>
            </div>
          ) : isOrganizer ? (
            // 發起人才能結束揪團
            <button
              onClick={handleClose}
              disabled={!allPaid || closing}
              className={`w-full py-4 font-extrabold rounded-2xl transition-all text-base ${
                allPaid
                  ? "bg-[#00B14F] hover:bg-green-600 text-white shadow-md hover:-translate-y-0.5"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {closing ? "處理中…" : allPaid ? "確認全員到齊，結束揪團 🎉" : `等待 ${nonOrganizerList.length - paidCount} 人確認轉帳`}
            </button>
          ) : (
            // 非發起人看等待狀態
            <div className={`w-full py-4 rounded-2xl text-center font-extrabold text-base ${
              allPaid
                ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                : "bg-gray-50 dark:bg-gray-700/50 text-gray-400"
            }`}>
              {allPaid ? "所有人都已轉帳 ✓" : `等待 ${nonOrganizerList.length - paidCount} 人確認轉帳`}
            </div>
          )}
        </div>

      </div>
    </div>
    </>
  )
}

// ── 主元件：根據 query 切換模式 ──────────────────────────
export default function CheckoutPage() {
  const router = useRouter()
  const { groupId } = router.query
  const [ready, setReady] = useState(false)

  useEffect(() => setReady(true), [])
  if (!ready) return null

  if (groupId && typeof groupId === "string") {
    return <GroupCheckout groupId={groupId} />
  }
  return <IndividualCheckout />
}
