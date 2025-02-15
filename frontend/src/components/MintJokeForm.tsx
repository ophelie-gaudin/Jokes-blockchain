import {
	Box,
	Button,
	Flex,
	FormControl,
	FormLabel,
	Input,
	Textarea,
	useToast,
	VStack
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWriteContract } from 'wagmi';

import { JOKE_NFT_ABI, JOKE_NFT_ADDRESS } from '../config/contract';
export function MintJokeForm() {
	const navigate = useNavigate();
	const [name, setName] = useState('')
	const [content, setContent] = useState('')
	const [file, setFile] = useState<File | null>(null) // New state for file
	const toast = useToast()

	const { writeContract, data, isError, error, isPending } = useWriteContract()
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0])
		}
	}
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		console.log('Submitting:', { name, content })
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
			// try {
			// 	const response = await fetch('http://localhost:5001/api/v0/add', {
			// 		method: 'POST',
			// 		body: formData,
			// 	})
			// 	const data = await response.json()
			// 	ipfsHash = data.Hash


			// } catch (err) {
			// 	console.error('Error:', err)
			// 	toast({
			// 		title: 'Error',
			// 		description: 'Failed to upload file to IPFS',
			// 	})
			// 	return
			// }



			const result = await writeContract({
				address: JOKE_NFT_ADDRESS,
				abi: JOKE_NFT_ABI,
				functionName: 'submitJoke',
				args: [name, content, "Basic"],
			})






			if (!isPending && !isError) {
				navigate('/vote')
			}

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
				description: (err as Error).message || 'Failed to mint joke',
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
			marginX="auto"
		>
			<Box p={16} borderWidth={1} borderRadius={8} boxShadow="md" alignItems="center" >
				<Box fontSize="2xl" fontWeight="bold" m={6} alignItems="center">Create a Joke for Vote </Box>
				<form className='mt-8' onSubmit={handleSubmit}>
					<VStack spacing={4}>
						<FormControl>
							<FormLabel>Joke Name</FormLabel>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter the joke name..."
							/>
						</FormControl>

						<FormControl>
							<FormLabel>Joke Content</FormLabel>
							<Textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Enter your dad joke..."
							/>
						</FormControl>

						<FormControl>
							<FormLabel>Upload File</FormLabel>
							<Input
								type="file"
								onChange={handleFileChange}
							/>
						</FormControl>

						<FormControl>
							<FormLabel>Joke Type</FormLabel>
							<Input
								value="Basic"
								isReadOnly
							/>
						</FormControl>

						<FormControl>
							<FormLabel>Initial ETH Value</FormLabel>
							<Input
								value="0 ETH"
								isReadOnly
							/>
						</FormControl>

						<Button
							type="submit"
							colorScheme="blue"
							isLoading={isPending}
						>
							Submit Joke
						</Button>

						{isError && (
							<Box maxWidth="500px" color="red.500">Error: {error?.message.substring(0, 150)}</Box>
						)}
					</VStack>
				</form>
			</Box>

		</Flex>


	)
}
