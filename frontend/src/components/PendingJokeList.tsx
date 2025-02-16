import { Badge, Box, Button, Card, CardBody, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readContract } from 'viem/actions';
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract } from 'wagmi';
import { JOKE_NFT_ABI, JOKE_NFT_ADDRESS } from '../config/contract';
import { publicClient } from '../config/wagmi';
interface Joke {
    name: string;
    content: string;
    author: `0x${string}`;
    status: string;
    ipfsHash: string;
    createdAt: bigint;
    dadnessScore: bigint
}

const PendingJokeList = () => {

    const [jokes, setJokes] = useState<Joke[]>([]);
    const [userVotes, setUserVotes] = useState<{ [key: number]: boolean }>({});
    const { writeContract } = useWriteContract()
    const { address: userAddress } = useAccount();
    const navigate = useNavigate();

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
                console.log('Jokes:', jokes)
            } catch (innerError) {
                console.error(`Error fetching :`, innerError) // Log errors for each individual joke fetch


            }



        }

        loadExistingJokes()
    }, [totalSupply, isError, error])

    const updateJokes = async () => {
        const existingJoke = await readContract(
            publicClient,
            {
                address: JOKE_NFT_ADDRESS,
                abi: JOKE_NFT_ABI,
                functionName: 'getPendingJokes',

            },
        )
        setJokes(existingJoke as Joke[])
    }
    const voteOnDadness = async (tokenId: number) => {
        writeContract(
            {
                address: JOKE_NFT_ADDRESS,
                abi: JOKE_NFT_ABI,
                functionName: 'voteOnDadness',
                args: [BigInt(tokenId)],
            }
        );
        updateJokes()

    };

    const fetchUserVotes = async () => {
        if (!userAddress || jokes.length === 0) return;

        const votePromises = jokes.map(async (_, index) => {
            const tokenId = index + 1; // Token ID is index + 1
            const hasVoted = await readContract(
                publicClient,
                {
                    address: JOKE_NFT_ADDRESS,
                    abi: JOKE_NFT_ABI,
                    functionName: "hasVoted",
                    args: [BigInt(tokenId), userAddress], // Fetch vote status for each joke
                });

            return { tokenId, hasVoted };
        });

        const results = await Promise.all(votePromises);

        // Update state with the fetched vote statuses
        setUserVotes(
            results.reduce((acc, { tokenId, hasVoted }) => {
                acc[tokenId] = hasVoted;
                return acc;
            }, {} as { [key: number]: boolean })
        );
    };




    // Rafraîchir la liste des blagues
    useWatchContractEvent({
        address: JOKE_NFT_ADDRESS,
        abi: JOKE_NFT_ABI,
        eventName: 'DadnessVoted',
        onLogs(logs) {
            console.log('New Pending joke minted:', logs)
            if (logs && logs[0] && 'args' in logs[0]) {
                const log = logs[0] as {
                    args: {
                        tokenId: bigint
                        voter: `0x${string}`
                        newScore: bigint
                    }
                }
                console.log('New dadness voted:', log.args)
                fetchUserVotes();
                updateJokes()
            }
        },
    })
    // Listen to "JokeMinted" event
    useWatchContractEvent({
        address: JOKE_NFT_ADDRESS,
        abi: JOKE_NFT_ABI,
        eventName: 'JokeMinted',
        onLogs(logs) {
            console.log('JokeMinted event received:', logs);
            if (logs?.length > 0 && 'args' in logs[0]) {
                const log = logs[0] as {
                    args: {
                        tokenId: bigint;
                        content: string;
                        jokeType: number;
                    };
                };
                console.log('New joke minted:', log.args);
                if (log.args?.tokenId > 0) {
                    navigate('/buy')
                }

            }
        },
    });

    return (
        <Box p={4}>
            <Heading size="md" mb={4}>
                Pending Jokes ({Number(totalSupply) || 0})
            </Heading>
            <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                {Number(totalSupply) === 0 ? (
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

                                {joke.author === userAddress ? (
                                    <Button
                                        mt={2}
                                        colorScheme="blue"

                                        isDisabled={true}
                                    >
                                        You can't vote for your own joke
                                    </Button>
                                ) : (
                                    <Button
                                        mt={2}
                                        colorScheme="blue"
                                        onClick={() => voteOnDadness(index + 1)}
                                        isDisabled={userVotes[index + 1]}
                                    >
                                        {userVotes[index + 1] ? 'Voted' : 'Vote for Dadness'}

                                    </Button>
                                )}
                            </CardBody>
                        </Card>
                    ))
                )}
            </SimpleGrid>
        </Box>
    );
};

export default PendingJokeList;

