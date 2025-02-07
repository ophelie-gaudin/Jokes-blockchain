export const JOKE_NFT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

export const JOKE_NFT_ABI = [
	{
		inputs: [],
		name: 'totalSupply',
		outputs: [{ type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ type: 'uint256', name: 'tokenId' }],
		name: 'getJoke',
		outputs: [
			{ type: 'string', name: 'content' },
			{ type: 'uint8', name: 'jokeType' },
			{ type: 'uint256', name: 'value' },
			{ type: 'string', name: 'ipfsHash' },
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ type: 'string', name: 'content' },
			{ type: 'uint8', name: 'jokeType' },
			{ type: 'uint256', name: 'value' },
			{ type: 'string', name: 'ipfsHash' },
		],
		name: 'mintJoke',
		outputs: [{ type: 'uint256' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: 'tokenId', type: 'uint256' },
			{ indexed: false, name: 'content', type: 'string' },
			{ indexed: false, name: 'jokeType', type: 'uint8' },
			{ indexed: false, name: 'value', type: 'uint256' },
		],
		name: 'JokeMinted',
		type: 'event',
	},
] as const
