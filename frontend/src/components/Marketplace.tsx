import { Box, Button, Heading, SimpleGrid, Text, useToast, VStack } from "@chakra-ui/react";
import { useState } from 'react';
import { useAccount } from 'wagmi';

interface JokeForSale {
  id: number;
  content: string;
  price: number;
  seller: string;
}

export function Marketplace() {
  const { address, isConnected } = useAccount();
  const toast = useToast();
  const [listedJokes, setListedJokes] = useState<JokeForSale[]>([
    // Dummy data - replace with actual blockchain data
    {
      id: 1,
      content: "Why don't eggs tell jokes? They'd crack up!",
      price: 0.1,
      seller: "0x123..."
    },
    {
      id: 2, 
      content: "What do you call a fake noodle? An impasta!",
      price: 0.05,
      seller: "0x456..."
    }
  ]);

  const handleBuyJoke = (jokeId: number) => {
    if (!isConnected) {
      toast({
        title: "Please connect your wallet",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Add blockchain transaction logic here
    toast({
      title: "Purchase initiated",
      description: "Please confirm the transaction in your wallet",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleListJoke = () => {
    if (!isConnected) {
      toast({
        title: "Please connect your wallet",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Add joke listing logic here
    toast({
      title: "Listing initiated",
      description: "Please confirm the transaction in your wallet",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={8} width="100%" maxW="1200px" p={4}>
      <Heading>NFT Joke Marketplace</Heading>
      
      <Button 
        colorScheme="green" 
        size="lg" 
        onClick={handleListJoke}
        width="200px"
      >
        List a Joke for Sale
      </Button>

      <SimpleGrid columns={[1, 2, 3]} spacing={6} width="100%">
        {listedJokes.map((joke) => (
          <Box 
            key={joke.id}
            borderWidth="1px"
            borderRadius="lg"
            p={6}
            backgroundColor="whiteAlpha.100"
            _hover={{ transform: 'scale(1.02)', transition: '0.2s' }}
          >
            <VStack spacing={4}>
              <Text fontSize="md">{joke.content}</Text>
              <Text fontSize="sm" color="gray.500">
                Seller: {joke.seller}
              </Text>
              <Text fontWeight="bold">
                Price: {joke.price} ETH
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => handleBuyJoke(joke.id)}
                isDisabled={joke.seller === address}
              >
                {joke.seller === address ? 'Your Listing' : 'Buy Now'}
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
