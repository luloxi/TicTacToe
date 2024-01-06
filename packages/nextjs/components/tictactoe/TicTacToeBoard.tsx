import React from /* ,  { useState } */
"react";
import { Button, Flex, Text } from "@chakra-ui/react";

// import { ethers } from "ethers";

interface TicTacToeBoardProps {
  gameId: number;
  currentPlayer: number;
  board: number[];
  makeMove: (position: number) => void;
}

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({ gameId, makeMove }) => {
  const renderSquare = (i: number) => (
    <Button
      key={i}
      size="md"
      fontSize="xl"
      fontWeight="bold"
      colorScheme="teal"
      // disabled={board[i] !== 0 || currentPlayer !== 1}
      onClick={() => makeMove(i)}
    >
      {/* {board[i] === 1 ? "X" : board[i] === 2 ? "O" : ""} */}
    </Button>
  );

  return (
    <Flex direction="column" alignItems="center" justifyContent="center" marginTop={4}>
      <Text fontSize="xl" fontWeight="bold" marginBottom={2}>
        Tic Tac Toe Game #{gameId}
      </Text>
      <Flex direction="row" flexWrap="wrap">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSquare(i))}
      </Flex>
    </Flex>
  );
};

export default TicTacToeBoard;
