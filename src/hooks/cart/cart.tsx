import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useReducer
} from "react"
import { addItemToCart, removeItemFromCart } from "./cart-functions"

const CART_KEY = "foodomo-cart"

const CartContext = createContext<{
  state: State | null
  dispatch: Dispatch<any>
}>({
  state: { cartItems: [] },
  dispatch: () => null
})

function reducer(state: State, action: any): State {
  switch (action.type) {
    case "ADD_ITEM":
      return { cartItems: addItemToCart(state, action.payload) }
    case "REMOVE_ITEM":
      return { cartItems: removeItemFromCart(state, action.payload) }
    case "RESTORE":
      return { cartItems: action.payload }
    case "CLEAR_CART":
      return { cartItems: [] }
    default:
      return state
  }
}

export const CartProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // 永遠從空狀態開始，避免 server/client hydration 不一致
  const [state, dispatch] = useReducer(reducer, { cartItems: [] })

  // hydration 完成後才從 localStorage 讀取
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.cartItems?.length > 0) {
          dispatch({ type: "RESTORE", payload: parsed.cartItems })
        }
      }
    } catch {}
  }, [])

  // 狀態變動就存入 localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(state))
  }, [state])

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
