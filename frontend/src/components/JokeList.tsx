import {
	Box,
	SimpleGrid,
	Text,
	Heading,
	Card,
	CardBody,
	Badge,
	Icon,
	HStack,
	Button,
	useToast,
} from '@chakra-ui/react'
import {
	useWatchContractEvent,
	useReadContract,
	useWriteContract,
	useAccount,
	useReadContracts,
} from 'wagmi'
import { JOKE_NFT_ADDRESS, JOKE_NFT_ABI } from '../config/contract'
import { useState, useEffect } from 'react'
import { publicClient } from '../config/wagmi'
import { readContract } from 'viem/actions'
import { formatEther } from 'ethers'
import { FiStar, FiShoppingCart } from 'react-icons/fi'
import { FaStar } from 'react-icons/fa'
import { shortenAddress } from '../utils/utils'

interface Joke {
	id: number
	content: string
	jokeType: number
	value: bigint
	dadnessScore: number
	totalVotes: number
}

type ContractCall = {
	address: `0x${string}`
	abi: typeof JOKE_NFT_ABI
	functionName: 'ownerOf'
	args: [bigint]
}

function useJokeOwners(jokes: Joke[]) {
	const contracts: ContractCall[] = jokes.map((joke) => ({
		address: JOKE_NFT_ADDRESS as `0x${string}`,
		abi: JOKE_NFT_ABI,
		functionName: 'ownerOf',
		args: [BigInt(joke.id)],
	}))

	const { data } = useReadContracts({ contracts })

	return data?.map((result) => result.result as string)
}

export function JokeList() {
	const [jokes, setJokes] = useState<Joke[]>([])
	const owners = useJokeOwners(jokes)

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

			const total = Number(totalSupply)
			console.log(`Loading ${total} jokes...`)

			try {
				const existingJokes: Joke[] = []
				for (let i = 1; i <= total; i++) {
					console.log(`Fetching joke ${i}...`)
					try {
						const [content, jokeType, value] = await readContract(
							publicClient,
							{
								address: JOKE_NFT_ADDRESS,
								abi: JOKE_NFT_ABI,
								functionName: 'getJoke',
								args: [BigInt(i)],
							},
						)
						console.log(`Joke ${i} data:`, {
							content,
							jokeType,
							value,
						})

						existingJokes.push({
							id: i,
							content,
							jokeType: Number(jokeType),
							value,
							dadnessScore: 0,
							totalVotes: 0,
						})
					} catch (innerError) {
						console.error(`Error fetching joke ${i}:`, innerError) // Log errors for each individual joke fetch
					}
				}
				console.log('Setting jokes:', existingJokes)
				setJokes(existingJokes)
			} catch (error) {
				console.error('Error loading jokes (outer):', error) // Log the error for the entire loading process
			}
		}

		loadExistingJokes()
	}, [totalSupply, isError, error])

	// Écouter les nouvelles blagues
	useWatchContractEvent({
		address: JOKE_NFT_ADDRESS,
		abi: JOKE_NFT_ABI,
		eventName: 'JokeMinted',
		onLogs(logs) {
			console.log('New joke minted:', logs)
			if (logs && logs[0] && 'args' in logs[0]) {
				const log = logs[0] as {
					args: {
						tokenId: bigint
						content: string
						jokeType: number
						value: bigint
					}
				}
				const newJoke = {
					id: Number(log.args.tokenId),
					content: log.args.content,
					jokeType: Number(log.args.jokeType),
					value: log.args.value,
					dadnessScore: 0,
					totalVotes: 0,
				}
				setJokes((prev) => [...prev, newJoke])
			}
		},
	})

	return (
		<Box p={4}>
			<Heading size="md" mb={4}>
				All Jokes ({totalSupply ? Number(totalSupply) : 0})
			</Heading>
			<SimpleGrid columns={[1, 2, 3]} spacing={4}>
				{jokes.length === 0 ? (
					<Text>
						No jokes minted yet. Be the first to create one!
					</Text>
				) : (
					jokes.map((joke, index) => (
						<JokeCard
							key={joke.id}
							joke={joke}
							owner={owners?.[index] || ''}
						/>
					))
				)}
			</SimpleGrid>
		</Box>
	)
}

