import '@nomicfoundation/hardhat-toolbox'
import { HardhatUserConfig } from 'hardhat/config'

const config: HardhatUserConfig = {
	solidity: '0.8.28',
	networks: {
		hardhat: {
			chainId: 31337,
		},

		localhost: {
			url: 'http://127.0.0.1:8545/',
			chainId: 31337,
		},
	},
}

export default config
