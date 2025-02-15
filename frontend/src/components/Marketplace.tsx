import { Box, Button, Heading, SimpleGrid, Text, useToast, VStack } from "@chakra-ui/react";
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useWriteContract } from 'wagmi';
import { JOKE_NFT_ABI, JOKE_NFT_ADDRESS } from '../config/contract';

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

  const { writeContract } = useWriteContract();

  const handleBuyJoke = async (jokeId: number, price: number) => {
    if (!isConnected) {
      toast({
        title: "Please connect your wallet",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const transaction = await writeContract({
        address: JOKE_NFT_ADDRESS,
        abi: JOKE_NFT_ABI,
        functionName: 'buyJoke',
        args: [BigInt(jokeId)],
        value: BigInt(Math.floor(price * 10 ** 18))
      });

      toast({
        title: "Transaction sent!",
        description: "Your purchase is being processed.",
        status: "success",
        duration: 5000,
      });

    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Transaction failed",
        description: (err as Error).message || "Something went wrong.",
        status: "error",
        duration: 5000,
      });
    }
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
                onClick={() => handleBuyJoke(joke.id, joke.price)}
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
