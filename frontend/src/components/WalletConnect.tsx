import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <HStack gap={4}>
        <Text fontWeight="bold" color="teal.500">Connected to {address?.slice(0, 6)}...{address?.slice(-4)}</Text>
        <Button colorScheme="red" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </HStack>
    );
  }

  return (
    <VStack gap={4}>
      <Text fontWeight="bold" color="blue.500">Connect your wallet to start using DadJokeDAO</Text>
      <Button colorScheme="blue" onClick={() => connect({ connector: injected() })}>
        Connect Wallet
      </Button>
    </VStack>
  );
}