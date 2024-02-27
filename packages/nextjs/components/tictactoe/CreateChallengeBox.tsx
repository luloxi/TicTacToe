import React from "react";
import { useState } from "react";
import { Box, Button, Card, CardBody, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import { AddressInput, Balance, EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const CreateChallengeBox = ({}) => {
  const [player2Address, setPlayer2Address] = useState<string | undefined>("");
  const [betAmount, setBetAmount] = useState<string>("");

  const { writeAsync: createGame } = useScaffoldContractWrite({
    contractName: "TicTacToe",
    functionName: "createGame",
    args: [player2Address],
    value: betAmount ? ethers.parseEther(betAmount) : undefined,
  });

  // console.log("Bet amount: ", betAmount);

  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      maxWidth={"md"}
      overflow="hidden"
      variant="solid"
      textColor={"white"}
      marginRight={4}
      backgroundColor={"gray.900"}
      textAlign={"center"}
    >
      <Stack>
        <CardBody>
          <Heading size="xl">⭕ Play and bet on a Tic Tac Toe game! ❌</Heading>
          <Text fontWeight={"bold"} marginBottom={0}>
            ⚔️ Who do you want to challenge? ⚔️
          </Text>
          <AddressInput
            placeholder="Enter address for team 2"
            onChange={setPlayer2Address}
            value={player2Address ?? ""}
          />
          {player2Address ? (
            <Flex justifyContent={"center"} alignItems={"center"} direction={"row"} marginTop={2}>
              This address has <Balance address={player2Address} /> available to bet
            </Flex>
          ) : (
            <Box marginY={2}>Enter an address to view their Balance!</Box>
          )}
          <br />
          <Text fontWeight={"bold"} marginBottom={0} marginTop={0}>
            💰 (optional) Bet ETH on the match outcome 💰
          </Text>
          <EtherInput
            placeholder="Enter your bet amount in ETH or USD"
            onChange={newValue => {
              if (newValue) {
                setBetAmount(newValue);
              } else {
                setBetAmount("");
              }
            }}
            value={betAmount}
          />
          Your oponent will have to pay the same to accept
          <br />
          <Text fontWeight={"bold"} mt={0} mb={0}>
            Winner gets all, Tie gives back the ETH
          </Text>
          <Text>
            If a player doesn&apos;t make a move before timeout, <br />
            the opposite player can <strong>trigger an early win</strong>.
          </Text>
          <Button
            variant="solid"
            onClick={event => {
              event.preventDefault();
              createGame();
            }}
            backgroundColor={"red.500"}
            textColor={"white"}
            colorScheme="orange"
            marginTop={4}
          >
            Create challenge
          </Button>
        </CardBody>
      </Stack>
    </Card>
  );
};

export default CreateChallengeBox;
