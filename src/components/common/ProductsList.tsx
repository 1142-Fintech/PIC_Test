import ProductCard from "@components/common/ProductCard"

export default function ProductsList(props: any) {
  const { data } = props
  const { items } = data

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#1A1A1B] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Page title */}
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight capitalize">
            {data.title || data.routeName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            共 {items.length} 款餐點
          </p>
        </header>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item: any, i: number) => (
            <ProductCard
              key={`product-${item.id}-${i}`}
              item={item}
              routeName={data.routeName}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
