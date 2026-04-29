import { getProductImage } from "@data/image-paths"
import { useCart } from "@hooks/cart/cart"
import fetchAllProducts from "@utils/getAllProducts"
import Image from "next/legacy/image"
import { useState } from "react"

export function getStaticProps() {
  const { products } = fetchAllProducts()
  if (!products) return { notFound: true }
  return { props: { products } }
}

export default function IndexPage(props: any) {
  const { state, dispatch } = useCart()
  const [foodType, setFoodType] = useState(Object.keys(props.products)[0] || "Burgers")

  const cartItems = state?.cartItems ?? []
  const currentItems = props.products[foodType]?.items ?? []

  function addItem(item: any) {
    dispatch({ type: "ADD_ITEM", payload: { id: item.id, name: item.name, price: item.price, qty: 1 } })
  }

  function removeItem(item: any) {
    dispatch({ type: "REMOVE_ITEM", payload: { id: item.id, name: item.name, price: item.price, qty: -1 } })
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#1A1A1B] py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">

        {/* 頂部 Header */}
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00B14F]">Foodomo</span>
              <span className="text-gray-800 dark:text-gray-200">校園強化版</span>
            </h1>
            <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              專為校園與辦公室設計的無痛揪團系統
            </p>
          </div>
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500">
            Powered by 統一資訊
          </div>
        </header>

        {/* 二欄：分類 + 商品（購物車移至懸浮 Widget） */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* 左欄：分類 */}
          <nav className="w-full lg:w-44 flex-shrink-0 flex flex-col gap-1 bg-white dark:bg-gray-800 p-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
            <div className="px-3 py-1.5 text-xs font-black text-gray-400 dark:text-gray-500 tracking-wider">餐點分類</div>
            {Object.keys(props.products).map((cat: string) => (
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
              {currentItems.map((item: any) => {
                const qty = cartItems.find((i: any) => i.id === item.id)?.qty || 0
                return (
                  <div
                    key={item.id}
                    className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
                  >
                    {/* 圖片 */}
                    <div className="relative w-full h-36 bg-white dark:bg-gray-700 overflow-hidden">
                      <Image layout="fill" objectFit="cover" src={getProductImage(item.id)} alt={item.name} />
                      <div className="absolute top-2 right-2 bg-[#FF6B00] text-white px-2.5 py-0.5 rounded-lg text-sm font-extrabold shadow">
                        ${item.price}
                      </div>
                      {qty > 0 && (
                        <div className="absolute top-2 left-2 bg-[#00B14F] text-white px-2 py-0.5 rounded-lg text-xs font-extrabold shadow">
                          已選 {qty}
                        </div>
                      )}
                    </div>

                    {/* 內容 */}
                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <p className="font-extrabold text-gray-800 dark:text-gray-100 text-sm leading-snug">{item.name}</p>
                      {qty > 0 ? (
                        <div className="mt-auto flex items-center gap-2">
                          <button
                            onClick={() => removeItem(item)}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-500 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 hover:border-red-400 hover:text-red-500 transition-colors"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center font-extrabold text-gray-800 dark:text-white">{qty}</span>
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
                          + 加入購物車
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
