import {
	Box,
	Button,
	Flex,
	FormControl,
	FormLabel,
	Input,
	NumberInput,
	NumberInputField,
	Select,
	Textarea,
	useToast,
	VStack
} from '@chakra-ui/react'
import { useState } from 'react'
import { parseEther } from 'viem'
import { useWriteContract } from 'wagmi'
import { JOKE_NFT_ABI, JOKE_NFT_ADDRESS } from '../config/contract'

export function MintJokeForm() {
	const [content, setContent] = useState('')
	const [jokeType, setJokeType] = useState('0')
	const [value, setValue] = useState('0.0001')
	const [file, setFile] = useState<File | null>(null) // New state for file
	const toast = useToast()

	const { writeContract, isError, error, isPending } = useWriteContract()
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0])
		}
	}
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		console.log('Submitting:', { content, jokeType, value })
		if (!file) {
			toast({
				title: 'No file selected',
				description: 'Please select a file to upload.',
				status: 'error',
				duration: 5000,
			})
			return
		}
		try {
			const formData = new FormData()
			formData.append('file', file)
			let ipfsHash;
			try {
				const response = await fetch('http://localhost:5001/api/v0/add', {
					method: 'POST',
					body: formData,
				})
				const data = await response.json()
				ipfsHash = data.Hash

				
			} catch (err) {
				console.error('Error:', err)
				toast({
					title: 'Error',
					description: 'Failed to upload file to IPFS',
				})
			}

			

			await writeContract({
				address: JOKE_NFT_ADDRESS,
				abi: JOKE_NFT_ABI,
				functionName: 'mintJoke',
				args: [content, Number(jokeType), parseEther(value), ipfsHash],
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
		<Flex
			height="100%"
			width="100%"
			alignItems="center"
			justifyContent="center"
			p={4}
		>
			<Box p={16} borderWidth={1} borderRadius={8} boxShadow="md" alignItems="center" >
			<Box fontSize="2xl" fontWeight="bold" m={6} alignItems="center">Create a Joke for Vote </Box>
			<form className='mt-8' onSubmit={handleSubmit}>
				<VStack spacing={4}>
					<FormControl>
						<FormLabel>Joke Content</FormLabel>
						<Textarea
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
							
							
						</Select>
					</FormControl>

					<FormControl>
						<FormLabel>Value (ETH)</FormLabel>
						<NumberInput
							value={value}
							onChange={(valueString) => setValue(valueString)}
							min={0.0001}
							max={0.0001}
						>
							<NumberInputField />
						</NumberInput>
					</FormControl>
					<FormControl>
						<FormLabel>Upload File</FormLabel>
						<Input
							type="file"
							onChange={handleFileChange}
						/>
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
		
		</Flex>
			
		
	)
}
