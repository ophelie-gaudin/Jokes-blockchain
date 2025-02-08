import { Card, CardBody } from '@chakra-ui/react'
import { useReadContract } from 'react-moralis'
import { Joke } from '../types'

export function JokeCard({ joke }: { joke: Joke }) {
	const { data: currentOwner } = useReadContract({
		address: JOKE_NFT_ADDRESS,
		abi: JOKE_NFT_ABI,
		functionName: 'ownerOf',
		args: [BigInt(joke.id)],
	})

	return (
		<Card key={joke.id}>
			<CardBody>{/* ... contenu de la carte ... */}</CardBody>
		</Card>
	)
}
