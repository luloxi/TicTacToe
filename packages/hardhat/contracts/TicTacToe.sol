// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title TicTacToe
 * @author Lulox
 * @notice A betting TicTacToe contract.
 * @dev Currently for using with one transaction per move,
 *      in a future may be replaced with signatures 
        or other gas efficient mechanism
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

	modifier onlyValidMove(uint256 _gameId, uint8 position) {
		// Store the game in memory to use less storage reads
		Game memory game = games[_gameId];
		uint8 currentPlayer = getCurrentPlayer(_gameId);

		// Player should be either player1 or player2, no doubt on that
		require(
			msg.sender == game.player1 || msg.sender == game.player2,
			"Not a player"
		);
		// Verify if it's your turn or not
		require(
			(msg.sender == game.player1 && currentPlayer == 1) ||
				(msg.sender == game.player2 && currentPlayer == 2),
			"Not your turn"
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
	) external onlyValidMove(_gameId, position) {
		// Determine the current Player symbol
		// 1 is player1, 2 is player2
		uint8 playerSymbol = games[_gameId].moves % 2 == 0 ? 1 : 2;
		// Add the corresponding mark in the position of the game board
		games[_gameId].board[position] = playerSymbol;
		// And add 1 to the number of moves made in the game
		games[_gameId].moves++;

		emit MoveMade(_gameId, msg.sender, position);
		// Check if after adding that symbol, a win is achieved, and react to it if that's the case
		checkWin(_gameId, position, msg.sender);
	}

	// Function to withdraw the prize based on game state
	function withdrawPrize(uint256 _gameId) external {
		Game storage game = games[_gameId];

		// Ensure the game is in the correct state for prize withdrawal
		require(
			game.state == GameState.PLAYER1WON ||
				game.state == GameState.PLAYER2WON ||
				game.state == GameState.TIE,
			"Invalid game state for prize withdrawal"
		);

		// Ensure the caller is one of the players or has not withdrawn yet
		require(
			msg.sender == game.player1 || msg.sender == game.player2,
			"Not a player"
		);

		// Ensure the player has not withdrawn yet
		if (msg.sender == game.player1) {
			require(
				game.state == GameState.PLAYER1WON,
				"You haven't won this game!"
			);
			require(
				!game.player1Withdrawn,
				"You have already withdrawn the prize!"
			);
			game.player1Withdrawn = true;
		} else {
			require(
				game.state == GameState.PLAYER2WON,
				"You haven't won this game!"
			);
			require(
				!game.player2Withdrawn,
				"You have already withdrawn the prize!"
			);
			game.player2Withdrawn = true;
		}

		// Calculate and transfer the prize based on the game state
		uint256 prize = calculatePrize(_gameId);
		require(prize > 0, "Invalid prize amount");

		// Transfer the prize to the player
		payable(msg.sender).transfer(prize);
	}

	/* INTERNAL FUNCTIONS */

	function checkWin(
		uint256 _gameId,
		uint8 _position,
		address _player
	) internal {
		// Store the game in memory to use less storage reads
		Game memory game = games[_gameId];
		// Check if board is complete and a tie should be declared
		// If all moves were used and no victory was gotten
		if (game.moves == 9) {
			// Set the game as a Tie and finish it so prizes can be withdrawn
			finishGame(_gameId, address(0));
		}

		// Get current player symbol
		uint8 playerSymbol = games[_gameId].moves % 2 == 0 ? 2 : 1; // Order is reverted because a moves++ is triggered before calling this internal function.

		uint8 row = _position / 3;
		uint8 col = _position % 3;

		// Check row
		if (
			game.board[row * 3] == playerSymbol &&
			game.board[row * 3 + 1] == playerSymbol &&
			game.board[row * 3 + 2] == playerSymbol
		) {
			finishGame(_gameId, _player);
		}

		// Check column
		if (
			game.board[col] == playerSymbol &&
			game.board[col + 3] == playerSymbol &&
			game.board[col + 6] == playerSymbol
		) {
			finishGame(_gameId, _player);
		}

		// Check diagonals
		if (
			(row == col || row + col == 2) &&
			((game.board[0] == playerSymbol &&
				game.board[4] == playerSymbol &&
				game.board[8] == playerSymbol) ||
				(game.board[2] == playerSymbol &&
					game.board[4] == playerSymbol &&
					game.board[6] == playerSymbol))
		) {
			finishGame(_gameId, _player);
		}
	}

	function finishGame(uint256 gameId, address winner) internal {
		Game storage game = games[gameId];

		// Ensure the game is in the PLAYING state before finishing
		require(
			game.state == GameState.PLAYING,
			"Game is not in PLAYING state"
		);

		// Determine the result based on the winner and update game state accordingly
		if (winner == address(0)) {
			// It's a tie
			game.state = GameState.TIE;
		} else if (winner == game.player1) {
			// Player 1 won
			game.state = GameState.PLAYER1WON;
		} else if (winner == game.player2) {
			// Player 2 won
			game.state = GameState.PLAYER2WON;
		} else {
			// Winner address is not valid
			revert("Invalid winner address");
		}

		// Emit GameFinished event
		emit GameFinished(gameId, winner, game.state);
	}

	// Function to calculate the prize based on the game state
	function calculatePrize(uint256 _gameId) internal view returns (uint256) {
		Game storage game = games[_gameId];
		uint256 totalBet = game.bet * 2; // Total amount bet in the game

		if (game.state == GameState.PLAYER1WON) {
			return totalBet;
		} else if (game.state == GameState.PLAYER2WON) {
			return totalBet;
		} else if (game.state == GameState.TIE) {
			// In the case of a tie, split the total bet equally between players
			return totalBet / 2;
		} else {
			// Invalid game state
			revert("Invalid game state");
		}
	}

	/* VIEW AND PURE FUNCTIONS */

	function getCurrentPlayer(uint256 _gameId) public view returns (uint8) {
		return games[_gameId].moves % 2 == 0 ? 1 : 2;
	}

	function getNumberOfMoves(uint256 _gameId) public view returns (uint8) {
		return games[_gameId].moves;
	}

	function getBoard(uint256 _gameId) external view returns (uint8[9] memory) {
		return games[_gameId].board;
	}
}
