import React, { useEffect, useState } from "react";
import { Address } from "../scaffold-eth";
import { Box, Button, Flex, Grid } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { TicTacToeBoardProps } from "~~/types/TicTacToeTypes";

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({ game, isGameAccepted, isGameFinished }) => {
  const [position, setPosition] = useState<number>(0);
  const [board, setBoard] = useState<number[]>(Array(9).fill(0)); // Initialize an empty board

  const { data: boardFromContract } = useScaffoldContractRead({
    contractName: "TicTacToe",
    functionName: "getBoard",
    args: [BigInt(game.gameId)],
  });

  // const { data: numberOfMoves } = useScaffoldContractRead({
  //   contractName: "TicTacToe",
  //   functionName: "getNumberOfMoves",
  //   args: [BigInt(game.gameId)],
  // });

  console.log("boardFromContract: ", boardFromContract);

  useEffect(() => {
    // Update the local board based on the latest data from the contract
    if (boardFromContract) {
      setBoard(boardFromContract.map(Number));
    }
  }, [boardFromContract]);

  const { writeAsync: makeMove } = useScaffoldContractWrite({
    contractName: "TicTacToe",
    functionName: "makeMove",
    args: [BigInt(game.gameId), position],
  });

  const { writeAsync: acceptGame } = useScaffoldContractWrite({
    contractName: "TicTacToe",
    functionName: "acceptGame",
    args: [BigInt(game.gameId)],
    value: BigInt(game.bet),
  });

  const handleMakeMove = async () => {
    try {
      await makeMove();
    } catch (error) {
      console.error("Error making move:", error);
    }
  };

  return (
    <Box key={game.gameId}>
      <Flex fontSize={24} textColor={"red"} alignItems={"center"} justifyContent={"center"} paddingTop={3}>
        Game Id #
        <Box fontSize={36} textColor={"white"}>
          <strong> {game.gameId}</strong>
        </Box>
      </Flex>
      <Flex direction="row" justifyContent={"center"} textAlign={"center"} gap={6} padding={3}>
        <Address address={game.player1} /> {isGameAccepted ? "is playing against" : "has challenged"}{" "}
        <Address address={game.player2} />
      </Flex>
      {isGameAccepted ? (
        ""
      ) : (
        <Flex
          direction="row"
          alignItems={"center"}
          textAlign={"center"}
          justifyContent={"center"}
          gap={6}
          paddingBottom={3}
        >
          <Box>
            Each player bets: <br /> {parseFloat(ethers.formatEther(game.bet.toString())).toFixed(4)} ETH
          </Box>
          <Box>
            <Button colorScheme={"green"} onClick={() => acceptGame()}>
              Accept game
            </Button>
          </Box>
        </Flex>
      )}
      {isGameAccepted ? (
        <Flex
          direction="row"
          alignItems={"center"}
          textAlign={"center"}
          justifyContent={"space-around"}
          gap={6}
          paddingBottom={3}
        >
          <Box>
            Each player betted: <br /> {parseFloat(ethers.formatEther(game.bet.toString())).toFixed(4)} ETH
          </Box>

          <Box>
            Game state: <br />
            {isGameFinished ? "Finished" : "Not finished"}
          </Box>
        </Flex>
      ) : (
        ""
      )}
      {/* Render the Tic Tac Toe board here */}
      {isGameAccepted ? (
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          {board.map((cell, index) => (
            <Button
              key={index}
              size="xl"
              fontSize="4xl"
              fontWeight="bold"
              colorScheme="gray"
              width={70}
              height={70}
              disabled={cell !== 0 || !isGameAccepted || isGameFinished}
              onClick={() => {
                if (!isGameFinished) {
                  setPosition(index);
                  handleMakeMove();
                }
              }}
            >
              {cell === 1 ? "✖️" : cell === 2 ? "⭕" : ""}
            </Button>
          ))}
        </Grid>
      ) : (
        ""
      )}
    </Box>
  );
};

export default TicTacToeBoard;
