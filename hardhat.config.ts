import '@nomicfoundation/hardhat-toolbox'
import { HardhatUserConfig } from 'hardhat/config'

const config: HardhatUserConfig = {
	solidity: {
		version: "0.8.20",
		settings: {
			viaIR: true,
			optimizer: {
				enabled: true,
				runs: 200
			}
		}
	},
	networks: {
		hardhat: {
			chainId: 1337,
		},

		localhost: {
			url: 'http://127.0.0.1:8545/',
			chainId: 1337,
		},
	},
}

export default config
