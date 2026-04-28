import { useToast } from "@chakra-ui/react"
import { getProductImage } from "@data/image-paths"
import { useCart } from "@hooks/cart/cart"
import Image from "next/legacy/image"

export default function ProductCard({ item }: any) {
  const { dispatch } = useCart()
  const toast = useToast()

  const handleAddItem = (item: any) =>
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: item.id,
        name: item.name,
        price: item.price,
        routeName: item.routeName,
        qty: 1
      }
    })

  return (
    <div className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700">
      {/* 圖片區域 */}
      <div className="relative w-full h-48 bg-white dark:bg-gray-700 overflow-hidden">
        <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
          <Image
            layout="fill"
            objectFit="cover"
            src={getProductImage(item.id)}
            alt={item.name}
          />
        </div>
        {/* 價格 badge */}
        <div className="absolute top-3 right-3 bg-[#FF6B00] text-white px-3 py-1 rounded-xl text-sm font-extrabold shadow-md">
          ${item.price}
        </div>
      </div>

      {/* 內容區域 */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-base leading-snug">
          {item.name}
        </h3>
        <button
          type="button"
          className="mt-auto w-full py-2.5 bg-[#FF6B00] hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-sm shadow-sm"
          onClick={() => {
            handleAddItem(item)
            toast({
              status: "success",
              title: `${item.name} 已加入購物車`,
              duration: 2000,
              isClosable: true,
              position: "bottom-right"
            })
          }}
        >
          + 加入購物車
        </button>
      </div>
    </div>
  )
}
