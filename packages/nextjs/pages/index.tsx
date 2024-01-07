import { useEffect, useState } from "react";
// import Link from "next/link";
import { NewGameProps } from "../types/TicTacToeTypes";
import { Card, CardBody, Flex, Heading } from "@chakra-ui/react";
// import { ethers } from "ethers";
import type { NextPage } from "next";
// import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth";
import CreateChallengeBox from "~~/components/tictactoe/CreateChallengeBox";
// import TicTacToeBoard from "~~/components/tictactoe/TicTacToeBoard";
import { useScaffoldEventHistory, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [gameHistory, setGameHistory] = useState<NewGameProps[]>([]);

  // Event history hooks
  const { data: GameCreatedHistory } = useScaffoldEventHistory({
    contractName: "TicTacToe",
    eventName: "GameCreated",
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
    })) as NewGameProps[];
    setGameHistory(mappedHistory);
  }, [GameCreatedHistory]);

  // Event subscription hooks
  useScaffoldEventSubscriber({
    contractName: "TicTacToe",
    eventName: "GameCreated",
    listener: (logs: any[]) => {
      setGameHistory(indexedHistory => {
        const newGameCreated: NewGameProps = {
          gameId: parseInt(logs[0].args[0].toString()),
          player1: logs[0].args[1],
          player2: logs[0].args[2],
          bet: parseInt(logs[0].args[3].toString()),
        };
        return [newGameCreated, ...indexedHistory];
      });
    },
  });

  const gameCards = gameHistory?.map(game => {
    // This is where all events relevant to a single game will be stored and sorted which is a palindrome
    return game;
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
        <Flex direction={{ base: "column", md: "row" }} justify="center" gap={10} align="center" marginTop={4}>
          <CreateChallengeBox />
          <Card
            direction={{ base: "column", sm: "row" }}
            width="container.sm"
            maxWidth={{ base: "container.sm", sm: "container.sm", md: "container.md" }}
            variant="solid"
            maxHeight={{ base: "container.sm", sm: "container.sm", md: "480" }}
            overflow={"auto"}
            textColor={"white"}
            backgroundColor={"gray.900"}
          >
            <CardBody>
              <Heading size="xl">⭕ See your active challenges! ❌</Heading>
              <Flex direction="column" alignItems="center" justifyContent="center">
                {gameCards?.map(({ gameId, player1, player2, bet }) => (
                  <>
                    <p>GameId: {gameId}</p>
                    <Flex direction="row" gap={6}>
                      <p>
                        Player 1: <Address address={player1} />
                      </p>
                      <p>
                        Player 2: <Address address={player2} />
                      </p>
                      <p>Bet: {bet.toString()} ETH</p>
                    </Flex>
                    <span>------------------------</span>
                  </>
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
