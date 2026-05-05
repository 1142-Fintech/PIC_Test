import productData from '@data/products'

export type FortuneStar = '太陽' | '太陰' | '廉貞' | '巨門' | '天機' | '文曲' | '天同' | '文昌' | '武曲' | '貪狼' | '天梁' | '破軍'
export type Palace = '財帛宮' | '官祿宮' | '田宅宮' | '子女宮' | '父母宮' | '兄弟宮' | '遷移宮' | '命宮' | '夫妻宮' | '福德宮'

export interface DailyFortune {
  tianGan: string
  tianGanIndex: number
  jiStar: FortuneStar
  luStar: FortuneStar
  palace: Palace
  copyText: string
}

export interface ProductRecommendation {
  id: number
  name: string
  price: number
  restaurant: string
  reason: string
}

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const

interface FortuneEntry {
  jiStar: FortuneStar
  luStar: FortuneStar
  palace: Palace
  copyText: string
}

const FORTUNE_DATA: FortuneEntry[] = [
  // 0: 甲日 - 太陽化忌 · 官祿宮
  { jiStar: '太陽', luStar: '廉貞', palace: '官祿宮',
    copyText: '今日太陽化忌，事業運稍受阻滯，與上司長輩溝通需多耐心，不宜衝動行事。' },
  // 1: 乙日 - 太陰化忌 · 財帛宮
  { jiStar: '太陰', luStar: '天機', palace: '財帛宮',
    copyText: '今日太陰化忌，財帛宮易有耗損，情緒波動也較大，避免衝動消費最安全。' },
  // 2: 丙日 - 廉貞化忌 · 子女宮
  { jiStar: '廉貞', luStar: '天同', palace: '子女宮',
    copyText: '今日廉貞化忌，感情溝通易起波折，讀書壓力大？創意靈感也跑走了。' },
  // 3: 丁日 - 巨門化忌 · 兄弟宮
  { jiStar: '巨門', luStar: '太陰', palace: '兄弟宮',
    copyText: '今日巨門化忌，口舌是非較多，朋友手足之間容易誤會，說話需謹慎。' },
  // 4: 戊日 - 天機化忌 · 遷移宮
  { jiStar: '天機', luStar: '貪狼', palace: '遷移宮',
    copyText: '今日天機化忌，思緒容易打結，讀書壓力山大，外出移動也要多留意安全。' },
  // 5: 己日 - 文曲化忌 · 命宮
  { jiStar: '文曲', luStar: '武曲', palace: '命宮',
    copyText: '今日文曲化忌，表達能力受壓，考試或上台報告容易失常，放鬆心情最重要。' },
  // 6: 庚日 - 天同化忌 · 福德宮
  { jiStar: '天同', luStar: '太陽', palace: '福德宮',
    copyText: '今日天同化忌，享樂運受阻，情緒易感消沉，記得給自己一點甜甜的小確幸。' },
  // 7: 辛日 - 文昌化忌 · 田宅宮
  { jiStar: '文昌', luStar: '巨門', palace: '田宅宮',
    copyText: '今日文昌化忌，考試文書運較弱，合約或報告需仔細核對，不宜粗心大意。' },
  // 8: 壬日 - 武曲化忌 · 財帛宮
  { jiStar: '武曲', luStar: '天梁', palace: '財帛宮',
    copyText: '今日武曲化忌，財帛宮受壓，記得控制支出，不宜做重大財務決策或投資。' },
  // 9: 癸日 - 貪狼化忌 · 命宮
  { jiStar: '貪狼', luStar: '破軍', palace: '命宮',
    copyText: '今日貪狼化忌，桃花運略受阻，社交場合宜收斂，不宜過度擴張人際圈。' },
]

// 各宮位 → 鼓勵語句（隨機挑一條搭配隨機餐點）
const PALACE_REASONS: Record<Palace, string[]> = {
  財帛宮: ['財帛宮受壓，吃點好的犒賞自己！', '補補財帛宮，今天的小確幸不能少！'],
  官祿宮: ['工作事業再忙也要吃飽，加油！', '事業運受阻？先吃飽再拼！'],
  田宅宮: ['居家壓力大，來點療癒食物放鬆心情！', '田宅宮需補氣，吃好才有力！'],
  子女宮: ['讀書壓力大？吃點好的補補腦力！', '創意受阻時，美食是最好的靈感來源！'],
  父母宮: ['與長輩溝通需要能量，吃飽好說話！', '父母緣薄的今天，靠美食療癒自己！'],
  兄弟宮: ['口舌是非多？甜食讓心情好轉！', '朋友緣薄的今天，一個人吃也很香！'],
  遷移宮: ['外出運差，就好好在校吃頓飯吧！', '思緒打結時，美食讓大腦充個電！'],
  命宮: ['命宮受壓，好好吃飯是今天最重要的事！', '今天更要照顧好自己，從美食開始！'],
  夫妻宮: ['感情運受阻？甜食補補心情最實在！', '桃花遇阻，自己買點好吃的更重要！'],
  福德宮: ['福德宮受阻，享樂一下是必要的！', '心情低落時，美食是最好的解藥！'],
}

// 把所有店家的商品攤平成一維陣列
const ALL_PRODUCTS = Object.entries(productData).flatMap(([restaurantName, data]) =>
  data.items.map(item => ({ id: item.id, name: item.name, price: item.price, restaurant: restaurantName }))
)

// 參考基準：2000-01-01 為 甲 日（天干 index 0）
export function getDailyFortune(date: Date = new Date()): DailyFortune {
  const ref = new Date(2000, 0, 1)
  const daysDiff = Math.floor((date.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24))
  const tianGanIndex = ((daysDiff % 10) + 10) % 10
  return {
    tianGan: TIAN_GAN[tianGanIndex],
    tianGanIndex,
    ...FORTUNE_DATA[tianGanIndex],
  }
}

// 每次呼叫都從全部 34 項商品中隨機抽一個，搭配宮位語句
export function getRandomRecommendation(palace: Palace): ProductRecommendation {
  const product = ALL_PRODUCTS[Math.floor(Math.random() * ALL_PRODUCTS.length)]
  const reasons = PALACE_REASONS[palace]
  const reason = reasons[Math.floor(Math.random() * reasons.length)]
  return { ...product, reason }
}
