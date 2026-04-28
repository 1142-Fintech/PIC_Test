import ProductsList from "@components/common/ProductsList"
import { sections } from "@config/site-sections"
import productData from "@data/products"
import { capitalizeFirst } from "@utils/capitalizeFirst"
import { GetStaticPaths, GetStaticProps } from "next"

export const getStaticProps: GetStaticProps = async ({ params }: any) => {
  const collectionTitle = capitalizeFirst(params.category)
  const data = productData[collectionTitle as keyof typeof productData]

  if (!data) {
    return { notFound: true }
  }

  return { props: { data } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = sections.map(section => `/shop/${section.name}`)

  return {
    paths,
    fallback: "blocking"
  }
}

export default function ShopByCategoryPage(props: any) {
  return <ProductsList {...props} />
}
