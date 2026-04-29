import {
  Box,
  chakra,
  Flex,
  HStack,
  Icon,
  IconButton,
  LinkBox,
  LinkOverlay,
  Spacer,
  Stack,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react"
import firebaseClient from "@config/firebaseClient"
import { useAuth } from "@hooks/auth"
import router from "next/router"
import { useEffect, useRef, useState } from "react"
import { FaMoon, FaSun } from "react-icons/fa"
import { GiFireDash } from "react-icons/gi"

export const sections = [
  { id: "home-link", title: "home", href: "/" },
  { id: "burgers-link", title: "Burgers", href: "/shop/burgers" },
  { id: "chicken-link", title: "Chicken", href: "/shop/chicken" },
  { id: "pizza-link", title: "Pizza", href: "/shop/pizza" },
  { id: "shop-link", title: "shop", href: "/shop/" },
  { id: "sushi-link", title: "Sushi", href: "/shop/sushi" },
  { id: "sandwiches-link", title: "Sandwiches", href: "/shop/sandwiches" }
]

const NavbarLogoSection = () => (
  <div className="container px-2">
    <LinkBox
      data-testid="nav-logo"
      textDecoration="mediumslateblue"
      fontSize={{ base: "md", md: "large", lg: "2xl" }}
      letterSpacing="wide"
      fontWeight="bold"
      fontFamily="Anton"
      color="yellow.400"
      aria-label="Home Page Link"
    >
      <LinkOverlay href="/">
        <HStack>
          <Icon as={GiFireDash} boxSize="1.8em" />
          <Box>
            <chakra.span fontStyle="italic" color="mediumorchid">
              QUICK
            </chakra.span>
            EATS
          </Box>
        </HStack>
      </LinkOverlay>
    </LinkBox>
  </div>
)

export default function NavbarContent() {
  const { user } = useAuth()
  const { toggleColorMode: toggleMode } = useColorMode()
  const SwitchIcon = useColorModeValue(FaMoon, FaSun)
  const text = useColorModeValue("dark", "light")

  function UserMenu() {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const name = user?.displayName || user?.email?.split("@")[0] || "U"
    const initial = name[0].toUpperCase()

    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
      }
      document.addEventListener("mousedown", handleClick)
      return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(p => !p)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#00B14F] flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
            {initial}
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden sm:block max-w-[120px] truncate">
            {name}
          </span>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-[200]">
            <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { router.push("/user/history"); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2"
            >
              📋 歷史訂單
            </button>
            <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
              <button
                onClick={async () => { await firebaseClient.auth().signOut(); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                登出
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  function NavBarUserSection() {
    return (
      <Stack
        w="full"
        spacing={2}
        direction="row"
        justify="center"
        align="center"
      >
        {user && user.email ? (
          <UserMenu />
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/user/register")}
              className="px-4 py-2 text-sm font-bold border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 hover:border-[#00B14F] hover:text-[#00B14F] transition-colors bg-transparent"
            >
              註冊
            </button>
            <button
              onClick={() => router.push("/user/login")}
              className="px-4 py-2 text-sm font-bold bg-[#00B14F] text-white rounded-xl hover:bg-green-600 transition-colors"
            >
              登入
            </button>
          </div>
        )}
      </Stack>
    )
  }

  return (
    <Flex
      aria-label="Primary Navigation"
      as="nav"
      align="center"
      px={[0, 3, 6]}
      w="full"
      h="full"
    >
      <NavbarLogoSection />
      <Spacer />
      <NavBarUserSection />
      <IconButton
        size="md"
        fontSize="lg"
        aria-label={`Switch to ${text} mode`}
        variant="ghost"
        color="current"
        ml={{ base: "0", md: "3" }}
        onClick={toggleMode}
        icon={<SwitchIcon />}
      />
    </Flex>
  )
}
