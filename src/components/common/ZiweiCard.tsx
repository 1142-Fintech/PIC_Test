import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { useCart } from '@hooks/cart/cart'
import { getDailyFortune, getRandomRecommendation } from '@utils/ziwei'
import type { DailyFortune, ProductRecommendation } from '@utils/ziwei'

const STAR_POSITIONS: [number, number, number][] = [
  [10, 5, 3], [20, 15, 2], [5, 40, 2], [30, 70, 3], [60, 8, 2], [75, 25, 3],
  [80, 60, 2], [15, 85, 3], [50, 90, 2], [45, 50, 2], [65, 45, 3], [90, 80, 2],
]

export default function ZiweiCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [hasAdded, setHasAdded] = useState(false)
  const [fortune, setFortune] = useState<DailyFortune | null>(null)
  const [recommendation, setRecommendation] = useState<ProductRecommendation | null>(null)
  const { dispatch } = useCart()
  const toast = useToast()

  function openPanel() {
    const f = getDailyFortune()
    setFortune(f)
    setRecommendation(getRandomRecommendation(f.palace))
    setIsOpen(true)
    setIsFlipped(false)
    setHasAdded(false)
  }

  function closePanel() {
    setIsOpen(false)
  }

  function flip() {
    if (isFlipped) return
    setIsFlipped(true)
  }

  function addToCart() {
    if (!recommendation || hasAdded) return
    dispatch({
      type: 'ADD_ITEM',
      payload: { id: recommendation.id, name: recommendation.name, price: recommendation.price, qty: 1 }
    })
    setHasAdded(true)
    toast({
      title: '✨ 開運餐點已加入購物車！',
      description: `${recommendation.restaurant} · ${recommendation.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
    })
  }

  return (
    <>
      {/* ── 懸浮按鈕（左下角）── */}
      <button
        onClick={openPanel}
        title="抽卡"
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #312e81, #4c1d95)' }}
      >
        <span className="text-2xl">🔮</span>
      </button>

      {/* ── 面板 ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 手機點外部關閉 */}
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
            />

            <motion.div
              className="fixed bottom-24 left-6 z-50 w-[300px] sm:w-[340px] rounded-2xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* 標題列 */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🔮</span>
                  <span className="text-white font-black text-sm tracking-wider">哥們來算一掛吧</span>
                </div>
                <button
                  onClick={closePanel}
                  className="text-white/50 hover:text-white transition-colors text-base leading-none px-1"
                >
                  ✕
                </button>
              </div>

              {/* 翻牌區 */}
              <div
                onClick={flip}
                className={isFlipped ? 'cursor-default' : 'cursor-pointer'}
                style={{ perspective: '1200px', height: '210px', position: 'relative' }}
              >
                <motion.div
                  style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                >

                  {/* 正面 */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 overflow-hidden select-none"
                    style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(160deg, #312e81 0%, #4c1d95 100%)' }}
                  >
                    {STAR_POSITIONS.map(([top, left, size], i) => (
                      <div key={i} className="absolute bg-white/20 rounded-full" style={{ top: `${top}%`, left: `${left}%`, width: size, height: size }} />
                    ))}
                    <div className="text-4xl">✨</div>
                    <p className="text-purple-200 text-sm font-bold">點擊翻牌</p>
                    <p className="text-purple-300/80 text-xs">看看今天的開運餐點</p>
                  </div>

                  {/* 背面 */}
                  <div
                    className="absolute inset-0 flex flex-col justify-center px-4 gap-2 overflow-hidden select-none"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)' }}
                  >
                    {fortune && recommendation && (
                      <>
                        {/* 標籤 */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-amber-200 text-xs font-bold bg-black/25 px-2 py-0.5 rounded-full">
                            {fortune.tianGan}日
                          </span>
                          <span className="text-amber-300/80 text-xs">
                            流日{fortune.jiStar}化忌 · {fortune.palace}
                          </span>
                        </div>

                        {/* 運勢文案 */}
                        <p className="text-white/90 text-xs leading-relaxed">{fortune.copyText}</p>

                        {/* 推薦餐點 */}
                        <div className="flex items-center gap-2.5 bg-black/25 rounded-xl p-2.5">
                          <span className="text-xl flex-shrink-0">🍽️</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-amber-200 text-xs font-bold">{recommendation.restaurant}</p>
                            <p className="text-white font-extrabold text-xs truncate">{recommendation.name}</p>
                            <p className="text-amber-300/80 text-xs leading-snug mt-0.5">{recommendation.reason}</p>
                          </div>
                          <span className="text-amber-200 font-extrabold text-xs flex-shrink-0">
                            ${recommendation.price}
                          </span>
                        </div>

                        {/* 加入購物車按鈕 */}
                        {hasAdded ? (
                          <p className="flex items-center gap-1 text-green-300 text-xs font-bold">
                            <span></span><span>已加入購物車</span>
                          </p>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); addToCart() }}
                            className="w-full py-1.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-colors border border-white/20"
                          >
                            + 加入購物車
                          </button>
                        )}
                      </>
                    )}
                  </div>

                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
