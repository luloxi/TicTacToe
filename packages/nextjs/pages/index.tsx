import { useState } from "react";
import { Box, Card, CardBody, Flex } from "@chakra-ui/react";
import type { NextPage } from "next";
import { useInterval } from "usehooks-ts";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import Pagination from "~~/components/pagination/Pagination";
import { SearchBar } from "~~/components/searchBar/SearchBar";
import CreateChallengeBox from "~~/components/tictactoe/CreateChallengeBox";
import TicTacToeBoard from "~~/components/tictactoe/TicTacToeBoard";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { FilterProps } from "~~/types/TicTacToeTypes";

const PAGE_SIZE = 5;

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchFilters, setSearchFilters] = useState<FilterProps[]>([
    { label: "Only your games", selected: false },
    { label: "Only unfinished games", selected: false },
  ]);
  const [searchInput, setSearchInput] = useState<string>("");
  const [gameCards, setGameCards] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalItems / PAGE_SIZE));

  const onPageChange = (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);
  };

  const updateSearchFilters = (index: number) => {
    setIsLoading(true);
    setCurrentPage(1);
    setSearchFilters(prevFilters => {
      const updatedFilters = [...prevFilters];
      updatedFilters[index] = {
        ...updatedFilters[index],
        selected: !updatedFilters[index].selected,
      };
      return updatedFilters;
    });
  };

  const updateSearchInput = (newSearchInput: string) => {
    setIsLoading(true);
    setCurrentPage(1);
    setSearchInput(newSearchInput);
  };

  const { data: GameCreatedHistory } = useScaffoldEventHistory({
    contractName: "TicTacToe",
    eventName: "GameCreated",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  const useEventData = (eventName: any, filters = {}) => {
    return useScaffoldEventHistory({
      contractName: "TicTacToe",
      eventName: eventName,
      filters: filters,
      fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
      watch: true,
    }).data;
  };

  const GameAcceptedHistory = useEventData("GameAccepted");
  const GameDeletedHistory = useEventData("GameDeleted");
  const GameFinishedHistory = useEventData("GameFinished");
  const MoveMadeHistory = useEventData("MoveMade");
  useInterval(() => {
    let filteredData = GameCreatedHistory;
    if (searchFilters[0]?.selected) {
      filteredData = GameCreatedHistory?.filter(
        game => game.args["player1"] === connectedAddress || game.args["player2"] === connectedAddress,
      );
    }
    if (searchFilters[1]?.selected) {
      filteredData = filteredData?.filter(
        game1 => !GameFinishedHistory?.some(game2 => game1?.args?.["gameId"] === game2?.args?.["gameId"]),
      );
    }
    if (searchInput && isAddress(searchInput)) {
      filteredData = GameCreatedHistory?.filter(
        game => game.args["player1"] === searchInput || game.args["player2"] === searchInput,
      );
    } else if (searchInput && !isNaN(parseInt(searchInput))) {
      const adjustedId = GameCreatedHistory !== undefined ? GameCreatedHistory?.length - parseInt(searchInput) : 0;
      const accessedElement = GameCreatedHistory?.[adjustedId];
      filteredData = accessedElement !== undefined ? [accessedElement] : [];
    }
    if (filteredData) {
      setTotalPages(Math.ceil(filteredData?.length / PAGE_SIZE));
      setTotalItems(filteredData?.length);
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const endIndex = Math.min(startIndex + PAGE_SIZE, filteredData?.length);
      const data = filteredData?.map(game => {
        const isGameAccepted = GameAcceptedHistory?.some(acceptedGame => acceptedGame.args[0] === game.args[0]);
        const isGameFinished = GameFinishedHistory?.some(finishedGame => finishedGame.args[0] === game.args[0]);
        const isGameDeleted = GameDeletedHistory?.some(deletedGame => deletedGame.args[0] === game.args[0]);
        const movesMade = MoveMadeHistory?.filter(moveMade => moveMade.args[0] == game.args[0]);
        return { game, isGameAccepted, isGameFinished, isGameDeleted, movesMade };
      });
      const slicedData = data?.slice(startIndex, endIndex);
      setGameCards(slicedData);
    }
    setIsLoading(false);
  }, 1500);
  return (
    <>
      <MetaHeader />
      <div
        style={{
          position: "relative",
          minHeight: "95vh",
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
            height="container.sm"
            maxHeight={{ base: "240", sm: "240", md: "360", lg: "540" }}
            overflow={"auto"}
            textColor={"white"}
            backgroundColor={"#111"}
          >
            <CardBody>
              <Flex direction="column" alignItems="center" justifyContent="center">
                <SearchBar
                  searchFilters={searchFilters}
                  updateSearchFilters={updateSearchFilters}
                  searchInput={searchInput}
                  updateSearchInput={updateSearchInput}
                />
                {isLoading ? (
                  <p className="text-2xl text-base-content">Loading...</p>
                ) : gameCards?.length > 0 ? (
                  gameCards?.map(({ game, isGameAccepted, isGameFinished, isGameDeleted, movesMade }) => (
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
                      isGameDeleted={isGameDeleted}
                      currentPlayer={connectedAddress}
                      movesMade={movesMade}
                    />
                  ))
                ) : (
                  <Flex fontSize={24} textColor={"red"} alignItems={"center"} justifyContent={"center"} paddingTop={3}>
                    Games weren&apos;t found
                  </Flex>
                )}
                {gameCards?.length > 0 && (
                  <Box marginBottom={3}>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
                  </Box>
                )}
              </Flex>
            </CardBody>
          </Card>
        </Flex>
      </div>
    </>
  );
};

export default Home;
