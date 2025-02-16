// import {
// 	Badge,
// 	Box,
// 	Card,
// 	CardBody,
// 	Heading,
// 	SimpleGrid,
// 	Text,
// } from '@chakra-ui/react'
// import { formatEther } from 'ethers'
// import { useEffect, useState } from 'react'
// import { readContract } from 'viem/actions'
// import { useAccount, useWatchContractEvent } from 'wagmi'
// import { JOKE_NFT_ABI, JOKE_NFT_ADDRESS } from '../config/contract'
// import { publicClient } from '../config/wagmi'
// import { useReadContract } from 'wagmi'

// interface Joke {
// 	id: number
// 	content: string
// 	author: `0x${string}`
// 	ipfsHash: string
// 	jokeType: number
// 	value: bigint
// 	dadnessScore: bigint
// 	owner: bigint
// }

// function Account() {
// 	const [userJokes, setUserJokes] = useState<Joke[]>([])
// 	const { address: userAddress } = useAccount()

// 	const {
// 		data: totalSupply,
// 		isError,
// 		error,
// 	} = useReadContract({
// 		address: JOKE_NFT_ADDRESS,
// 		abi: JOKE_NFT_ABI,
// 		functionName: 'totalSupply',
// 	})

// 	useEffect(() => {
// 		const loadExistingJokes = async () => {
// 			if (!totalSupply) {
// 				console.log('No total supply yet')
// 				return
// 			}

// 			try {
// 				fetchUserJokes()
// 			} catch (error) {
// 				console.error('Error loading jokes (outer):', error) // Log the error for the entire loading process
// 			}
// 		}

// 		loadExistingJokes()
// 	}, [totalSupply, isError, error])

// 	const fetchUserJokes = async () => {
// 		const existingJokes: Joke[] = []
// 		const total = Number(totalSupply)
// 		console.log(`Loading ${total} jokes...`)
// 		for (let i = 1; i <= total; i++) {
// 			console.log(`Fetching joke ${i}...`)
// 			try {
// 				const [
// 					content,
// 					jokeType,
// 					value,
// 					author,
// 					ipfsHash,
// 					dadnessScore,
// 					owner,
// 				] = await readContract(publicClient, {
// 					address: JOKE_NFT_ADDRESS,
// 					abi: JOKE_NFT_ABI,
// 					functionName: 'getJoke',
// 					args: [BigInt(i)],
// 				})
// 				console.log(`Joke ${i} data:`, {
// 					content,
// 					jokeType,
// 					value,
// 				})

// 				existingJokes.push({
// 					id: i,
// 					content,
// 					author,
// 					ipfsHash,
// 					jokeType: Number(jokeType),
// 					value,
// 					dadnessScore,
// 					owner,
// 				})
// 			} catch (innerError) {
// 				console.error(`Error fetching joke ${i}:`, innerError) // Log errors for each individual joke fetch
// 			}
// 		}
// 		console.log('Setting jokes:', existingJokes)
// 		console.log('User address:', userAddress)

// 		const userJokes = existingJokes.filter(
// 			(joke) => joke.owner.toString() === userAddress,
// 		)
// 		setUserJokes(userJokes)
// 	}

// 	// Watch for new jokes being minted
// 	useWatchContractEvent({
// 		address: JOKE_NFT_ADDRESS,
// 		abi: JOKE_NFT_ABI,
// 		eventName: 'JokeMinted',
// 		onLogs() {
// 			console.log('New joke minted, refreshing list')
// 			fetchUserJokes()
// 		},
// 	})

// 	// Watch for votes as well (keep your existing DadnessVoted watcher)
// 	useWatchContractEvent({
// 		address: JOKE_NFT_ADDRESS,
// 		abi: JOKE_NFT_ABI,
// 		eventName: 'DadnessVoted',
// 		onLogs() {
// 			console.log('Joke voted, refreshing list')
// 			fetchUserJokes()
// 		},
// 	})

// 	return (
// 		<Box p={4}>
// 			<Heading size="md" mb={4}>
// 				My Jokes ({userJokes?.length || 0})
// 			</Heading>
// 			<SimpleGrid columns={[1, 2, 3]} spacing={4}>
// 				{userJokes?.length === 0 ? (
// 					<Text>You haven't created any jokes yet.</Text>
// 				) : (
// 					userJokes?.map((joke) => (
// 						<Card key={joke?.id}>
// 							<CardBody>
// 								<Heading size="sm" mb={2}>
// 									Joke #{joke?.id}
// 								</Heading>
// 								<Text fontSize="lg" mb={3}>
// 									{joke?.content}
// 								</Text>
// 								<Badge
// 									colorScheme={
// 										joke?.jokeType === 0
// 											? 'gray'
// 											: joke?.jokeType === 1
// 											? 'blue'
// 											: joke?.jokeType === 2
// 											? 'purple'
// 											: 'gold'
// 									}
// 								>
// 									{
// 										[
// 											'BASIC',
// 											'GROAN',
// 											'CRINGE',
// 											'LEGENDARY',
// 										][joke?.jokeType]
// 									}
// 								</Badge>
// 								<Text mt={2} fontSize="sm" color="gray.500">
// 									Value: {formatEther(joke?.value)} ETH
// 								</Text>
// 								<Text mt={2} fontSize="sm" color="gray.500">
// 									Votes number: {Number(joke?.dadnessScore)}
// 								</Text>
// 								<Text mt={2} fontSize="sm" color="green.500">
// 									<a
// 										href={`http://localhost:8080/ipfs/${joke?.ipfsHash}`}
// 										target="_blank"
// 										rel="noopener noreferrer"
// 									>
// 										metadata
// 									</a>
// 								</Text>
// 							</CardBody>
// 						</Card>
// 					))
// 				)}
// 			</SimpleGrid>
// 		</Box>
// 	)
// }

