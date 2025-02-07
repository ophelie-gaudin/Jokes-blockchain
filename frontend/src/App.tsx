import { ChakraProvider } from '@chakra-ui/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'
import { WalletConnect } from './components/WalletConnect'
import { JokeList } from './components/JokeList'
import { MintJokeForm } from './components/MintJokeForm'

const queryClient = new QueryClient()

function App() {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ChakraProvider>
					<div className="App">
						<header>
							<h1>DadJokeDAO</h1>
							<WalletConnect />
						</header>
						<main>
							<MintJokeForm />
							<JokeList />
						</main>
					</div>
				</ChakraProvider>
			</QueryClientProvider>
		</WagmiProvider>
	)
}

export default App
