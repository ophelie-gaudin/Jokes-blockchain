import { createConfig, http } from 'wagmi'
import { hardhat } from 'wagmi/chains'
import { createPublicClient, http as viemHttp } from 'viem'

export const publicClient = createPublicClient({
	chain: hardhat,
	transport: viemHttp(),
})

export const config = createConfig({
	chains: [hardhat],
	transports: {
		[hardhat.id]: http(),
	},
})
