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
} from '@chakra-ui/react'
import { useState } from 'react'
import { useWriteContract } from 'wagmi'
import { JOKE_NFT_ADDRESS, JOKE_NFT_ABI } from '../config/contract'
import { parseEther } from 'viem'

export function MintJokeForm() {
	const [content, setContent] = useState('')
	const [jokeType, setJokeType] = useState('0')
	const [value, setValue] = useState('0.1')
	const toast = useToast()

	const { writeContract, isError, error, isPending } = useWriteContract()

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
				description: err.message || 'Failed to mint joke',
				status: 'error',
				duration: 5000,
			})
		}
	}

	return (
		<Box p={4}>
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

					<Button
						type="submit"
						colorScheme="blue"
						isLoading={isPending}
					>
						Mint Joke
					</Button>

					{isError && (
						<Box color="red.500">Error: {error?.message}</Box>
					)}
				</VStack>
			</form>
		</Box>
	)
}
