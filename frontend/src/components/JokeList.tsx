import {
	Badge,
	Box,
	Button,
	Card,
	CardBody,
	Heading,
	SimpleGrid,
	Text
} from '@chakra-ui/react';
import { formatEther } from 'ethers';
import { useEffect, useState } from 'react';
import { readContract } from 'viem/actions';
import {
	useAccount,
	useReadContract,
	useWatchContractEvent,
	useWriteContract,
} from 'wagmi';
import { JOKE_NFT_ABI, JOKE_NFT_ADDRESS } from '../config/contract';
import { publicClient } from '../config/wagmi';

interface Joke {
	id: bigint
	name: string
	content: string
	author: `0x${string}`
	owner: `0x${string}`
	ipfsHash: string
	jokeType: number
	value: bigint
	dadnessScore: bigint
}

export function JokeList() {
	const [jokes, setJokes] = useState<Joke[]>([])
	const [userVotes, setUserVotes] = useState<{ [key: number]: boolean }>({})
	const { address: userAddress } = useAccount()
	const { writeContract } = useWriteContract()

	const {
		data: totalSupply,
		isError,
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
				updateJokes()
			} catch (error) {
				console.error('Error loading jokes (outer):', error) // Log the error for the entire loading process
			}
		}

		loadExistingJokes()
	}, [totalSupply, isError, error])



	const fetchUserVotes = async () => {
		if (!userAddress || jokes.length === 0) return

		const votePromises = jokes.map(async (joke) => {
			const tokenId = joke.id // Token ID 
			const hasVoted = await readContract(publicClient, {
				address: JOKE_NFT_ADDRESS,
				abi: JOKE_NFT_ABI,
				functionName: 'hasVoted',
				args: [tokenId, userAddress], // Fetch vote status for each joke
			})

			
			return { tokenId, hasVoted }
		})

		const results = await Promise.all(votePromises)

		// Update state with the fetched vote statuses
		setUserVotes(
			results.reduce((acc, { tokenId, hasVoted }) => {
				acc[Number(tokenId)] = hasVoted
				return acc
			}, {} as { [key: number]: boolean }),
		)
	}

	const updateJokes = async () => {
		const existingJokes: Joke[] = []
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
				] = await readContract(publicClient, {
					address: JOKE_NFT_ADDRESS,
					abi: JOKE_NFT_ABI,
					functionName: 'getJoke',
					args: [BigInt(i)],
				})


				existingJokes.push({
					id: tokenId,
					name: name,
					content: content,
					author: author.toString() as `0x${string}`,
					ipfsHash: ipfsHash.toString(),
					jokeType: jokeType,
					value: value,
					dadnessScore: BigInt(dadnessScore),
					owner: owner as `0x${string}`,
				})
			} catch (innerError) {
				console.error(`Error fetching joke ${i}:`, innerError) // Log errors for each individual joke fetch
			}
		}

		setJokes(existingJokes)
	}

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
				
				fetchUserVotes()
				updateJokes()

			}
		},
	})

	const voteOnNft = async (tokenId: bigint, jokeValue: bigint) => {
		writeContract({
			address: JOKE_NFT_ADDRESS,
			abi: JOKE_NFT_ABI,
			functionName: 'voteOnNft',
			args: [tokenId],
			value: jokeValue,
		})
		updateJokes()
	}
	return (
		<Box p={4}>
			<Heading size="md" mb={4}>
				All Jokes ({totalSupply ? Number(totalSupply) : 0})
			</Heading>
			<SimpleGrid columns={[1, 2, 3]} spacing={4}>
				{jokes?.length === 0 ? (
					<Text>
						No jokes minted yet. Be the first to create one!
					</Text>
				) : (
					jokes?.map((joke, index) => (
						<Card key={joke?.id}>
							<CardBody>
								<Heading size="sm" mb={2}>
									{joke.name} #{Number(joke?.id)}
								</Heading>
								<Text fontSize="lg" mb={3}>
									{joke?.content}
								</Text>
								<Badge
									colorScheme={
										joke?.jokeType === 0
											? 'gray'
											: joke?.jokeType === 1
												? 'blue'
												: joke?.jokeType === 2
													? 'purple'
													: 'gold'
									}
								>
									{
										[
											'BASIC',
											'GROAN',
											'CRINGE',
											'LEGENDARY',
										][Number(joke?.jokeType)]
									}
								</Badge>
								<Text mt={2} fontSize="sm" color="gray.500">
									Value: {formatEther(joke?.value)} ETH
								</Text>
								<Text mt={2} fontSize="sm" color="gray.500">
									Votes number: {Number(joke?.dadnessScore)}
								</Text>
								<Text mt={2} fontSize="sm" color="green.500">
									<a
										href={`http://localhost:8080/ipfs/${joke?.ipfsHash}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										metadata
									</a>
								</Text>

								{joke.owner === userAddress ? (
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
										onClick={() => voteOnNft(joke.id, joke.value)}
										isDisabled={userVotes[Number(joke.id)]}
									>
										{userVotes[Number(joke.id)]
											? 'You can use this joke'
											: 'Vote to use this joke'}
									</Button>
								)}
							</CardBody>
						</Card>
					))
				)}
			</SimpleGrid>
		</Box>
	)
}
