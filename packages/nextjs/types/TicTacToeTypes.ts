export type GameCreatedProps = {
  gameId: number;
  player1: string;
  player2: string;
  bet: number;
};

export type GameAcceptedProps = {
  gameId: number;
  player1: string;
  player2: string;
};

export type MoveMadeProps = {
  gameId: number;
  player: string;
  position: number;
};

export type GameFinishedProps = {
  gameId: number;
  winner: string;
  state: number;
};

export type TicTacToeBoardProps = {
  game: GameCreatedProps;
  isGameAccepted: boolean;
  movesList: MoveMadeProps[];
  movesAmount: number;
  isGameFinished: boolean;
};
