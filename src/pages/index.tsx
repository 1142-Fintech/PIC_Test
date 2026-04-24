import fetchAllProducts from "@utils/getAllProducts"
import Image from "next/legacy/image"
import { useState } from "react"

export function getStaticProps() {
  const { products } = fetchAllProducts()
  if (!products) {
    return { notFound: true }
  }
  return { props: { products } }
}

export default function IndexPage(props: any) {
  const [foodType, setFoodType] = useState(Object.keys(props.products)[0] || "Burgers")

  // 1. 左側分類菜單
  function renderFoodTypesMenu() {
    return Object.keys(props.products).map((item: string) => {
      const isActive = foodType === item;
      return (
        <button
          key={`fp-menu-${item}`}
          onClick={() => setFoodType(item)}
          className={`w-full text-left px-5 py-4 rounded-xl font-bold text-base transition-all duration-200 ${
            isActive
              ? "bg-[#00B14F] text-white shadow-md" // Foodomo 綠色
              : "text-gray-600 hover:bg-green-50 hover:text-[#00B14F]"
          }`}
        >
          {item}
        </button>
      );
    })
  }

  // 2. 中間餐點網格
  function renderFoodTypesGrid() {
    return props.products[foodType].items.map((item: any) => (
      <a
        href={`/shop/${props.products[foodType].routeName}`}
        key={`fp-gallery-image-${item.id}`}
        className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
        <div className="relative w-full h-40 overflow-hidden bg-gray-100">
          <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-500">
            <Image
              priority
              layout="fill"
              objectFit="cover"
              src={`/${props.products[foodType].routeName}/${item.id}`}
              alt={`${item.name}`}
            />
          </div>
          {/* 模擬的價格標籤 */}
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-gray-800 shadow-sm">
            $ {Math.floor(Math.random() * 100) + 50}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-base truncate">{item.name || "美味餐點"}</h3>
          <button className="mt-3 w-full py-2 bg-gray-50 hover:bg-[#FF6B00] hover:text-white text-gray-600 text-sm font-bold rounded-lg transition-colors">
            + 加入揪團
          </button>
        </div>
      </a>
    ))
  }

  // 3. 右側：全新揪團分帳購物車 (Sticky 黏性設計)
  function renderGroupCart() {
    return (
      <aside className="sticky top-6 w-full lg:w-80 flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 h-[calc(100vh-48px)] overflow-hidden">
        
        {/* 揪團頭部 */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-lg font-extrabold text-gray-800">統資部午餐揪團</h2>
              <p className="text-xs text-gray-500 mt-1">發起人：顧北辰</p>
            </div>
            <span className="bg-green-100 text-[#00B14F] text-xs font-bold px-2 py-1 rounded-md">
              揪團中
            </span>
          </div>
          <button className="w-full py-2 border border-gray-300 border-dashed rounded-lg text-sm font-semibold text-gray-600 hover:border-[#00B14F] hover:text-[#00B14F] transition-colors flex items-center justify-center gap-2">
            <span>🔗 複製邀請連結</span>
          </button>
        </div>

        {/* 團員點餐清單 (可滾動區域) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 團員 A */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">維</div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm font-bold text-gray-800">你 (發起人)</span>
                <span className="text-sm font-bold text-gray-800">$120</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">經典排骨便當 x1</p>
            </div>
          </div>
          {/* 團員 B */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">涵</div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm font-bold text-gray-800">柳如煙</span>
                <span className="text-sm font-bold text-gray-800">$150</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">健康舒肥雞胸餐 x1</p>
            </div>
          </div>
        </div>

        {/* 底部結帳區塊 */}
        <div className="p-5 border-t border-gray-100 bg-white">
          <div className="flex justify-between mb-4">
            <span className="text-gray-500 font-semibold text-sm">目前總金額 (2人)</span>
            <span className="text-xl font-extrabold text-[#FF6B00]">$270</span>
          </div>
          <button className="w-full py-3 bg-[#00B14F] hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
            進入 AA 結帳與折抵
          </button>
        </div>
      </aside>
    )
  }

  // 網頁主體架構
  return (
    <div className="min-h-screen bg-[#F7F7F7] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* 頂部 Header */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              {/* 這裡我們可以用橘色點綴 Foodomo */}
              <span className="text-[#00B14F]">Foodomo</span> 
              <span className="text-gray-800">校園強化版</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              專為校園與辦公室設計的無痛揪團系統
            </p>
          </div>
          <div className="text-sm font-bold text-gray-400">
            Powered by 統一資訊
          </div>
        </header>

        {/* 核心三欄式版面 */}
        <article className="flex flex-col lg:flex-row gap-6 relative">
          {/* 左欄：菜單分類 */}
          <nav className="w-full lg:w-56 flex-shrink-0 flex flex-col gap-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <div className="px-3 py-2 text-xs font-black text-gray-400 tracking-wider">餐點分類</div>
            {renderFoodTypesMenu()}
          </nav>

          {/* 中欄：商品網格 */}
          <div className="flex-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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