function JokeCard({ joke, owner }: { joke: Joke; owner: string }) {
	return (
		<Card key={joke.id}>
			<CardBody>
				<Heading size="sm" mb={2}>
					Joke #{joke.id}
				</Heading>
				<Text fontSize="lg" mb={3}>
					{joke.content}
				</Text>
				<Badge
					colorScheme={
						joke.jokeType === 0
							? 'gray'
							: joke.jokeType === 1
							? 'blue'
							: joke.jokeType === 2
							? 'purple'
							: 'gold'
					}
				>
					{['BASIC', 'GROAN', 'CRINGE', 'LEGENDARY'][joke.jokeType]}
				</Badge>
				<Text mt={2} fontSize="sm" color="gray.500">
					Value: {formatEther(joke.value)} ETH
				</Text>
				<VoteButton
					jokeId={joke.id}
					currentScore={75}
					totalVotes={100}
				/>
				<HStack justify="space-between" mt={3}>
					<Text>
						Owner: {owner ? shortenAddress(owner) : 'Loading...'}
					</Text>
					<BuyButton joke={joke} currentOwner={owner || ''} />
				</HStack>
			</CardBody>
		</Card>
	)
}

function VoteButton({
	jokeId,
	currentScore,
	totalVotes,
}: {
	jokeId: number
	currentScore: number
	totalVotes: number
}) {
	const [hover, setHover] = useState<number | null>(null)
	const [selectedStars, setSelectedStars] = useState<number | null>(null)
	const [hasVoted, setHasVoted] = useState(false)
	const { writeContract } = useWriteContract()
	const { address } = useAccount()

	// Vérifier si l'utilisateur a déjà voté
	const { data: userHasVoted } = useReadContract({
		address: JOKE_NFT_ADDRESS,
		abi: JOKE_NFT_ABI,
		functionName: 'hasVoted',
		args: address ? [BigInt(jokeId), address] : undefined,
	})

	useEffect(() => {
		if (userHasVoted) {
			setHasVoted(true)
			// Convertir le score 0-100 en étoiles 1-5
			setSelectedStars(Math.round(currentScore / 20))
		}
	}, [userHasVoted, currentScore])

	const handleVote = async (stars: number) => {
		if (hasVoted) return

		try {
			const score = stars * 20
			await writeContract({
				address: JOKE_NFT_ADDRESS,
				abi: JOKE_NFT_ABI,
				functionName: 'voteOnDadness',
				args: [BigInt(jokeId), BigInt(score)],
			})
			setSelectedStars(stars)
			setHasVoted(true)
		} catch (error) {
			console.error('Error voting:', error)
		}
	}

	return (
		<Box>
			<HStack spacing={1} mb={2}>
				{[1, 2, 3, 4, 5].map((star) => (
					<Icon
						key={star}
						as={
							star <= (hover || selectedStars || 0)
								? FaStar
								: FiStar
						}
						color={
							star <= (hover || selectedStars || 0)
								? 'yellow.400'
								: 'gray.300'
						}
						boxSize={6}
						cursor={hasVoted ? 'default' : 'pointer'}
						onClick={() => !hasVoted && handleVote(star)}
						onMouseEnter={() => !hasVoted && setHover(star)}
						onMouseLeave={() => !hasVoted && setHover(null)}
					/>
				))}
			</HStack>
			<Text fontSize="sm" color="gray.500">
				{hasVoted ? (
					<>
						Dad Score: {Math.round(currentScore / 20)}/5 (
						{totalVotes} votes)
						<Text as="span" ml={2} color="blue.500">
							(You voted!)
						</Text>
					</>
				) : (
					'Click stars to vote!'
				)}
			</Text>
		</Box>
	)
}

function BuyButton({
	joke,
	currentOwner,
}: {
	joke: Joke
	currentOwner: string
}) {
	const { address } = useAccount()
	const { writeContract } = useWriteContract()
	const toast = useToast()

	const handleBuy = async () => {
		try {
			await writeContract({
				address: JOKE_NFT_ADDRESS,
				abi: JOKE_NFT_ABI,
				functionName: 'buyJoke',
				args: [BigInt(joke.id)],
				value: joke.value, // Le montant en ETH à payer
			})

			toast({
				title: 'Purchase Successful!',
				description: 'You are now the proud owner of this dad joke!',
				status: 'success',
				duration: 5000,
			})
		} catch (error) {
			toast({
				title: 'Purchase Failed',
				description:
					'You might already have 4 jokes or insufficient funds.',
				status: 'error',
				duration: 5000,
			})
		}
	}

	if (currentOwner === address) {
		return <Text fontSize="sm">You own this joke</Text>
	}

	return (
		<Button
			onClick={handleBuy}
			colorScheme="green"
			size="sm"
			leftIcon={<Icon as={FiShoppingCart} />}
		>
			Buy for {formatEther(joke.value)} ETH
		</Button>
	)
}
