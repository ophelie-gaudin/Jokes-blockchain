import {
	Badge,
	Box,
	Card,
	CardBody,
	Heading,
	SimpleGrid,
	Text,
} from '@chakra-ui/react'
import { formatEther } from 'ethers'
import { useEffect, useState } from 'react'
import { readContract } from 'viem/actions'
import { useReadContract, useWatchContractEvent } from 'wagmi'
import { JOKE_NFT_ABI, JOKE_NFT_ADDRESS } from '../config/contract'
import { publicClient } from '../config/wagmi'

interface Joke {
	id: number
	content: string
	jokeType: number
	value: bigint
}

export function JokeList() {
	const [jokes, setJokes] = useState<Joke[]>([])

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
				{jokes?.length === 0 ? (
					<Text>
						No jokes minted yet. Be the first to create one!
					</Text>

				) : (
					jokes?.map((joke) => (
						<Card key={joke?.id}>
							<CardBody>
								<Heading size="sm" mb={2}>
									Joke #{joke?.id}

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
										][joke?.jokeType]
									}
								</Badge>
								<Text mt={2} fontSize="sm" color="gray.500">
									Value: {formatEther(joke?.value)} ETH
								</Text>
							</CardBody>
						</Card>
					))
				)}
			</SimpleGrid>
		</Box>
	)
}
