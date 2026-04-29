import { getProductImage } from "@data/image-paths"
import { useAuth } from "@hooks/auth"
import fetchAllProducts from "@utils/getAllProducts"
import {
  GroupItem,
  GroupOrder,
  joinGroup,
  subscribeToGroup,
  updateMemberItems,
} from "@utils/groupOrders"
import Image from "next/legacy/image"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"

const ALL_PRODUCTS = fetchAllProducts().products

export default function GroupPage() {
  const router = useRouter()
  const { groupId } = router.query as { groupId: string }
  const { user } = useAuth()

  const [group, setGroup] = useState<GroupOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [foodType, setFoodType] = useState(Object.keys(ALL_PRODUCTS)[0])
  const joinedRef = useRef(false)

  // 即時監聽 Realtime Database 群組資料
  useEffect(() => {
    if (!groupId) return
    const unsub = subscribeToGroup(
      groupId,
      data => {
        if (!data) setNotFound(true)
        else setGroup(data)
        setLoading(false)
      },
      err => {
        setDbError(err.message)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [groupId])

  // 自動加入群組（登入且尚未在成員列表）
  useEffect(() => {
    if (!user || !group || joinedRef.current) return
    if (group.members[user.uid]) return
    joinedRef.current = true
    joinGroup(groupId, user, Object.keys(group.members).length)
  }, [user, group, groupId])

  const myItems: GroupItem[] = (group && user && group.members[user.uid]?.items) || []

  async function addItem(item: any) {
    if (!user || !group) return
    const existing = myItems.find(i => i.id === item.id)
    const newItems: GroupItem[] = existing
      ? myItems.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      : [...myItems, { id: item.id, name: item.name, price: item.price, qty: 1 }]
    await updateMemberItems(groupId, user.uid, newItems)
  }

  async function removeItem(item: GroupItem) {
    if (!user || !group) return
    const newItems: GroupItem[] =
      item.qty <= 1
        ? myItems.filter(i => i.id !== item.id)
        : myItems.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i)
    await updateMemberItems(groupId, user.uid, newItems)
  }

  function copyLink() {
    const url = `${window.location.origin}/group/${groupId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const memberCount = group ? Object.keys(group.members).length : 0

  // ── 載入中 ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] dark:bg-[#1A1A1B]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#00B14F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-semibold">載入揪團資料中…</p>
        </div>
      </div>
    )
  }

  // ── 資料庫錯誤 ──
  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] dark:bg-[#1A1A1B]">
        <div className="text-center space-y-3 max-w-sm mx-4">
          <p className="text-5xl">⚠️</p>
          <p className="font-extrabold text-gray-800 dark:text-white text-lg">讀取失敗</p>
          <p className="text-sm text-red-500 font-mono bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{dbError}</p>
          <button onClick={() => router.push("/")} className="px-6 py-2 bg-[#00B14F] text-white font-bold rounded-xl text-sm hover:bg-green-600 transition-colors">
            回首頁
          </button>
        </div>
      </div>
    )
  }

  // ── 找不到群組 ──
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] dark:bg-[#1A1A1B]">
        <div className="text-center space-y-3">
          <p className="text-5xl">😢</p>
          <p className="font-extrabold text-gray-800 dark:text-white text-lg">找不到這個揪團</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">連結可能已失效或揪團已結束</p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 px-6 py-2 bg-[#00B14F] text-white font-bold rounded-xl text-sm hover:bg-green-600 transition-colors"
          >
            回首頁
          </button>
        </div>
      </div>
    )
  }

  // ── 未登入提示 ──
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] dark:bg-[#1A1A1B]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4 mx-4">
          <p className="text-4xl">🍱</p>
          <h2 className="font-extrabold text-gray-800 dark:text-white text-xl">
            {group?.title || "揪團點餐"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {group?.organizer.name} 邀請你加入揪團
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            請先登入才能加入並點餐
          </p>
          <button
            onClick={() => router.push(`/user/login?redirect=/group/${groupId}`)}
            className="w-full py-3 bg-[#00B14F] text-white font-extrabold rounded-xl hover:bg-green-600 transition-colors"
          >
            登入加入揪團
          </button>
        </div>
      </div>
    )
  }

  const currentCategory = (ALL_PRODUCTS as any)[foodType]

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#1A1A1B] py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">

        {/* 頂部群組資訊 */}
        <header className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-100 dark:bg-green-900/40 text-[#00B14F] text-xs font-bold px-2 py-0.5 rounded-md">
                揪團中
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {memberCount} 人已加入
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {group?.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              發起人：{group?.organizer.name}
            </p>
          </div>
          <button
            onClick={copyLink}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              copied
                ? "bg-green-50 dark:bg-green-900/20 border-green-300 text-green-600"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-[#00B14F] hover:text-[#00B14F]"
            }`}
          >
            {copied ? "✓ 已複製！" : "🔗 複製邀請連結"}
          </button>
        </header>

        {/* 二欄：分類 + 商品（購物車移至懸浮 Widget） */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* 左欄：分類 */}
          <nav className="w-full lg:w-44 flex-shrink-0 flex flex-col gap-1 bg-white dark:bg-gray-800 p-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
            <div className="px-3 py-1.5 text-xs font-black text-gray-400 dark:text-gray-500 tracking-wider">餐點分類</div>
            {Object.keys(ALL_PRODUCTS).map(cat => (
              <button
                key={cat}
                onClick={() => setFoodType(cat)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  foodType === cat
                    ? "bg-[#00B14F] text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-[#00B14F]"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* 右欄：商品格 */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentCategory?.items.map((item: any) => {
                const myQty = myItems.find(i => i.id === item.id)?.qty || 0
                return (
                  <div
                    key={item.id}
                    className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="relative w-full h-40 bg-white dark:bg-gray-700 overflow-hidden">
                      <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
                        <Image layout="fill" objectFit="cover" src={getProductImage(item.id)} alt={item.name} />
                      </div>
                      <div className="absolute top-3 right-3 bg-[#FF6B00] text-white px-3 py-1 rounded-xl text-sm font-extrabold shadow-md">
                        ${item.price}
                      </div>
                      {myQty > 0 && (
                        <div className="absolute top-3 left-3 bg-[#00B14F] text-white px-2 py-1 rounded-lg text-xs font-extrabold shadow">
                          已選 {myQty}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <p className="font-extrabold text-gray-800 dark:text-gray-100 text-sm leading-snug">{item.name}</p>
                      {myQty > 0 ? (
                        <div className="mt-auto flex items-center gap-2">
                          <button
                            onClick={() => removeItem(myItems.find(i => i.id === item.id)!)}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-500 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 hover:border-red-400 hover:text-red-500 transition-colors"
                          >
                            −
                          </button>
                          <span className="font-extrabold text-gray-800 dark:text-white flex-1 text-center">{myQty}</span>
                          <button
                            onClick={() => addItem(item)}
                            className="w-8 h-8 rounded-full bg-[#00B14F] flex items-center justify-center text-white font-bold hover:bg-green-600 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItem(item)}
                          className="mt-auto w-full py-2 bg-[#00B14F]/10 dark:bg-[#00B14F]/20 hover:bg-[#00B14F] hover:text-white text-[#00B14F] text-xs font-bold rounded-xl transition-colors"
                        >
                          + 加入我的選餐
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  return { props: {} }
}
