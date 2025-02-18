import {
    Alert,
    AlertIcon,
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Heading,
    SimpleGrid,
    Text
} from '@chakra-ui/react';
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

interface PendingJokeView {
    tokenId: number;
    pendingJoke: Joke;
}

const PendingJokeList = () => {

    const [jokes, setJokes] = useState<PendingJokeView[]>([]);
    const [userVotes, setUserVotes] = useState<{ [key: number]: boolean }>({});
    const { writeContract } = useWriteContract()
    const { address: userAddress } = useAccount();
    const navigate = useNavigate();

    const {
        data: totalPendingSupply,
        isError,
        error,
    } = useReadContract({
        address: JOKE_NFT_ADDRESS,
        abi: JOKE_NFT_ABI,
        functionName: 'totalPendingSupply',
    })





    useEffect(() => {
        const loadExistingJokes = async () => {
            if (!totalPendingSupply) {
                console.log('No total supply yet')
                return
            }




            try {
                const existingJoke = await readContract(
                    publicClient,
                    {
                        address: JOKE_NFT_ADDRESS,
                        abi: JOKE_NFT_ABI,
                        functionName: 'getPendingJokes',

                    },
                )


                setJokes(existingJoke as PendingJokeView[])

            } catch (innerError) {
                console.error(`Error fetching :`, innerError) // Log errors for each individual joke fetch


            }



        }

        loadExistingJokes()
    }, [totalPendingSupply, isError, error])

    const updateJokes = async () => {
        const existingJoke = await readContract(
            publicClient,
            {
                address: JOKE_NFT_ADDRESS,
                abi: JOKE_NFT_ABI,
                functionName: 'getPendingJokes',

            },
        )
        setJokes(existingJoke as PendingJokeView[])
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

            if (logs && logs[0] && 'args' in logs[0]) {
                const log = logs[0] as {
                    args: {
                        tokenId: bigint
                        voter: `0x${string}`
                        newScore: bigint
                    }
                }
                if (log.args?.newScore > 0) {
                    fetchUserVotes();
                    updateJokes()
                }
            }
        },
    })
    // Listen to "JokeMinted" event
    useWatchContractEvent({
        address: JOKE_NFT_ADDRESS,
        abi: JOKE_NFT_ABI,
        eventName: 'JokeMinted',
        onLogs(logs) {

            if (logs?.length > 0 && 'args' in logs[0]) {
                const log = logs[0] as {
                    args: {
                        tokenId: bigint;
                        content: string;
                        jokeType: number;
                    };
                };

                if (log.args?.tokenId > 0) {
                    navigate('/buy')
                }

            }
        },
    });

    return (
        <Box p={4}>
            {/* 🔹 Alert box explaining pending joke voting */}
            <Alert status="info" borderRadius="md" mb={4}>
                <AlertIcon />
                You can vote for a pending joke to increase its Dadness Score. If a joke gets enough votes, it will be minted as an NFT.
            </Alert>
            <Heading size="md" mb={4}>
                Pending Jokes ({Number(totalPendingSupply) || 0})
            </Heading>
            <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                {Number(totalPendingSupply) === 0 ? (
                    <Text>No pending jokes for approval.</Text>
                ) : (
                    jokes?.map((joke) => (
                        <Card key={joke.tokenId}>
                            <CardBody>
                                <Heading size="sm" mb={2}>
                                    {joke.pendingJoke.name} (Joke #{Number(joke.tokenId)})
                                </Heading>
                                <Text fontSize="lg" mb={3}>
                                    {joke.pendingJoke.content}
                                </Text>
                                <Badge colorScheme="gray">Pending Approval</Badge>
                                <Text mt={2} fontSize="sm" color="gray.500">
                                    Value: 0 ETH
                                </Text>
                                <Text mt={2} fontSize="sm" color="gray.500">
                                    Dadness Score: {Number(joke.pendingJoke.dadnessScore)}
                                </Text>

                                {joke.pendingJoke.author === userAddress ? (
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
                                        onClick={() => voteOnDadness(Number(joke.tokenId))}
                                        isDisabled={userVotes[Number(joke.tokenId)]}
                                    >
                                        {userVotes[Number(joke.tokenId)] ? 'Voted' : 'Vote for Dadness'}

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

