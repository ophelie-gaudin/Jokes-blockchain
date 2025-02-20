import { Alert, AlertIcon, Box, Button, Heading, SimpleGrid, Text, useToast, VStack } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useEffect, useState } from 'react';
import { readContract } from "viem/actions";
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract } from 'wagmi';
import { JOKE_NFT_ABI, JOKE_NFT_ADDRESS } from "../config/contract";
import { publicClient } from "../config/wagmi";




interface JokeForSale {
  tokenId: bigint
  name: string
  content: string
  jokeType: number
  value: bigint
  price: bigint
  author: `0x${string}`
  owner: `0x${string}`
  ipfsHash: string
  dadnessScore: bigint
  createdAt: bigint
  lastTransferAt: bigint
  status: string
}

export function Marketplace() {
  const [userJokes, setUserJokes] = useState<JokeForSale[]>([])

  const { address: userAddress } = useAccount()
  const { writeContract, isError } = useWriteContract()
  const toast = useToast()
  const [showJokePrice, setShowJokePrice] = useState(false)

  const [jokeId, setJokeId] = useState(0)

  const {
    data: totalSupply,
    isDataError,
    error,
  } = useReadContract({
    address: JOKE_NFT_ADDRESS,
    abi: JOKE_NFT_ABI,
    functionName: 'totalSupply',
  })


  useEffect(() => {
    const loadExistingJokes = async () => {
      if (!totalSupply) {
        console.log('No total supply yet')
        return
      }

      try {
        fetchUserJokes()
      } catch (error) {
        console.error('Error loading jokes (outer):', error) // Log the error for the entire loading process
      }
    }

    loadExistingJokes()
  }, [totalSupply, isError, error])




  const fetchUserJokes = async () => {
    const existingJokes: JokeForSale[] = []
    const total = Number(totalSupply)

    for (let i = 1; i <= total; i++) {

      try {
        const [
          tokenId,
          name,
          content,
          jokeType,
          value,
          price,
          author,
          owner,
          ipfsHash,
          dadnessScore,
          createdAt,
          lastTransferAt

        ] = await readContract(publicClient, {
          address: JOKE_NFT_ADDRESS,
          abi: JOKE_NFT_ABI,
          functionName: 'getJoke',
          args: [BigInt(i)],
        })



        existingJokes.push({
          tokenId,
          name,
          content,
          jokeType,
          value,
          price,
          author,
          owner,
          ipfsHash, dadnessScore,
          createdAt,
          lastTransferAt,
          status: 'Approved',
        })

      } catch (innerError) {
        console.error(`Error fetching joke ${i}:`, innerError) // Log errors for each individual joke fetch
      }
    }


    const userJokes = existingJokes.filter(
      (joke) => joke.price > 0,
    )
    setUserJokes(userJokes)
  }






  // Watch for new jokes being minted
  useWatchContractEvent({
    address: JOKE_NFT_ADDRESS,
    abi: JOKE_NFT_ABI,
    eventName: 'JokeListed',
    onLogs() {

      fetchUserJokes()
    },
  })

  // Watch for votes as well (keep your existing DadnessVoted watcher)
  useWatchContractEvent({
    address: JOKE_NFT_ADDRESS,
    abi: JOKE_NFT_ABI,
    eventName: 'JokeBought',
    onLogs(logs) {


      if (logs && logs[0] && 'args' in logs[0]) {
        const log = logs[0] as {
          args: {
            tokenId: bigint
            buyer: `0x${string}`
            price: bigint
          }
        }



      }
      fetchUserJokes()

    },
  })






  const buyJoke = async (jokeId: number, price: bigint) => {
    try {
      const result = await writeContract({
        address: JOKE_NFT_ADDRESS,
        abi: JOKE_NFT_ABI,
        functionName: 'buyJoke',
        args: [BigInt(jokeId)],
        value: price,  // Envoi de la valeur ETH attendue
      });



      toast({
        title: "Transaction envoyée",
        description: `Vous achetez la blague pour ${ethers.formatEther(price)} ETH. Attendez la confirmation...`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });

      // **Mise à jour de la liste des blagues après achat**
      setTimeout(() => {
        fetchUserJokes();
      }, 3000); // Petit délai pour laisser le temps au contrat d'être mis à jour

    } catch (error) {
      console.error("Error buying joke:", error);
      toast({
        title: "Erreur d'achat",
        description: (error as Error).message || "La transaction a échoué.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };


  const refreshJokes = () => {
    fetchUserJokes()
  }

  return (
    <VStack spacing={8} width="100%" maxW="1200px" p={4}>
      <Heading>NFT Joke Marketplace</Heading>

      <Alert status="info" colorScheme="blue" borderRadius="md" mb={4}>
        <AlertIcon />
        In the NFT Joke Marketplace, you can buy jokes listed for sale by other users.
        Once purchased, the joke will be transferred to your account, and the previous owner will receive the ETH payment.
      </Alert>


      <Button
        colorScheme="green"
        size="lg"
        onClick={refreshJokes}
        width="200px"
      >
        List a Joke for Sale
      </Button>

      <SimpleGrid columns={[1, 2, 3]} spacing={6} width="100%">
        {userJokes.map((joke) => (
          <Box
            key={joke.tokenId}
            borderWidth="1px"
            borderRadius="lg"
            p={6}
            backgroundColor="whiteAlpha.100"
            _hover={{ transform: 'scale(1.02)', transition: '0.2s' }}
          >
            <VStack spacing={4}>
              <Text fontSize="md">{joke.name}</Text>
              <Text fontSize="md">{joke.content}</Text>
              <Text fontSize="sm" color="gray.500">
                Seller: {joke.owner}
              </Text>
              <Text fontWeight="bold">
                Price: {ethers.formatEther(joke.price)} ETH
              </Text>
              <Text fontWeight="bold">
                Dadness Score: {Number(joke.dadnessScore)}
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => buyJoke(Number(joke.tokenId), joke.price)}
                isDisabled={joke.owner === userAddress}
              >

                {joke.owner === userAddress ? 'Your Listing' : 'Buy Now'}
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
