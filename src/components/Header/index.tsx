import { Box, useColorModeValue } from "@chakra-ui/react"
import HeaderContent from "./Content"

function Navbar() {
  const bg = useColorModeValue("whitesmoke", "#202020")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  return (
    <Box
      as="header"
      id="navbar"
      position="fixed"
      top="0"
      left="0"
      right="0"
      w="full"
      h="16"
      zIndex="100"
      bg={bg}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      shadow="sm"
    >
      <HeaderContent />
    </Box>
  )
}
export default Navbar
