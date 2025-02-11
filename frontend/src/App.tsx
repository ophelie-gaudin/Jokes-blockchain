import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import './App.css'
import { Footer } from './components/footer'
import { Header } from './components/header'
import { Home } from './components/home'
import { JokeList } from './components/JokeList'
import { Marketplace } from './components/Marketplace'
import { MintJokeForm } from './components/MintJokeForm'
import { config } from './config/wagmi'
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
									<Route path="/create" element={<MintJokeForm />} />
									<Route path="/vote" element={<JokeList />} />
									<Route path="/market" element={<Marketplace />} />
									
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
