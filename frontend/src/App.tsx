import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import './App.css'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Home } from './components/Home'
import { JokeList } from './components/JokeList'
import { Marketplace } from './components/Marketplace'
import { MintJokeForm } from './components/MintJokeForm'
import PendingJokeList from './components/PendingJokeList'
import { config } from './config/wagmi'
import Account from './components/Account'
const queryClient = new QueryClient()

function App() {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ChakraProvider>
					<Router>
						<div className="App">
							<Header />

							<main>
								<Routes>
									<Route path="/" element={<Home />} />
									<Route
										path="/create"
										element={<MintJokeForm />}
									/>

									<Route
										path="/vote"
										element={<PendingJokeList />}
									/>
									<Route path="/buy" element={<JokeList />} />
									<Route
										path="/market"
										element={<Marketplace />}
									/>
									<Route
										path="/account"
										element={<Account />}
									/>
								</Routes>
							</main>
							<Footer />
						</div>
					</Router>
				</ChakraProvider>
			</QueryClientProvider>
		</WagmiProvider>
	)
}

export default App
