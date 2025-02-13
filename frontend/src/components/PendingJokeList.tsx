import { Badge, Box, Button, Card, CardBody, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { readContract } from 'viem/actions';
import { useReadContract } from 'wagmi';
import { JOKE_NFT_ABI, JOKE_NFT_ADDRESS } from '../config/contract';
import { publicClient } from '../config/wagmi';
interface Joke {
    name: string;
    content: string;
    author: `0x${string}`;
    status: string;
    ipfsHash: string;
    createdAt: bigint;
    dadnessScore:bigint
}

const PendingJokeList = () => {
    const [jokes, setJokes] = useState<Joke[]>([]);
    const [userVotes, setUserVotes] = useState<{ [key: number]: boolean }>({});

   

	const {
		data: totalSupply,
		isError,
		error,
	} = useReadContract({
		address: JOKE_NFT_ADDRESS,
		abi: JOKE_NFT_ABI,
		functionName: 'totalPendingSupply',
	})

    
    useEffect(() => {
		const loadExistingJokes = async () => {
			if (!totalSupply) {
				console.log('No total supply yet')
				return
			}

			const total = Number(totalSupply)
			console.log(`Loading ${total} Pending jokes...`)

			
				
				
					try {
						const existingJoke = await readContract(
							publicClient,
							{
								address: JOKE_NFT_ADDRESS,
								abi: JOKE_NFT_ABI,
								functionName: 'getPendingJokes',
								
							},
						) 
						

						setJokes(existingJoke as Joke[])
					} catch (innerError) {
						console.error(`Error fetching :`, innerError) // Log errors for each individual joke fetch
                        
                
				}
				console.log('Setting jokes:', jokes)
				
			
		}

		loadExistingJokes()
	}, [totalSupply, isError, error])
    // const voteOnDadness = async (tokenId: number) => {
    //     await contract.voteOnDadness(tokenId);
    //     setUserVotes({ ...userVotes, [tokenId]: true });
    //     refetch(); // Refetch jokes after voting
    // };

    return (
        <Box p={4}>
            <Heading size="md" mb={4}>
                Pending Jokes ({Number(totalSupply) || 0})
            </Heading>
            <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                {Number(totalSupply)  === 0 ? (
                    <Text>No pending jokes for approval.</Text>
                ) : (
                    jokes?.map((joke, index) => (
                        <Card key={index}>
                            <CardBody>
                                <Heading size="sm" mb={2}>
                                    {joke.name} (Joke #{index + 1})
                                </Heading>
                                <Text fontSize="lg" mb={3}>
                                    {joke.content}
                                </Text>
                                <Badge colorScheme="gray">Pending Approval</Badge>
                                <Text mt={2} fontSize="sm" color="gray.500">
                                    Value: 0 ETH
                                </Text>
                                <Text mt={2} fontSize="sm" color="gray.500">
                                    Dadness Score: {Number(joke.dadnessScore)}
                                </Text>
                                <Button
                                    mt={2}
                                    colorScheme="blue"
                                    onClick={() => voteOnDadness(joke.tokenId)}
                                    isDisabled={userVotes[joke.tokenId]}
                                >
                                    {userVotes[joke.tokenId] ? 'Voted' : 'Vote for Dadness'}
                                </Button>
                            </CardBody>
                        </Card>
                    ))
                )}
            </SimpleGrid>
        </Box>
    );
};

export default PendingJokeList;

