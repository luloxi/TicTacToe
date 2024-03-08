import React, { useEffect, useState } from "react";
import { Address } from "../scaffold-eth";
import { TokenAmount } from "../scaffold-eth/TokenAmount";
import { Box, Button, Flex, Grid, Text } from "@chakra-ui/react";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { TicTacToeBoardProps } from "~~/types/TicTacToeTypes";

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({
  game,
  isGameAccepted,
  isGameFinished,
  isGameDeleted,
  currentPlayer,
  movesMade,
}) => {
  const [board, setBoard] = useState<number[]>(Array(9).fill(0));
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const highestLastTimePlayedMove = movesMade?.reduce((maxMove: any, currentMove: any) => {
    if (!maxMove || currentMove.lastTimePlayed > maxMove.lastTimePlayed) {
      return currentMove;
    }
    return maxMove;
  }, null);

  const lastTimePlayed = highestLastTimePlayedMove?.args[3];
  const lastPlayerPlayed = highestLastTimePlayedMove?.args["player"] ?? game.player1;
  const isCurrentPlayerPlaying = currentPlayer === game.player1 || currentPlayer === game.player2;
  const currentTime = Math.floor(new Date().getTime() / 1000);

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

  useEffect(() => {
    let deadline: number;

    if (lastTimePlayed) {
      deadline = parseInt(lastTimePlayed.toString(), 10) + 20 * 60; // Inlcude the 20 mins of timeOutValue;
    }

    const timer = setInterval(() => {
      const now = Math.floor(new Date().getTime() / 1000);

      if (now >= deadline) {
        setTimeRemaining("Deadline has passed!");
        clearInterval(timer);
      } else if (deadline) {
        const timeRemainingSeconds = deadline - now;
        const hours = Math.floor(timeRemainingSeconds / 3600);
        const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
        const seconds = Math.floor(timeRemainingSeconds % 60);
        setTimeRemaining(`Early win by timeout in ${hours}:${minutes}:${seconds}`);
      } else {
        setTimeRemaining(`Game hasn't started yet!`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastTimePlayed]);

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

  const { writeAsync: winByTimeout } = useScaffoldContractWrite({
    contractName: "TicTacToe",
    functionName: "winByTimeout",
    args: [BigInt(game.gameId)],
  });

  const { writeAsync: withdrawPrize } = useScaffoldContractWrite({
    contractName: "TicTacToe",
    functionName: "withdrawPrize",
    args: [BigInt(game.gameId)],
  });

  return (
    <Box key={game.gameId} marginBottom={6}>
      <Flex fontSize={24} textColor={"red"} alignItems={"center"} justifyContent={"center"} paddingTop={3}>
        Game Id #
        <Box fontSize={36} textColor={"white"}>
          <strong> {game.gameId}</strong>
        </Box>
      </Flex>
      <Flex direction="row" justifyContent={"center"} textAlign={"center"} gap={6} padding={3}>
        <Box>
          <Address address={game.player1} />
          <Text marginTop={0} color="red" as="b">
            {" "}
            {"Player ⭕"} <strong>{game.player1 === currentPlayer && "(You)"}</strong>
          </Text>
        </Box>
        {isGameAccepted ? (isGameFinished ? "played against" : "is playing against") : "challenged"}
        <Box>
          <Address address={game.player2} />
          <Text marginTop={0} color="red" as="b">
            {"Player ❌"} <strong>{game.player2 === currentPlayer && "(You)"}</strong>
          </Text>
        </Box>
      </Flex>
      {isGameAccepted && !isGameFinished ? (
        <Box alignItems={"center"} textAlign={"center"} justifyContent={"center"} textColor={"red"}>
          {timeRemaining}
          {lastTimePlayed > currentTime ? (
            <>
              You can finish this game by winning by timeout
              <Button colorScheme={"orange"} onClick={() => winByTimeout()}>
                Finish game and claim prize
              </Button>
            </>
          ) : (
            ""
          )}
        </Box>
      ) : (
        ""
      )}
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
            Each player bets: <br /> <TokenAmount amount={game.bet} isEth={true} />
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
                <Box>Recover your betted amount</Box>
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
            Each player betted: <br /> <TokenAmount amount={game.bet} isEth={true} />
          </Box>

          <Box>
            {isGameFinished ? (
              <strong>
                {/* <Text color={"red"}>Game has finished!</Text> */}
                {/* <br /> */}
                {(gameState == 2 && currentPlayer == game.player1 && !player1WithdrawnPrize) ||
                (gameState == 3 && currentPlayer == game.player2 && !player2WithdrawnPrize) ||
                (gameState == 4 && currentPlayer == game.player1 && !player1WithdrawnPrize) ||
                (gameState == 4 && currentPlayer == game.player2 && !player2WithdrawnPrize) ? (
                  <Button colorScheme={"green"} onClick={() => withdrawPrize()}>
                    Withdraw Prize
                  </Button>
                ) : (
                  <Text color={"red"}>Game has finished!</Text>
                )}
              </strong>
            ) : isCurrentPlayerPlaying && lastPlayerPlayed !== currentPlayer ? (
              <strong>Your turn</strong>
            ) : isCurrentPlayerPlaying && lastPlayerPlayed === currentPlayer ? (
              <p>Waiting for the opponent</p>
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
