import { useAuth } from "@hooks/auth"
import { useCart } from "@hooks/cart/cart"
import { AVATAR_COLORS, GroupOrder, createGroup, subscribeToGroup } from "@utils/groupOrders"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function GroupCartWidget() {
  const { state, dispatch } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [group, setGroup] = useState<GroupOrder | null>(null)

  const groupId = router.query.groupId as string | undefined
  const isGroupPage = router.pathname === "/group/[groupId]" && !!groupId
  const isCheckoutPage = router.pathname === "/checkout"

  useEffect(() => setMounted(true), [])

  // 群組頁才訂閱 Firebase
  useEffect(() => {
    if (!groupId) { setGroup(null); return }
    const unsub = subscribeToGroup(groupId, data => setGroup(data))
    return () => unsub()
  }, [groupId])

  const cartItems = state?.cartItems ?? []

  // 懸浮按鈕 badge 數字：群組模式用群組總數，個人模式用購物車數
  const memberList = group ? Object.entries(group.members).sort(([, a], [, b]) => a.joinedAt - b.joinedAt) : []
  const groupBadge = memberList.reduce((s, [, m]) => s + m.items.reduce((ss, i) => ss + i.qty, 0), 0)
  const localBadge = cartItems.reduce((s, i) => s + i.qty, 0)
  const badge = isGroupPage ? groupBadge : localBadge

  async function handleCreateGroup() {
    if (!user) {
      setNotice("請先登入才能建立揪團")
      setTimeout(() => setNotice(null), 2500)
      return
    }
    setCreating(true)
    try {
      const gid = await createGroup(user)
      const url = `${window.location.origin}/group/${gid}`
      await navigator.clipboard.writeText(url)
      router.push(`/group/${gid}`)
    } catch (err: any) {
      console.error("createGroup error:", err)
      setNotice(`建立失敗：${err?.message || "未知錯誤"}`)
      setTimeout(() => setNotice(null), 5000)
    }
    setCreating(false)
  }

  const handleAdd = (item: any) => dispatch({ type: "ADD_ITEM", payload: { ...item, qty: 1 } })
  const handleRemove = (item: any) => dispatch({ type: "REMOVE_ITEM", payload: { ...item, qty: -1 } })

  if (!mounted || isCheckoutPage) return null

  const grandTotal = memberList.reduce((s, [, m]) => s + m.items.reduce((ss, i) => ss + i.price * i.qty, 0), 0)
  const localTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <>
      {/* 懸浮按鈕 */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#00B14F] hover:bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          aria-label="開啟購物車"
        >
          <span className="text-2xl">{isGroupPage ? "🍱" : "🛒"}</span>
          {badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center shadow">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </button>
      )}

      {/* 展開側邊欄 */}
      {isExpanded && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setIsExpanded(false)} />

          <aside className="fixed right-0 top-16 bottom-0 z-50 w-80 flex flex-col bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700">

            {/* ── 群組模式頭部 ── */}
            {isGroupPage ? (
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/40">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-base font-extrabold text-gray-800 dark:text-white">{group?.title || "揪團點餐"}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">發起人：{group?.organizer.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 dark:bg-green-900/40 text-[#00B14F] text-xs font-bold px-2 py-1 rounded-md">揪團中</span>
                    <button onClick={() => setIsExpanded(false)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 text-xl font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">×</button>
                  </div>
                </div>
                {user?.uid === group?.organizer.uid && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/group/${groupId}`); setNotice("已複製！"); setTimeout(() => setNotice(null), 2000) }}
                    className="w-full py-1.5 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-500 hover:border-[#00B14F] hover:text-[#00B14F] transition-colors flex items-center justify-center gap-1.5"
                  >
                    {notice || "🔗 複製邀請連結"}
                  </button>
                )}
              </div>
            ) : (
              /* ── 個人模式頭部 ── */
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/40">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-extrabold text-gray-800 dark:text-white">我的選餐</h2>
                  <button onClick={() => setIsExpanded(false)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 text-xl font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">×</button>
                </div>
                {notice && <p className="text-xs text-center text-orange-500 font-semibold mb-2">{notice}</p>}
                <button
                  onClick={handleCreateGroup}
                  disabled={creating}
                  className="w-full py-1.5 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-500 hover:border-[#00B14F] hover:text-[#00B14F] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  {creating ? "建立中…" : "🔗 建立揪團 & 複製連結"}
                </button>
              </div>
            )}

            {/* ── 群組模式：成員列表 ── */}
            {isGroupPage ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {memberList.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-8">還沒有人加入</p>
                ) : memberList.map(([uid, member]) => {
                  const color = AVATAR_COLORS[member.colorIndex % AVATAR_COLORS.length]
                  const memberTotal = member.items.reduce((s, i) => s + i.price * i.qty, 0)
                  const isMe = uid === user?.uid
                  return (
                    <div key={uid} className={`rounded-xl p-3 ${isMe ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40" : "bg-gray-50 dark:bg-gray-700/40"}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-7 h-7 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-xs font-extrabold flex-shrink-0`}>{member.initial}</div>
                        <span className="text-sm font-extrabold text-gray-800 dark:text-gray-100 truncate flex-1">{member.name}</span>
                        {isMe && <span className="text-xs bg-[#00B14F] text-white px-1.5 rounded font-bold">我</span>}
                        <span className="text-sm font-extrabold text-[#FF6B00] flex-shrink-0">${memberTotal}</span>
                      </div>
                      {member.items.length === 0 ? (
                        <p className="text-xs text-gray-400 pl-9">{isMe ? "快去選餐點！" : "未選餐點"}</p>
                      ) : (
                        <div className="pl-9 space-y-0.5">
                          {member.items.map((item, j) => (
                            <div key={j} className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span className="truncate">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
                              <span className="ml-2 flex-shrink-0">${item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              /* ── 個人模式：購物車 ── */
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                    <span className="text-5xl mb-3">🛒</span>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">還沒有任何餐點</p>
                    <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">在左側選好分類後加入餐點</p>
                  </div>
                ) : cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/60 rounded-xl p-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleRemove(item)} className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-500 flex items-center justify-center text-gray-600 hover:border-red-400 hover:text-red-500 text-sm font-bold transition-colors">−</button>
                      <span className="text-sm font-extrabold text-gray-800 dark:text-white min-w-[1.25rem] text-center">{item.qty}</span>
                      <button onClick={() => handleAdd(item)} className="w-6 h-6 rounded-full bg-[#00B14F] flex items-center justify-center text-white text-sm font-bold hover:bg-green-600 transition-colors">+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 底部 */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3">
              {isGroupPage ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500">{memberList.length} 人，全團總計</span>
                    <span className="text-lg font-extrabold text-[#FF6B00]">${grandTotal}</span>
                  </div>
                  <button
                    disabled={groupBadge === 0}
                    onClick={() => {
                      if (!user) {
                        router.push(`/user/login?redirect=${encodeURIComponent(`/checkout?groupId=${groupId}`)}`)
                        setIsExpanded(false)
                        return
                      }
                      router.push(`/checkout?groupId=${groupId}`)
                    }}
                    className="w-full py-2.5 bg-[#00B14F] hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    進入結帳
                  </button>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500">{cartItems.length} 種餐點</span>
                    <span className="text-lg font-extrabold text-[#FF6B00]">${localTotal}</span>
                  </div>
                  <button
                    disabled={cartItems.length === 0}
                    onClick={() => {
                      if (!user) {
                        router.push("/user/login?redirect=/checkout")
                        setIsExpanded(false)
                        return
                      }
                      router.push("/checkout")
                    }}
                    className="w-full py-2.5 bg-[#00B14F] hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    個人結帳
                  </button>
                </>
              )}
              <button onClick={() => setIsExpanded(false)} className="w-full py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                縮小 ↘
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
