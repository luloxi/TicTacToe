import React, { useEffect, useState } from "react";
import { Address } from "../scaffold-eth";
import { Button, Flex, Grid } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { TicTacToeBoardProps } from "~~/types/TicTacToeTypes";

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({ game, isGameAccepted, movesAmount, isGameFinished }) => {
  const [position, setPosition] = useState<number>(0);
  const [board, setBoard] = useState<number[]>(Array(9).fill(0)); // Initialize an empty board

  const { data: getBoard } = useScaffoldContractRead({
    contractName: "TicTacToe",
    functionName: "getBoard",
    args: [BigInt(game.gameId)],
  });

  console.log("getBoard reads: ", getBoard);

  useEffect(() => {
    // Update the local board based on the latest data from the contract
    if (getBoard) {
      setBoard(getBoard.map(Number));
    }
  }, [getBoard]);

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
    <div key={game.gameId}>
      <Flex alignItems={"center"} justifyContent={"center"} paddingTop={3}>
        GameId: {game.gameId}
      </Flex>
      <Flex direction="row" justifyContent={"space-around"} gap={6}>
        <p>
          Player 1: <Address address={game.player1} />
        </p>
        <p>
          Player 2: <Address address={game.player2} />
        </p>
        <p>
          Each player bets: <br /> {parseFloat(ethers.formatEther(game.bet.toString())).toFixed(4)} ETH
        </p>
      </Flex>
      <Flex direction="row" justifyContent={"space-around"} gap={6}>
        <p>
          Is game accepted?: <br />
          {isGameAccepted ? (
            "Yes"
          ) : (
            <Button colorScheme={"red"} onClick={() => acceptGame()}>
              Accept game
            </Button>
          )}
        </p>
        <p>
          # of moves made: <br />
          {movesAmount}
        </p>
        <p>
          Is game finished?: <br />
          {isGameFinished ? "Yes" : "No"}
        </p>
      </Flex>

      {/* Render the Tic Tac Toe board here */}
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
      <p></p>
      <hr />
    </div>
  );
};

export default TicTacToeBoard;