// export default Account

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { JOKE_NFT_ABI, JOKE_NFT_ADDRESS } from '../config/contract'
import { formatEther } from 'ethers'

interface PendingJoke {
	id: number
	name: string
	content: string
	author: string
	ipfsHash: string
	dadnessScore: bigint
	createdAt: bigint
	status: string
	owner: string
}

interface ApprovedJoke {
	id: number
	content: string
	jokeType: number
	value: string
	author: string
	ipfsHash: string
	dadnessScore: string
	createdAt: string
	lastTransferAt: string
	status: string
	owner: string
}

function JokesList() {
	const [approvedJokes, setApprovedJokes] = useState<ApprovedJoke[]>([])
	const [pendingJokes, setPendingJokes] = useState<PendingJoke[]>([])
	const contractAddress = JOKE_NFT_ADDRESS

	const getAllJokes = async () => {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum)
			const contract = new ethers.Contract(
				contractAddress,

				JOKE_NFT_ABI,
				provider,
			)

			// Get approved jokes
			const totalApproved = await contract.totalSupply()
			const approvedJokesPromises = []
			for (let i = 1; i <= totalApproved; i++) {
				approvedJokesPromises.push(contract.getJoke(i))
			}

			const approvedJokesData = await Promise.all(approvedJokesPromises)
			const formattedApprovedJokes = approvedJokesData.map(
				(joke, index) => ({
					id: index + 1,
					content: joke[0],
					jokeType: joke[1],
					value: formatEther(joke[2]),
					author: joke[3],
					ipfsHash: joke[4],
					dadnessScore: joke[5].toString(),
					createdAt: new Date(
						joke[6].toNumber() * 1000,
					).toLocaleString(),
					lastTransferAt:
						joke[7].toNumber() > 0
							? new Date(
									joke[7].toNumber() * 1000,
							  ).toLocaleString()
							: 'Never transferred',
					status: 'Approved',
				}),
			)

			// Get pending jokes
			const pendingJokesData = await contract.getPendingJokes()
			const formattedPendingJokes = pendingJokesData.map(
				(joke: PendingJoke, index: number) => ({
					id: index + 1,
					name: joke.name,
					content: joke.content,
					author: joke.author,
					owner: joke.owner,
					ipfsHash: joke.ipfsHash,
					dadnessScore: joke.dadnessScore.toString(),
					createdAt: new Date(
						Number(joke.createdAt) * 1000,
					).toLocaleString(),
					status: 'Pending',
				}),
			)

			setApprovedJokes(formattedApprovedJokes)
			setPendingJokes(formattedPendingJokes)
		} catch (error) {
			console.error('Error fetching jokes:', error)
		}
	}

	useEffect(() => {
		getAllJokes()
	}, [])

	return (
		<div>
			<h2>All Dad Jokes</h2>

			<h3>Pending Jokes</h3>
			{pendingJokes.map((joke) => (
				<div key={`pending-${joke.id}`}>
					<h4>{joke.name}</h4>
					<p>{joke.content}</p>
					<p>Author: {joke.author}</p>
					<p>Owner: {joke.owner}</p>
					<p>Dadness Score: {joke.dadnessScore}</p>
					<p>Created: {joke.createdAt}</p>
					<p>Status: {joke.status}</p>
				</div>
			))}

			<h3>Approved Jokes</h3>
			{approvedJokes.map((joke) => (
				<div key={`approved-${joke.id}`}>
					<h4>Joke #{joke.id}</h4>
					<p>{joke.content}</p>
					<p>
						Type:{' '}
						{
							['BASIC', 'GROAN', 'CRINGE', 'LEGENDARY'][
								joke.jokeType
							]
						}
					</p>
					<p>Value: {joke.value} ETH</p>
					<p>Author: {joke.author}</p>
					<p>Owner: {joke.owner}</p>
					<p>Dadness Score: {joke.dadnessScore}</p>
					<p>Created: {joke.createdAt}</p>
					<p>Last Transfer: {joke.lastTransferAt}</p>
					<p>Status: {joke.status}</p>
				</div>
			))}
		</div>
	)
}

export default JokesList
