import { getProductImage } from "@data/image-paths"
import fetchAllProducts from "@utils/getAllProducts"
import Image from "next/legacy/image"
import { useRouter } from "next/router"
import { useState } from "react"

export function getStaticProps() {
  const { products } = fetchAllProducts()
  if (!products) {
    return { notFound: true }
  }
  return { props: { products } }
}

export default function IndexPage(props: any) {
  const router = useRouter()
  const [foodType, setFoodType] = useState(Object.keys(props.products)[0] || "Burgers")

  function renderFoodTypesMenu() {
    return Object.keys(props.products).map((item: string) => {
      const isActive = foodType === item
      return (
        <button
          key={`fp-menu-${item}`}
          onClick={() => setFoodType(item)}
          className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
            isActive
              ? "bg-[#00B14F] text-white shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-[#00B14F]"
          }`}
        >
          {item}
        </button>
      )
    })
  }

  function renderFoodTypesGrid() {
    return props.products[foodType].items.map((item: any) => (
      <a
        href={`/shop/${props.products[foodType].routeName}`}
        key={`fp-gallery-image-${item.id}`}
        className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
      >
        <div className="relative w-full h-28 overflow-hidden bg-white dark:bg-gray-700">
          <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-500">
            <Image
              priority
              layout="fill"
              objectFit="cover"
              src={getProductImage(item.id)}
              alt={`${item.name}`}
            />
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate leading-tight">
            {item.name || "美味餐點"}
          </h3>
          <button className="w-full py-1.5 bg-[#00B14F]/10 dark:bg-[#00B14F]/20 hover:bg-[#00B14F] hover:text-white text-[#00B14F] text-xs font-bold rounded-lg transition-colors cursor-pointer">
            + 加入揪團
          </button>
        </div>
      </a>
    ))
  }

  function renderGroupCart() {
    return (
      <aside className="sticky top-[76px] w-full lg:w-72 flex-shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-96px)] overflow-hidden">

        {/* 揪團頭部 */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/40">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-800 dark:text-white">統資部午餐揪團</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">發起人：顧北辰</p>
            </div>
            <span className="bg-green-100 dark:bg-green-900/40 text-[#00B14F] text-xs font-bold px-2 py-1 rounded-md flex-shrink-0">
              揪團中
            </span>
          </div>
          <button className="w-full py-1.5 border border-gray-200 dark:border-gray-600 border-dashed rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:border-[#00B14F] hover:text-[#00B14F] transition-colors flex items-center justify-center gap-1.5">
            🔗 複製邀請連結
          </button>
        </div>

        {/* 團員點餐清單 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs flex-shrink-0">維</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">你 (發起人)</span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100 ml-2 flex-shrink-0">$120</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">經典排骨便當 ×1</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold text-xs flex-shrink-0">涵</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">柳如煙</span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100 ml-2 flex-shrink-0">$150</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">健康舒肥雞胸餐 ×1</p>
            </div>
          </div>
        </div>

        {/* 底部結帳 */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">目前總金額 (2人)</span>
            <span className="text-lg font-extrabold text-[#FF6B00]">$270</span>
          </div>
          <button
            className="w-full py-2.5 bg-[#00B14F] hover:bg-green-600 text-white font-bold rounded-xl shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer text-sm"
            onClick={() => router.push("/checkout")}
          >
            進入 AA 結帳與折抵
          </button>
        </div>
      </aside>
    )
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

        {/* 核心三欄式版面 */}
        <article className="flex flex-col lg:flex-row gap-5">
          {/* 左欄：菜單分類 */}
          <nav className="w-full lg:w-44 flex-shrink-0 flex flex-col gap-1 bg-white dark:bg-gray-800 p-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
            <div className="px-3 py-1.5 text-xs font-black text-gray-400 dark:text-gray-500 tracking-wider">餐點分類</div>
            {renderFoodTypesMenu()}
          </nav>

          {/* 中欄：商品網格 */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {renderFoodTypesGrid()}
            </div>
          </div>

          {/* 右欄：黏性購物車 */}
          {renderGroupCart()}
        </article>

      </div>
    </div>
  )
}
