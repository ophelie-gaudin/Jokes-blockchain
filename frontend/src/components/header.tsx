import { Box, Button, HStack, Image } from "@chakra-ui/react";

import laughing from '../assets/laughing.jpg';
import { WalletConnect } from "./WalletConnect";
export function Header() {


  return (
    <Box as="header" width="100%" py={4} backgroundColor="gray.800" color="white">
      <HStack spacing={4} justify="center">
        <HStack spacing={4} alignItems="center">
          <Image src={laughing} alt="Laughing" width="40px" height="40px" backgroundBlendMode="color-burn" />
          <Button
            colorScheme="blackAlpha"
            variant="ghost"
            onClick={() => window.location.href = '/'}
          >
            DADJOKE
          </Button>
        </HStack>
        <Button
          colorScheme="blue"
          variant="ghost"
          onClick={() => window.location.href = 'create'}
        >
          Create a Joke
        </Button>
        <Button
          colorScheme="green"
          variant="ghost"
          onClick={() => window.location.href = 'vote'}
        >
          Vote to create a nft
        </Button>
        <Button
          colorScheme="green"
          variant="ghost"
          onClick={() => window.location.href = 'buy'}
        >
          Buy access
        </Button>
        <Button
          colorScheme="purple"
          variant="ghost"
          onClick={() => window.location.href = 'market'}
        >
          Marketplace
        </Button>
        <Button
          colorScheme="purple"
          variant="ghost"
          onClick={() => window.location.href = 'account'}
        >
          Account
        </Button>
      </HStack>
      <HStack spacing={4} justify="center" mt={2}>

        <WalletConnect />
      </HStack>
    </Box>
  );
}




