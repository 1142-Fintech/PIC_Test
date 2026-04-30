const idToImage: Record<number, string> = {
  // 星巴克 (id 2–9)
  2: "/images/2.jpg",
  3: "/images/3.jpg",
  4: "/images/4.jpg",
  5: "/images/5.jpg",
  6: "/images/6.jpg",
  7: "/images/7.jpg",
  8: "/images/8.jpg",
  9: "/images/9.jpg",
  // COLDSTONE (id 10–17)
  10: "/images/10.jpg",
  11: "/images/11.jpg",
  12: "/images/12.jpg",
  13: "/images/13.jpg",
  14: "/images/14.jpg",
  15: "/images/15.jpg",
  16: "/images/16.jpg",
  17: "/images/17.jpg",
  // Mister Donut (id 18–22)
  18: "/images/18.jpg",
  19: "/images/19.jpg",
  20: "/images/20.jpg",
  21: "/images/21.jpg",
  22: "/images/22.jpg",
  // 21世紀 (id 23–29)
  23: "/images/23.jpg",
  24: "/images/24.jpg",
  25: "/images/25.jpg",
  26: "/images/26.jpg",
  27: "/images/27.jpg",
  28: "/images/28.jpg",
  29: "/images/29.jpg",
  // Semeur聖娜 (id 30–35)
  30: "/images/30.jpg",
  31: "/images/31.jpg",
  32: "/images/32.jpg",
  33: "/images/33.jpg",
  34: "/images/34.jpg",
  35: "/images/35.jpg",
}

export function getProductImage(id: number): string {
  return idToImage[id] ?? "/images/1.jpg"
}
