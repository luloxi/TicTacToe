import React, { useEffect, useState } from "react";
import { Address } from "../scaffold-eth";
import { Button, Flex, Grid } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { MoveMadeProps, TicTacToeBoardProps } from "~~/types/TicTacToeTypes";

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({
  game,
  isGameAccepted,
  movesList,
  movesAmount,
  isGameFinished,
}) => {
  const [position, setPosition] = useState<number>(0);
  const [betPayment, setBetPayment] = useState<number>(game.bet);
  const [board, setBoard] = useState<number[]>(Array(9).fill(0)); // Initialize an empty board

  console.log("Moves list for game ID #", game.gameId, ": ", movesList);

  const { writeAsync: makeMove } = useScaffoldContractWrite({
    contractName: "TicTacToe",
    functionName: "makeMove",
    args: [BigInt(game.gameId), position],
    value: BigInt(betPayment),
  });

  useEffect(() => {
    // Update the board based on the movesList
    const updatedBoard = Array(9).fill(0);

    movesList.forEach((move: MoveMadeProps) => {
      const currentPlayerSymbol = move.player === game.player1 ? 1 : 2;
      updatedBoard[move.position] = currentPlayerSymbol;
    });

    setBoard(updatedBoard);
  }, [movesList]);

  const handleMakeMove = async () => {
    try {
      if (movesAmount > 0) {
        setBetPayment(0);
      }
      await makeMove();

      // Update the local board based on the latest move
      const currentPlayerSymbol = movesAmount % 2 === 0 ? 1 : 2;
      const updatedBoard = [...board];
      updatedBoard[position] = currentPlayerSymbol;
      setBoard(updatedBoard);
    } catch (error) {
      console.error("Error making move:", error);
      // Handle error as needed
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
          Bet: <br /> {parseFloat(ethers.formatEther(game.bet.toString())).toFixed(4)} ETH
        </p>
      </Flex>
      <Flex direction="row" justifyContent={"space-around"} gap={6}>
        <p>
          Is game accepted?: <br />
          {isGameAccepted ? "Yes" : "No"}
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
