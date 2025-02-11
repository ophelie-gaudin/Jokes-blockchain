import { Box, Heading, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import laughing from "../assets/laughing.jpg";
export function Home() {
  return (
    <VStack spacing={8} width="100%" maxW="1200px" p={4}>
      <Image src={laughing} alt="DadJokeDAO Logo" boxSize="100px" backgroundBlendMode="color-burn" backgroundColor="white" height="200px" width="150px" />
      <Heading>Welcome to DadJokeDAO</Heading>
      <Text fontSize="lg">
        The application aims to allow users to create, own, and sell jokes in the form of non-fungible tokens (NFTs). Each joke can increase in value based on its usage by other users.
      </Text>
      <Heading size="md">Objectives</Heading>
      <SimpleGrid columns={[1, 2]} spacing={6} width="100%">
        <Box borderWidth="1px" borderRadius="lg" p={6} backgroundColor="whiteAlpha.100">
          <VStack spacing={4}>
            <Text fontSize="2xl">🎨</Text>
            <Text fontSize="md">
              Empower users to unleash their creativity by allowing them to create and own unique jokes as NFTs. 
              These digital assets can be collected, traded, and cherished in the blockchain ecosystem.
            </Text>
          </VStack>
        </Box>
        <Box borderWidth="1px" borderRadius="lg" p={6} backgroundColor="whiteAlpha.100">
          <VStack spacing={4}>
            <Text fontSize="2xl">📈</Text>
            <Text fontSize="md">
              Enhance the value of jokes by leveraging their popularity. 
              As jokes gain traction and are shared widely, their worth increases, benefiting the creators.
            </Text>
          </VStack>
        </Box>
        <Box borderWidth="1px" borderRadius="lg" p={6} backgroundColor="whiteAlpha.100">
          <VStack spacing={4}>
            <Text fontSize="2xl">💰</Text>
            <Text fontSize="md">
              Implement a robust monetization system through micro-transactions on the blockchain. 
              This allows for seamless and efficient financial interactions, rewarding joke creators.
            </Text>
          </VStack>
        </Box>
        <Box borderWidth="1px" borderRadius="lg" p={6} backgroundColor="whiteAlpha.100">
          <VStack spacing={4}>
            <Text fontSize="2xl">🌐</Text>
            <Text fontSize="md">
              Ensure data decentralization and security by utilizing IPFS. 
              This decentralized storage solution guarantees that jokes are stored safely and are accessible globally.
            </Text>
          </VStack>
        </Box>
        <Box borderWidth="1px" borderRadius="lg" p={6} backgroundColor="whiteAlpha.100">
          <VStack spacing={4}>
            <Text fontSize="2xl">🔒</Text>
            <Text fontSize="md">
              Manage transactions and joke ownership with transparency and security. 
              The blockchain ensures that all interactions are recorded immutably, providing trust and reliability.
            </Text>
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
}


