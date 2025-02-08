import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Input,
	Select,
	NumberInput,
	NumberInputField,
	VStack,
	useToast,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
	Link,
	Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useWriteContract, useReadContract, useAccount } from 'wagmi'
import { JOKE_NFT_ADDRESS, JOKE_NFT_ABI } from '../config/contract'
import { parseEther } from 'viem'

export function MintJokeForm() {
	const [content, setContent] = useState('')
	const [jokeType, setJokeType] = useState('0')
	const [value, setValue] = useState('0.1')
	const toast = useToast()
	const { address } = useAccount()

	const { writeContract, isError, error, isPending } = useWriteContract()
	const { data: userJokeCount } = useReadContract({
		address: JOKE_NFT_ADDRESS,
		abi: JOKE_NFT_ABI,
		functionName: 'userJokeCount',
		args: address ? [address] : undefined,
	})

	const remainingJokes = 4 - Number(userJokeCount || 0)

	if (Number(userJokeCount || 0) >= 4) {
		return (
			<Alert
				status="info"
				variant="subtle"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				textAlign="center"
				height="200px"
				borderRadius="lg"
				bg="blue.50"
			>
				<AlertIcon boxSize="40px" mr={0} />
				<AlertTitle mt={4} mb={1} fontSize="lg">
					Maximum Jokes Reached!
				</AlertTitle>
				<AlertDescription maxWidth="sm">
					You've created your maximum of 4 dad jokes. Time to trade
					them with other jokesters!
					<Link color="blue.500" href="/trade" mt={2} display="block">
						Go to Trading Page
					</Link>
				</AlertDescription>
			</Alert>
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		console.log('Submitting:', { content, jokeType, value })

		try {
			await writeContract({
				address: JOKE_NFT_ADDRESS,
				abi: JOKE_NFT_ABI,
				functionName: 'mintJoke',
				args: [content, Number(jokeType), parseEther(value), 'QmHash'],
			})

			toast({
				title: 'Transaction sent!',
				description: 'Your joke is being minted...',
				status: 'success',
				duration: 5000,
			})
		} catch (err) {
			console.error('Error:', err)
			toast({
				title: 'Error',
				description:
					err instanceof Error ? err.message : 'Failed to mint joke',
				status: 'error',
				duration: 5000,
			})
		}
	}

	return (
		<Box p={4}>
			<Alert status="warning" mb={4} borderRadius="md">
				<AlertIcon />
				<Box>
					<AlertTitle>Choose Wisely!</AlertTitle>
					<AlertDescription>
						You can only create 4 dad jokes in total. You have{' '}
						{remainingJokes}{' '}
						{remainingJokes === 1 ? 'joke' : 'jokes'} remaining.
						Make them count - the funnier and more original they
						are, the better they'll trade!
					</AlertDescription>
				</Box>
			</Alert>

			<form onSubmit={handleSubmit}>
				<VStack spacing={4}>
					<FormControl>
						<FormLabel>Joke Content</FormLabel>
						<Input
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Enter your dad joke..."
						/>
					</FormControl>

					<FormControl>
						<FormLabel>Joke Type</FormLabel>
						<Select
							value={jokeType}
							onChange={(e) => setJokeType(e.target.value)}
						>
							<option value="0">BASIC</option>
							<option value="1">GROAN</option>
							<option value="2">CRINGE</option>
							<option value="3">LEGENDARY</option>
						</Select>
					</FormControl>

					<FormControl>
						<FormLabel>Value (ETH)</FormLabel>
						<NumberInput
							value={value}
							onChange={(valueString) => setValue(valueString)}
							min={0.1}
							step={0.1}
						>
							<NumberInputField />
						</NumberInput>
					</FormControl>

					<Text fontSize="sm" color="blue.600" fontWeight="bold">
						🎭 {remainingJokes}{' '}
						{remainingJokes === 1 ? 'joke' : 'jokes'} remaining to
						create
					</Text>

					<Button
						type="submit"
						colorScheme="blue"
						isLoading={isPending}
					>
						Mint Joke ({remainingJokes} remaining)
					</Button>

					{isError && (
						<Box color="red.500">Error: {error?.message}</Box>
					)}
				</VStack>
			</form>
		</Box>
	)
}
