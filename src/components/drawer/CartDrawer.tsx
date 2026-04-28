import { LockIcon } from "@chakra-ui/icons"
import {
  Alert,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack
} from "@chakra-ui/react"
import { useAuth } from "@hooks/auth"
import { useCart } from "@hooks/cart/cart"
import { useRef } from "react"
import { FaShoppingBasket } from "react-icons/fa"

function CartDrawer() {
  const { dispatch } = useCart()
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { state } = useCart()
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const bg = useColorModeValue("white", "gray.800")
  const headerBg = useColorModeValue("gray.50", "gray.750")
  const itemBg = useColorModeValue("gray.50", "gray.700")
  const borderColor = useColorModeValue("gray.100", "gray.600")
  const textColor = useColorModeValue("gray.800", "white")
  const subTextColor = useColorModeValue("gray.500", "gray.400")

  const handleAddItem = (item: CartItem) =>
    dispatch({
      type: "ADD_ITEM",
      payload: { id: item.id, name: item.name, price: item.price, routeName: item.routeName, qty: 1 }
    })

  const handleRemoveItem = (item: CartItem) =>
    dispatch({
      type: "REMOVE_ITEM",
      payload: { id: item.id, name: item.name, price: item.price, routeName: item.routeName, qty: -1 }
    })

  const getTotalQty = () => {
    if (state?.cartItems && state.cartItems.length > 0) {
      return state.cartItems.map(item => item.qty).reduce((a, b) => a + b)
    }
    return 0
  }

  const getTotalPrice = () => {
    if (state?.cartItems && state.cartItems.length > 0) {
      return state.cartItems.map(item => item.price * item.qty).reduce((a, b) => a + b)
    }
    return 0
  }

  const totalQty = getTotalQty()
  const totalPrice = getTotalPrice()
  const cartItems = state?.cartItems

  return (
    <>
      {/* 購物車按鈕 */}
      <Box position="relative" display="inline-flex" mr={2}>
        <Button
          ref={btnRef}
          onClick={onOpen}
          variant="ghost"
          size="sm"
          aria-label="購物車"
          px={2}
        >
          <FaShoppingBasket size={18} />
        </Button>
        {totalQty > 0 && (
          <Badge
            position="absolute"
            top="-1"
            right="-1"
            colorScheme="orange"
            rounded="full"
            variant="solid"
            fontSize="9px"
            minW="17px"
            h="17px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            pointerEvents="none"
          >
            {totalQty}
          </Badge>
        )}
      </Box>

      <Drawer size="md" isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay backdropFilter="blur(3px)" />
        <DrawerContent bg={bg}>
          <DrawerCloseButton mt={1} />
          <DrawerHeader bg={headerBg} borderBottomWidth="1px" borderColor={borderColor} py={4}>
            <HStack spacing={2}>
              <FaShoppingBasket />
              <Text fontWeight="extrabold" fontSize="lg">購物車</Text>
              {totalQty > 0 && (
                <Badge colorScheme="orange" rounded="full" px={2} variant="subtle" fontSize="xs">
                  {totalQty} 件
                </Badge>
              )}
            </HStack>
          </DrawerHeader>

          <DrawerBody py={4} px={4}>
            {!cartItems || cartItems.length === 0 ? (
              /* 空購物車狀態 */
              <VStack h="full" justify="center" spacing={4} color={subTextColor} py={20}>
                <Text fontSize="5xl">🛒</Text>
                <Text fontWeight="extrabold" fontSize="lg" color={textColor}>購物車是空的</Text>
                <Text fontSize="sm" textAlign="center" maxW="200px">
                  前往餐點頁面，挑選你喜愛的美食吧！
                </Text>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                {cartItems.map(item => (
                  <Box
                    key={`Cart-Item-${item.name}`}
                    bg={itemBg}
                    borderRadius="xl"
                    p={4}
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Flex justify="space-between" align="center" gap={3}>
                      {/* 品項名稱與單價 */}
                      <Box flex={1} minW={0}>
                        <Text
                          fontWeight="bold"
                          fontSize="sm"
                          color={textColor}
                          noOfLines={2}
                          lineHeight="short"
                        >
                          {item.name}
                        </Text>
                        <Text fontSize="xs" color={subTextColor} mt={1}>
                          單價 ${item.price}
                        </Text>
                      </Box>

                      {/* 數量控制 + 小計 */}
                      <VStack spacing={2} align="flex-end" flexShrink={0}>
                        <HStack spacing={1}>
                          <IconButton
                            aria-label="減少數量"
                            icon={<Text fontWeight="bold" fontSize="md" lineHeight="1">−</Text>}
                            size="xs"
                            variant="outline"
                            colorScheme="gray"
                            borderRadius="full"
                            w="26px"
                            h="26px"
                            minW="26px"
                            onClick={() => handleRemoveItem(item)}
                          />
                          <Text
                            fontWeight="extrabold"
                            fontSize="sm"
                            minW="24px"
                            textAlign="center"
                            color={textColor}
                          >
                            {item.qty}
                          </Text>
                          <IconButton
                            aria-label="增加數量"
                            icon={<Text fontWeight="bold" fontSize="md" lineHeight="1">+</Text>}
                            size="xs"
                            variant="solid"
                            colorScheme="orange"
                            borderRadius="full"
                            w="26px"
                            h="26px"
                            minW="26px"
                            onClick={() => handleAddItem(item)}
                          />
                        </HStack>
                        <Text fontWeight="extrabold" fontSize="sm" color="orange.500">
                          ${item.price * item.qty}
                        </Text>
                      </VStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </DrawerBody>

          <DrawerFooter
            borderTopWidth="1px"
            borderColor={borderColor}
            flexDirection="column"
            gap={3}
            bg={headerBg}
            py={5}
            px={5}
          >
            {/* 總金額 */}
            {totalPrice > 0 && (
              <Flex w="full" justify="space-between" align="center" px={1}>
                <Text fontWeight="semibold" color={subTextColor}>總金額</Text>
                <Text fontWeight="extrabold" fontSize="2xl" color="orange.500">
                  ${totalPrice}
                </Text>
              </Flex>
            )}

            {/* 未登入提醒 */}
            {!user && cartItems && cartItems.length > 0 && (
              <Alert status="warning" borderRadius="xl" py={2} fontSize="sm">
                請先登入才能前往結帳
              </Alert>
            )}

            {/* 操作按鈕 */}
            <VStack w="full" spacing={2}>
              <Button
                w="full"
                size="lg"
                colorScheme="orange"
                isDisabled={!user || !cartItems || cartItems.length === 0}
                leftIcon={<LockIcon />}
                borderRadius="xl"
                fontWeight="extrabold"
                onClick={onClose}
              >
                前往結帳
              </Button>
              <Button
                w="full"
                variant="ghost"
                size="md"
                onClick={onClose}
                color={subTextColor}
                fontWeight="semibold"
              >
                繼續選購
              </Button>
            </VStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default CartDrawer
