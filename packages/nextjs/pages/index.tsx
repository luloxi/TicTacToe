import { Card, CardBody, Flex, Heading } from "@chakra-ui/react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import CreateChallengeBox from "~~/components/tictactoe/CreateChallengeBox";
import TicTacToeBoard from "~~/components/tictactoe/TicTacToeBoard";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const { data: GameCreatedHistory } = useScaffoldEventHistory({
    contractName: "TicTacToe",
    eventName: "GameCreated",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  const { data: GameAcceptedHistory } = useScaffoldEventHistory({
    contractName: "TicTacToe",
    eventName: "GameAccepted",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  const { data: GameFinishedHistory } = useScaffoldEventHistory({
    contractName: "TicTacToe",
    eventName: "GameFinished",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  const { data: MoveMadeHistory } = useScaffoldEventHistory({
    contractName: "TicTacToe",
    eventName: "MoveMade",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  const gameCards = GameCreatedHistory?.map(game => {
    const isGameAccepted = GameAcceptedHistory?.some(acceptedGame => acceptedGame.args[0] === game.args[0]);
    const isGameFinished = GameFinishedHistory?.some(finishedGame => finishedGame.args[0] === game.args[0]);
    const movesMade = MoveMadeHistory?.filter(moveMade => moveMade.args[0] == game.args[0]);
    return { game, isGameAccepted, isGameFinished, movesMade };
  });

  return (
    <>
      <MetaHeader />
      <div
        style={{
          position: "relative",
          minHeight: "80vh",
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
            maxHeight={{ base: "240", sm: "240", md: "360", lg: "540" }}
            overflow={"auto"}
            textColor={"white"}
            backgroundColor={"gray.900"}
          >
            <CardBody>
              <Heading size="xl">⭕ See your active challenges! ❌</Heading>
              <Flex direction="column" alignItems="center" justifyContent="center">
                {gameCards?.map(({ game, isGameAccepted, isGameFinished, movesMade }) => (
                  <TicTacToeBoard
                    key={game.args[0]}
                    game={{
                      gameId: parseInt(game.args[0].toString()),
                      player1: game.args[1],
                      player2: game.args[2],
                      bet: parseInt(game.args[3].toString()),
                    }}
                    isGameAccepted={isGameAccepted}
                    isGameFinished={isGameFinished}
                    currentPlayer={connectedAddress}
                    movesMade={movesMade}
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
