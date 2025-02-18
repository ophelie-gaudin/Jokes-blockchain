import { Alert, AlertIcon, Box, Button, Card, CardBody, CardHeader, Heading, Input, Stack, Text, VStack, useToast } from '@chakra-ui/react'
import { ethers, formatEther } from 'ethers'
import { useEffect, useState } from 'react'
import { readContract, } from 'viem/actions'
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract } from 'wagmi'
import { JOKE_NFT_ABI, JOKE_NFT_ADDRESS } from '../config/contract'
import { publicClient } from '../config/wagmi'

interface PendingJokeView {
	tokenId: bigint
	pendingJoke: {
		name: string
		content: string
		author: `0x${string}`
		ipfsHash: string
		dadnessScore: bigint
		createdAt: bigint
	}
}

interface ApprovedJoke {
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

function Account() {
	const [userJokes, setUserJokes] = useState<ApprovedJoke[]>([])
	const [userPendingJokes, setUserPendingJokes] = useState<PendingJokeView[]>([])
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
	const {
		data: totalPendingSupply,
		isPendingError,
		pendingError,
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

			try {
				fetchUserJokes()
			} catch (error) {
				console.error('Error loading jokes (outer):', error) // Log the error for the entire loading process
			}
		}

		loadExistingJokes()
	}, [totalSupply, isError, error])


	useEffect(() => {
		const loadExistingPendingJokes = async () => {
			if (!totalPendingSupply) {
				console.log('No total supply yet')
				return
			}

			try {
				fetchUserPendingJokes()
			} catch (error) {
				console.error('Error loading jokes (outer):', error) // Log the error for the entire loading process
			}
		}

		loadExistingPendingJokes()
	}, [totalPendingSupply, isPendingError, pendingError])

	const fetchUserJokes = async () => {
		const existingJokes: ApprovedJoke[] = [];
		const total = Number(totalSupply);


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
				});



				existingJokes.push({
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
					lastTransferAt,
					status: 'Approved',
				});

			} catch (innerError) {
				console.error(`Error fetching joke ${i}:`, innerError);
			}
		}



		const userJokes = existingJokes.filter(
			(joke) => joke.owner.toLowerCase() === userAddress?.toLowerCase()
		);

		setUserJokes(userJokes);
	};

	const fetchUserPendingJokes = async () => {

		const total = Number(totalPendingSupply)


		try {
			const pendingJokes = await readContract(publicClient, {
				address: JOKE_NFT_ADDRESS,
				abi: JOKE_NFT_ABI,
				functionName: 'getPendingJokes',

			})




			const filteredPendingJokes = pendingJokes.filter(
				(joke) => joke.pendingJoke.author.toString() === userAddress,
			)
			setUserPendingJokes(filteredPendingJokes as PendingJokeView[])


		} catch (innerError) {
			console.error(`Error fetching pending joke :`, innerError) // Log errors for each individual joke fetch
		}

	}

	// Watch for new jokes being minted
	useWatchContractEvent({
		address: JOKE_NFT_ADDRESS,
		abi: JOKE_NFT_ABI,
		eventName: 'JokeListed',
		onLogs(logs) {
			if (logs && logs[0] && 'args' in logs[0]) {
				const log = logs[0] as {
					args: {
						tokenId: bigint
						price: bigint
					}
				}

				if (log.args?.price > 0) {
					fetchUserJokes()
					fetchUserPendingJokes()
				}
			}

		},
	})

	useWatchContractEvent({
		address: JOKE_NFT_ADDRESS,
		abi: JOKE_NFT_ABI,
		eventName: 'VotingFinalized',
		onLogs(Logs) {
			if (Logs && Logs[0] && 'args' in Logs[0]) {
				const log = Logs[0] as {
					args: {
						tokenId: bigint
					}
				}
				if (log.args?.tokenId > 0) {
					fetchUserJokes()
					fetchUserPendingJokes()
				}
			}
		},
	})

	useWatchContractEvent({
		address: JOKE_NFT_ADDRESS,
		abi: JOKE_NFT_ABI,
		eventName: 'JokeBought',
		onLogs: (logs) => {

			if (logs && logs[0] && 'args' in logs[0]) {
				const log = logs[0] as {
					args: {
						tokenId: bigint;
						buyer: `0x${string}`;
						price: bigint
					}
				}

				if (log.args?.price > 0) {
					fetchUserJokes()
					fetchUserPendingJokes()
				}


			}

		},
	});


	const finalizeJoke = (tokenId: bigint) => {
		try {
			const result = writeContract({
				address: JOKE_NFT_ADDRESS,
				abi: JOKE_NFT_ABI,
				functionName: 'finalizeVoting',
				args: [tokenId],
			})

		} catch (error) {
			console.error('Error finalizing joke voting:', error)
			toast({
				title: 'Error',
				description: (error as Error).message || 'Failed to finalize joke voting',
				status: 'error',
				duration: 5000,
			})
		}
	}

	const toggleJokePrice = (index: number) => {
		setShowJokePrice(!showJokePrice)
		setJokeId(index)
	}


	const addJokePrice = (price: number) => {
		try {
			const result = writeContract({
				address: JOKE_NFT_ADDRESS,
				abi: JOKE_NFT_ABI,
				functionName: 'listJokeForSale',
				args: [BigInt(jokeId), ethers.parseUnits(price.toString(), "ether")],
			})

		} catch (error) {
			console.error('Error setting joke price:', error)
			toast({
				title: 'Error',
				description: (error as Error).message || 'Failed to set joke price',
				status: 'error',
				duration: 5000,
			})
		}

	}

	return (

		<Box p={6}>
			<Heading size="lg" mb={4}>My Dad Jokes</Heading>

			{/* Pending Jokes */}

			<VStack spacing={4}>
				<Alert status="info" borderRadius="md">
					<AlertIcon />
					You can delete a pending joke if the Dadness Score is 0 after the voting period. <br />
					If the Dadness Score is greater than 0 and the voting period is over, you can transform the pending joke into an NFT.
				</Alert>

				<Heading size="md" mb={2}>Pending Jokes</Heading>

				{isError && (
					<Box maxWidth="500px" color="red.500">Error: {error?.message.substring(0, 150)}</Box>
				)}
				<Stack spacing={4}>
					{userPendingJokes.map((joke) => (
						<Card key={`pending-${Number(joke.pendingJoke.createdAt)}`} p={4} borderWidth="1px" borderRadius="lg" shadow="md">
							<CardHeader>
								<Heading size="md">{joke.pendingJoke.name}</Heading>
							</CardHeader>
							<CardBody>
								<Text fontWeight="bold">{joke.pendingJoke.content}</Text>
								<Text>Author: {joke.pendingJoke.author}</Text>
								<Text fontWeight="bold">Dadness Score: {Number(joke.pendingJoke.dadnessScore)}</Text>
								<Text fontWeight="bold">Created: {new Date(Number(joke.pendingJoke.createdAt) * 1000).toLocaleString()}</Text>
								<Text mt={2} fontSize="sm" color="green.500">
									<a
										href={`http://localhost:8080/ipfs/${joke.pendingJoke.ipfsHash}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										metadata
									</a>
								</Text>
								<Text fontWeight="bold" color="orange.500">Status: Pending</Text>


								{Number(joke.pendingJoke.dadnessScore) === 0 ? (
									<Button colorScheme="red" onClick={() => finalizeJoke(joke.tokenId)}>Delete</Button>
								) : (
									<Button colorScheme="blue" onClick={() => finalizeJoke(joke.tokenId)}>Mint as NFT</Button>
								)}


							</CardBody>
						</Card>
					))}
				</Stack>
			</VStack>
			{/* Approved Jokes */}

			<VStack spacing={4} align="stretch" mt={6}>
				<Alert status="info" borderRadius="md">
					<AlertIcon />
					Set a price to add the joke to the marketplace.
				</Alert>
				<Heading size="md" mt={6} mb={3}>Approved Jokes</Heading>
				<Stack spacing={4}>
					{userJokes.map((joke) => (
						<Card key={`approved-${Number(joke.createdAt)}`} p={4} borderWidth="1px" borderRadius="lg" shadow="md">
							<CardHeader>
								<Heading size="md">{joke.name} #{Number(joke.tokenId)}</Heading>
							</CardHeader>
							<CardBody>
								<Text fontWeight="bold">{joke.content}</Text>
								<Text>Type: {['BASIC', 'GROAN', 'CRINGE', 'LEGENDARY'][joke.jokeType]}</Text>
								<Text fontWeight="bold">Value: {formatEther(joke.value)} ETH</Text>
								<Text fontWeight="bold">Price: {formatEther(joke.price)} ETH</Text>
								<Text>Author: {joke.author}</Text>
								<Text>Owner: {joke.owner}</Text>
								<Text fontWeight="bold">Dadness Score: {Number(joke.dadnessScore)}</Text>
								<Text fontWeight="bold">Created: {new Date(Number(joke.createdAt) * 1000).toLocaleString()}</Text>
								<Text fontWeight="bold">Last Transfer: {new Date(Number(joke.lastTransferAt) * 1000).toLocaleString() === '01/01/1970 01:00:00' ? 'Never transferred' : new Date(Number(joke.lastTransferAt) * 1000).toLocaleString()}</Text>
								<Text mt={2} fontSize="sm" color="green.500">
									<a
										href={`http://localhost:8080/ipfs/${joke?.ipfsHash}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										metadata
									</a>
								</Text>
								<Text fontWeight="bold" color="green.500">Status: {joke.status}</Text>
								<Button mt={3} colorScheme="blue" onClick={() => toggleJokePrice(Number(joke.tokenId))}>
									Set Price
								</Button>
							</CardBody>
							{showJokePrice && <JokePriceForm showJokePrice={showJokePrice} setShowJokePrice={setShowJokePrice} addJokePrice={addJokePrice} />}
						</Card>
					))}
				</Stack>
			</VStack>

		</Box>
	)
}

export default Account

interface JokePriceFormProps {
	showJokePrice: boolean;
	setShowJokePrice: (show: boolean) => void;
	addJokePrice: (price: number) => void;
}
export const JokePriceForm: React.FC<JokePriceFormProps> = ({ showJokePrice, setShowJokePrice, addJokePrice }) => {

	const [jokePrice, setJokePrice] = useState(0)
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setShowJokePrice(!showJokePrice)

		addJokePrice(jokePrice)
	}
	return (
		<Box p={6} borderWidth="1px" width="25%" margin="auto" marginBottom={10} position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" background={"white"} borderRadius="lg" shadow="md" >
			<Heading size="md" mb={3}>Set Price</Heading>

			<form onSubmit={handleSubmit}>
				<Input type="number" value={jokePrice} onChange={(e) => setJokePrice(Number(e.target.value))} />
				<Button mt={3} colorScheme="green" type="submit">Submit</Button>
			</form>
		</Box>
	)
}


