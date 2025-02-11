import { Box, HStack, Link, Text, VStack } from "@chakra-ui/react";

export function Footer() {
  return (
    <Box
      as="footer"
      width="100%"
      py={4}
      backgroundColor="gray.800"
      color="white"
    >
      <VStack spacing={4}>
        <HStack spacing={8}>
          <Link href="/" color="teal.200">
            Home
          </Link>
          <Link href="/create" color="teal.200">
            Create a Joke
          </Link>
          <Link href="/vote" color="teal.200">
            Vote
          </Link>
          <Link href="/market" color="teal.200">
            Marketplace
          </Link>
        </HStack>
        <Text fontSize="sm">
          © {new Date().getFullYear()} DadJokeDAO. All rights reserved.
        </Text>
      </VStack>
    </Box>
  );
}
