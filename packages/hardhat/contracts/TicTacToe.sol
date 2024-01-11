// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/**
 * @title TicTacToe
 * @author Lulox
 * @notice A betting TicTacToe contract.
 * @dev Currently for using with one transaction per move,
 *      in a future may be replaced with signatures
 */

contract TicTacToe {
	uint256 public gameIdCounter = 0;

	enum GameState {
		PENDING,
		PLAYING,
		PLAYER1WON,
		PLAYER2WON,
		TIE
	}

	struct Game {
		address player1;
		address player2;
		GameState state;
		uint256 bet;
		bool player1Withdrawn;
		bool player2Withdrawn;
		uint8[9] board; // 0 (no player): empty, 1 (player 1): X, 2 (player 2): O
		uint8 moves; // Counter or the number of moves made
	}

	mapping(uint256 => Game) public games;

	event GameCreated(
		uint256 indexed gameId,
		address indexed player1,
		address indexed player2,
		uint256 bet
	);
	event GameAccepted(
		uint256 indexed gameId,
		address indexed team1,
		address indexed team2
	);
	event MoveMade(
		uint256 indexed gameId,
		address indexed player,
		uint8 position
	);
	event GameFinished(
		uint256 indexed gameId,
		address indexed winner,
		GameState state
	);

	/* MODIFIERS */

	modifier onlyPlayers(uint256 gameId) {
		require(
			msg.sender == games[gameId].player1 ||
				msg.sender == games[gameId].player2,
			"Not a player"
		);
		_;
	}

	modifier onlyValidMove(uint256 _gameId, uint8 position) {
		// Store the game in memory to use less storage reads
		Game memory game = games[_gameId];
		// Player should be either player1 or player2, no doubt on that
		require(
			msg.sender == game.player1 || msg.sender == game.player2,
			"Not a player"
		);
		// Position is within range of board (0 to 8, 9 in total)
		require(position < 9, "Position not valid");
		// If the state of the game isn't PLAYING, then you shouldn't be able to play
		require(
			game.state == GameState.PLAYING,
			"Game hasn't started or already ended!"
		);
		// Require position to be empty, or you can't write there otherwise
		require(game.board[position] == 0, "Position not empty");
		// Ensure only players can interact with this game
		_;
	}

	/* EXTERNAL AND PUBLIC FUNCTIONS */

	function createGame(address _player2) external payable {
		require(
			_player2 != msg.sender,
			"You can't challenge your same address!"
		);
		require(
			_player2 != address(0),
			"You can't challenge the zero address!"
		);

		// Increase gameIdCounter by one, as a new game is created
		gameIdCounter++;
		// Fill the information as a blank game with the data for the Game struct
		games[gameIdCounter] = Game({
			player1: msg.sender,
			player2: _player2,
			state: GameState.PENDING,
			bet: msg.value,
			player1Withdrawn: false,
			player2Withdrawn: false,
			board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
			moves: 0
		});

		// This event can be used by the frontend to know that something happened and react to it
		emit GameCreated(gameIdCounter, msg.sender, _player2, msg.value);
	}

	function acceptGame(uint256 _gameId) external payable {
		Game memory game = games[_gameId];
		require(game.player2 == msg.sender, "You must be player 2 to accept");
		require(
			game.state == GameState.PENDING,
			"Game must be PENDING to be accepted"
		);
		// If the game hasn't been accepted, attempt to accept it (may require payment)
		require(
			game.bet == msg.value,
			"You haven't sent the required ETH to accept"
		);

		// Set the game state to PLAYING and emit an event
		games[_gameId].state = GameState.PLAYING;
		emit GameAccepted(_gameId, game.player1, game.player2);
	}

	function makeMove(
		uint256 _gameId,
		uint8 position
	) external payable onlyValidMove(_gameId, position) {
		// If the game has been accepted, reject any additional payments
		require(msg.value == 0, "Cannot send ETH with move");
		// Determine the current Player symbol
		uint8 currentPlayer = games[_gameId].moves % 2 == 0 ? 1 : 2;
		// Add the corresponding mark in the position of the board
		games[_gameId].board[position] = currentPlayer;
		// And add 1 to the number of moves made in the game
		games[_gameId].moves++;
		emit MoveMade(_gameId, msg.sender, position);
		// Check if after adding that symbol, a win is achieved, and react to it if that's the case
		checkWin(_gameId, position, currentPlayer, msg.sender);
	}

	/* INTERNAL FUNCTIONS */

	function checkWin(
		uint256 gameId,
		uint8 position,
		uint8 playerSymbol,
		address player
	) internal {
		// Check if board is complete and a tie should be declared
		// If all moves were used and no victory was gotten
		if (games[gameId].moves == 9) {
			// Set the game as a Tie and finish it so prizes can be withdrawn
			finishGame(gameId, address(0));
		}

		uint8 row = position / 3;
		uint8 col = position % 3;

		// Check row
		if (
			games[gameId].board[row * 3] == playerSymbol &&
			games[gameId].board[row * 3 + 1] == playerSymbol &&
			games[gameId].board[row * 3 + 2] == playerSymbol
		) {
			finishGame(gameId, player);
		}

		// Check column
		if (
			games[gameId].board[col] == playerSymbol &&
			games[gameId].board[col + 3] == playerSymbol &&
			games[gameId].board[col + 6] == playerSymbol
		) {
			finishGame(gameId, player);
		}

		// Check diagonals
		if (
			(row == col || row + col == 2) &&
			((games[gameId].board[0] == playerSymbol &&
				games[gameId].board[4] == playerSymbol &&
				games[gameId].board[8] == playerSymbol) ||
				(games[gameId].board[2] == playerSymbol &&
					games[gameId].board[4] == playerSymbol &&
					games[gameId].board[6] == playerSymbol))
		) {
			finishGame(gameId, player);
		}
	}

	function finishGame(uint256 gameId, address winner) internal {
		// Incliude a check for state assuming the winner will be the msg.sender
		// In the case of a tie call with address(0) as the winner, add a condition for that too

		// Add conditions to determine which state will the game be finished with, according to this info ^
		// These come from the enum GameState PLAYER1WON, PLAYER2WON, TIE
		GameState state = games[gameId].state;
		emit GameFinished(gameId, winner, state);
	}

	/* VIEW AND PURE FUNCTIONS */

	function getCurrentPlayer(uint256 _gameId) public view returns (uint256) {
		return games[_gameId].moves % 2 == 0 ? 1 : 2;
	}

	function getBoard(uint256 _gameId) external view returns (uint8[9] memory) {
		return games[_gameId].board;
	}
}
