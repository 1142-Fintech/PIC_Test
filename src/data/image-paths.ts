const TOTAL_IMAGES = 12

const idToImage: Record<number, string> = {
  // Burgers (id 2–9)
  2: "/images/1.jpg",
  3: "/images/2.jpg",
  4: "/images/3.jpg",
  5: "/images/4.jpg",
  6: "/images/5.jpg",
  7: "/images/7.jpg",
  8: "/images/8.jpg",
  9: "/images/9.jpg",
  // Pizza (id 10–17)
  10: "/images/10.jpg",
  11: "/images/11.jpg",
  12: "/images/12.jpg",
  13: "/images/1.jpg",
  14: "/images/2.jpg",
  15: "/images/3.jpg",
  16: "/images/4.jpg",
  17: "/images/5.jpg",
  // Sushi (id 18–22)
  18: "/images/6.jpg",
  19: "/images/7.jpg",
  20: "/images/8.jpg",
  21: "/images/9.jpg",
  22: "/images/10.jpg",
  // Chicken (id 23–29)
  23: "/images/11.jpg",
  24: "/images/12.jpg",
  25: "/images/1.jpg",
  26: "/images/2.jpg",
  27: "/images/3.jpg",
  28: "/images/4.jpg",
  29: "/images/5.jpg",
  // Sandwiches (id 30–35)
  30: "/images/6.jpg",
  31: "/images/7.jpg",
  32: "/images/8.jpg",
  33: "/images/9.jpg",
  34: "/images/10.jpg",
  35: "/images/11.jpg",
}

export function getProductImage(id: number): string {
  return idToImage[id] ?? `/images/${(id % TOTAL_IMAGES) + 1}.jpg`
}
