import React, { useEffect, useState } from "react";
import { Address } from "../scaffold-eth";
import { Box, Button, Flex, Grid } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { TicTacToeBoardProps } from "~~/types/TicTacToeTypes";

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({
  game,
  isGameAccepted,
  isGameFinished,
  isGameDeleted,
  currentPlayer,
  // movesMade,
}) => {
  const [board, setBoard] = useState<number[]>(Array(9).fill(0)); // Initialize an empty board
  // const [timeRemaining, setTimeRemaining] = useState<string>("");

  const { data: boardFromContract } = useScaffoldContractRead({
    contractName: "TicTacToe",
    functionName: "getBoard",
    args: [BigInt(game.gameId)],
  });

  useEffect(() => {
    if (boardFromContract) {
      setBoard(boardFromContract.map(Number));
    }
  }, [boardFromContract]);

  const { data: gameState } = useScaffoldContractRead({
    contractName: "TicTacToe",
    functionName: "getGameState",
    args: [BigInt(game.gameId)],
  });

  const { data: player1WithdrawnPrize } = useScaffoldContractRead({
    contractName: "TicTacToe",
    functionName: "hasPlayer1WithdrawnPrize",
    args: [BigInt(game.gameId)],
  });

  const { data: player2WithdrawnPrize } = useScaffoldContractRead({
    contractName: "TicTacToe",
    functionName: "hasPlayer2WithdrawnPrize",
    args: [BigInt(game.gameId)],
  });

  // const { data: lastTimePlayed } = useScaffoldContractRead({
  //   contractName: "TicTacToe",
  //   functionName: "getLastTimePlayed",
  //   args: [BigInt(game.gameId)],
  // });

  // useEffect(() => {
  //   let deadline: number;

  //   if (lastTimePlayed) {
  //     deadline = parseInt(lastTimePlayed.toString(), 10);
  //   }

  //   const timer = setInterval(() => {
  //     const now = Math.floor(new Date().getTime() / 1000);

  //     if (now >= deadline) {
  //       setTimeRemaining("Deadline has passed");
  //       clearInterval(timer);
  //     } else {
  //       const timeRemainingSeconds = deadline - now;
  //       const hours = Math.floor(timeRemainingSeconds / 3600);
  //       const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
  //       const seconds = Math.floor(timeRemainingSeconds % 60);
  //       setTimeRemaining(`${hours}:${minutes}:${seconds}`);
  //     }
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, [lastTimePlayed]);

  const { writeAsync: makeMove } = useScaffoldContractWrite({
    contractName: "TicTacToe",
    functionName: "makeMove",
    args: [BigInt(game.gameId), 0],
  });

  const { writeAsync: acceptGame } = useScaffoldContractWrite({
    contractName: "TicTacToe",
    functionName: "acceptGame",
    args: [BigInt(game.gameId)],
    value: BigInt(game.bet),
  });

  const { writeAsync: deleteGame } = useScaffoldContractWrite({
    contractName: "TicTacToe",
    functionName: "deleteGame",
    args: [BigInt(game.gameId)],
  });

  // const { writeAsync: winByTimeout } = useScaffoldContractWrite({
  //   contractName: "TicTacToe",
  //   functionName: "winByTimeout",
  //   args: [BigInt(game.gameId)],
  // });

  const { writeAsync: withdrawPrize } = useScaffoldContractWrite({
    contractName: "TicTacToe",
    functionName: "withdrawPrize",
    args: [BigInt(game.gameId)],
  });

  return (
    <Box key={game.gameId} marginY={6}>
      <Flex fontSize={24} textColor={"red"} alignItems={"center"} justifyContent={"center"} paddingTop={3}>
        Game Id #
        <Box fontSize={36} textColor={"white"}>
          <strong> {game.gameId}</strong>
        </Box>
      </Flex>
      <Flex direction="row" justifyContent={"center"} textAlign={"center"} gap={6} padding={3}>
        <Address address={game.player1} />{" "}
        {isGameAccepted ? (isGameFinished ? "played against" : "is playing against") : "challenged"}
        <Address address={game.player2} />
      </Flex>
      {/* {isGameAccepted ? (
        <Box alignItems={"center"} textAlign={"center"} justifyContent={"center"} textColor={"red"}>
          {timeRemaining}
        </Box>
      ) : (
        ""
      )} */}
      {isGameAccepted ? (
        ""
      ) : isGameDeleted ? (
        <Box alignItems={"center"} textAlign={"center"} justifyContent={"center"} textColor={"red"}>
          Game was deleted
        </Box>
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
            Each player bets: <br />{" "}
            <strong>{parseFloat(ethers.formatEther(game.bet.toString())).toFixed(4)} ETH</strong>
          </Box>
          <Box>
            {game.player2 === currentPlayer ? (
              <Button colorScheme={"green"} onClick={() => acceptGame()}>
                Accept game
              </Button>
            ) : game.player1 === currentPlayer ? (
              <>
                <Button colorScheme={"red"} onClick={() => deleteGame()}>
                  Delete game
                </Button>
                <Box>Recover your betted amount (if any)</Box>
              </>
            ) : (
              ""
            )}
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
            Each player betted: <br />{" "}
            <strong>{parseFloat(ethers.formatEther(game.bet.toString())).toFixed(4)} ETH</strong>
          </Box>

          <Box>
            {isGameFinished ? (
              <strong>
                Game has finished
                <br />
                {(gameState == 2 && currentPlayer == game.player1 && !player1WithdrawnPrize) ||
                (gameState == 3 && currentPlayer == game.player2 && !player2WithdrawnPrize) ||
                (gameState == 4 && currentPlayer == game.player1 && !player1WithdrawnPrize) ||
                (gameState == 4 && currentPlayer == game.player2 && !player2WithdrawnPrize) ? (
                  <Button colorScheme={"green"} onClick={() => withdrawPrize()}>
                    Withdraw Prize
                  </Button>
                ) : (
                  ""
                )}
              </strong>
            ) : currentPlayer == game.player1 ? (
              <strong>You&apos;re player ❌</strong>
            ) : currentPlayer == game.player2 ? (
              <strong>You&apos;re player ⭕</strong>
            ) : (
              <strong>Game in progress</strong>
            )}
          </Box>
        </Flex>
      ) : (
        ""
      )}
      {/* Render the Tic Tac Toe board here */}
      {isGameAccepted ? (
        <Grid templateColumns="repeat(3, 1fr)" justifyItems={"center"} marginX="7rem" gap={3}>
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
                makeMove({ args: [BigInt(game.gameId), index] });
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
