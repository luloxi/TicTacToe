import { useEffect, useState } from "react";
import { GameAcceptedProps, GameCreatedProps, GameFinishedProps } from "../types/TicTacToeTypes";
import { Card, CardBody, Flex, Heading } from "@chakra-ui/react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import CreateChallengeBox from "~~/components/tictactoe/CreateChallengeBox";
import TicTacToeBoard from "~~/components/tictactoe/TicTacToeBoard";
import { useScaffoldContractRead, useScaffoldEventHistory, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [gameHistory, setGameHistory] = useState<GameCreatedProps[]>([]);
  const [gameAcceptedHistory, setGameAcceptedHistory] = useState<GameAcceptedProps[]>([]);
  const [gameFinishedHistory, setGameFinishedHistory] = useState<GameFinishedProps[]>([]);

  const { data: gameIdCounter } = useScaffoldContractRead({
    contractName: "TicTacToe",
    functionName: "gameIdCounter",
    args: undefined,
  });

  console.log("gameIdCounter: ", gameIdCounter);

  // Event history hooks
  const { data: GameCreatedHistory } = useScaffoldEventHistory({
    contractName: "TicTacToe",
    eventName: "GameCreated",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    blockData: false,
  });

  const { data: GameAcceptedHistory } = useScaffoldEventHistory({
    contractName: "TicTacToe",
    eventName: "GameAccepted",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    blockData: false,
  });

  const { data: GameFinishedHistory } = useScaffoldEventHistory({
    contractName: "TicTacToe",
    eventName: "GameFinished",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    blockData: false,
  });

  // useEffect for dynamic updating? (not sure if needed)
  useEffect(() => {
    const mappedHistory = GameCreatedHistory?.map(event => ({
      gameId: parseInt(event.args[0].toString()),
      player1: event.args[1],
      player2: event.args[2],
      bet: parseInt(event.args[3].toString()),
    })) as GameCreatedProps[];
    setGameHistory(mappedHistory);
  }, [GameCreatedHistory]);

  useEffect(() => {
    const mappedHistory = GameAcceptedHistory?.map(event => ({
      gameId: parseInt(event.args[0].toString()),
      player1: event.args[1],
      player2: event.args[2],
    })) as GameAcceptedProps[];
    setGameAcceptedHistory(mappedHistory);
  }, [GameAcceptedHistory]);

  useEffect(() => {
    const mappedHistory = GameFinishedHistory?.map(event => ({
      gameId: parseInt(event.args[0].toString()),
      winner: event.args[1],
      state: parseInt(event.args[2].toString()),
    })) as GameFinishedProps[];
    setGameFinishedHistory(mappedHistory);
  }, [GameFinishedHistory]);

  // Event subscription hooks
  useScaffoldEventSubscriber({
    contractName: "TicTacToe",
    eventName: "GameCreated",
    listener: (logs: any[]) => {
      setGameHistory(indexedHistory => {
        const newGameCreated: GameCreatedProps = {
          gameId: parseInt(logs[0].args[0].toString()),
          player1: logs[0].args[1],
          player2: logs[0].args[2],
          bet: parseInt(logs[0].args[3].toString()),
        };

        // Check if the game with the same gameId already exists
        const existingGame = indexedHistory.find(game => game.gameId === newGameCreated.gameId);

        // If it doesn't exist, add the new game to the history
        if (!existingGame) {
          return [newGameCreated, ...indexedHistory];
        }

        // If it exists, return the existing history without adding a duplicate
        return indexedHistory;
      });
    },
  });

  useScaffoldEventSubscriber({
    contractName: "TicTacToe",
    eventName: "GameAccepted",
    listener: (logs: any[]) => {
      setGameAcceptedHistory(indexedHistory => {
        const newGameAccepted: GameAcceptedProps = {
          gameId: parseInt(logs[0].args[0].toString()),
          player1: logs[0].args[1],
          player2: logs[0].args[2],
        };
        return [newGameAccepted, ...indexedHistory];
      });
    },
  });

  useScaffoldEventSubscriber({
    contractName: "TicTacToe",
    eventName: "GameFinished",
    listener: (logs: any[]) => {
      setGameFinishedHistory(indexedHistory => {
        const newGameFinished: GameFinishedProps = {
          gameId: parseInt(logs[0].args[0].toString()),
          winner: logs[0].args[1],
          state: parseInt(logs[0].args[2].toString()),
        };
        return [newGameFinished, ...indexedHistory];
      });
    },
  });

  const gameCards = gameHistory?.map(game => {
    const isGameAccepted = gameAcceptedHistory.some(acceptedGame => acceptedGame.gameId === game.gameId);
    const isGameFinished = gameFinishedHistory.some(finishedGame => finishedGame.gameId === game.gameId);

    return { game, isGameAccepted, isGameFinished };
  });

  return (
    <>
      <MetaHeader />
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "url('background.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            filter: "brightness(0.3)",
          }}
        />
        <Flex direction={{ base: "column", md: "row" }} justify="space-around" gap={10} align="center" marginTop={4}>
          <CreateChallengeBox />
          <Card
            direction={{ base: "column", sm: "row" }}
            width="container.sm"
            maxWidth={{ base: "container.sm", sm: "container.sm", md: "container.md" }}
            variant="solid"
            maxHeight={{ base: "container.md", sm: "container.sm", md: "720" }}
            overflow={"auto"}
            textColor={"white"}
            backgroundColor={"gray.900"}
          >
            <CardBody>
              <Heading size="xl">⭕ See your active challenges! ❌</Heading>
              <Flex direction="column" alignItems="center" justifyContent="center">
                {gameCards?.map(({ game, isGameAccepted, isGameFinished }) => (
                  <TicTacToeBoard
                    key={game.gameId}
                    game={game}
                    isGameAccepted={isGameAccepted}
                    isGameFinished={isGameFinished}
                  />
                ))}
              </Flex>
            </CardBody>
          </Card>
        </Flex>
      </div>
    </>
  );
};

export default Home;
