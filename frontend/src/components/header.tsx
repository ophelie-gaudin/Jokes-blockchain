import { Box, Button, HStack } from "@chakra-ui/react";

import { WalletConnect } from "./WalletConnect";

export function Header() {


  return (
    <Box as="header" width="100%" py={4} backgroundColor="gray.800" color="white">
      <HStack spacing={4} justify="center">
        <Button
          colorScheme="blackAlpha"
          variant="ghost"
          onClick={() => window.location.href='/'}
        >
          Home
        </Button>
        <Button
          colorScheme="blue"
          variant="ghost"
          onClick={() => window.location.href='create'}
        >
          Create a Joke
        </Button>
        <Button
          colorScheme="green" 
          variant="ghost"
          onClick={() => window.location.href='vote'}
        >
          Vote
        </Button>
        <Button
          colorScheme="purple"
          variant="ghost" 
          onClick={() => window.location.href='market'}
        >
          Marketplace
        </Button>
      </HStack>
      <HStack spacing={4} justify="center" mt={2}>
        
        <WalletConnect />
      </HStack>
    </Box>
  );
}




