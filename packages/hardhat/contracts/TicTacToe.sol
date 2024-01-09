// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

/**
 * @title A Tic Tac Toe game
 * @author Lulox
 * @notice This contract is for creating a bet between two parts on the outcome of a Tic Tac Toe Game
 */
contract TicTacToe {
    uint256 public gameIdCounter = 1;

    enum GameState {
        PENDING,
        PLAYING,
        PLAYER1WON,
        PLAYER2WON,
        TIE,
        CANCELED
    }

    struct Game {
        address player1;
        address player2;
        GameState state;
        uint256 bet;
        uint256 lastMoveTime;
        bool player1Withdrawn; // Indicates whether player 1 has withdrawn or not
        bool player2Withdrawn; // Indicates whether player 2 has withdrawn or not
        uint8[9] board; // 0: empty, 1: X, 2: O
        uint8 moves; // Counter or the number of moves made
    }

    mapping(uint256 => Game) public games;

    event GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2, uint256 bet);
    event GameAccepted(uint256 indexed gameId, address indexed team1, address indexed team2);
    event MoveMade(uint256 indexed gameId, address indexed player, uint8 position);
    event GameFinished(uint256 indexed gameId, address indexed winner, GameState state);

    /* MODIFIERS */

    modifier onlyPlayers(uint256 gameId) {
        require(msg.sender == games[gameId].player1 || msg.sender == games[gameId].player2, "Not a player");
        _;
    }

    modifier onlyValidMove(uint256 gameId, uint8 position) {
        require(games[gameId].board[position] == 0, "Invalid move");
        require(position < 9, "Invalid position");
        _;
    }

    modifier gameNotCancelled(uint256 gameId) {
        require(games[gameId].state != GameState.CANCELED, "Game was canceled!");
        _;
    }

    /* EXTERNAL AND PUBLIC FUNCTIONS */

    function createGame(address _player2) external payable {
        games[gameIdCounter] = Game({
            player1: msg.sender,
            player2: _player2,
            state: GameState.PENDING,
            bet: msg.value,
            lastMoveTime: block.timestamp,
            player1Withdrawn: false,
            player2Withdrawn: false,
            board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            moves: 0
        });

        emit GameCreated(gameIdCounter, msg.sender, _player2, msg.value);
        gameIdCounter++;
    }

    function makeMove(uint256 _gameId, uint8 position)
        external
        payable
        onlyPlayers(_gameId)
        gameNotCancelled(_gameId)
        onlyValidMove(_gameId, position)
    {
        if (games[_gameId].player2 == msg.sender && games[_gameId].state == GameState.PENDING) {
            acceptGame(_gameId);
        } else {
            require(msg.value == 0, "Cannot send ETH with move");
            require(games[_gameId].state == GameState.PLAYING, "Game not in progress");
        }

        require(position < 9, "Invalid position");

        uint8 currentPlayerSymbol = games[_gameId].moves % 2 == 0 ? 1 : 2;
        require(currentPlayerSymbol == 1 && msg.sender == games[_gameId].player2, "Wait for your turn");
        games[_gameId].board[position] = currentPlayerSymbol;
        games[_gameId].moves++;
        games[_gameId].lastMoveTime = block.timestamp;

        emit MoveMade(_gameId, msg.sender, position);

        // Check for win
        if (checkWin(_gameId, position, currentPlayerSymbol)) {
            finishGame(_gameId, msg.sender, currentPlayerSymbol == 1 ? GameState.PLAYER2WON : GameState.PLAYER1WON);
        } else if (games[_gameId].moves == 9) {
            // Check for a draw
            finishGame(_gameId, address(0), GameState.TIE);
        }
    }

    /* INTERNAL FUNCTIONS */

    function acceptGame(uint256 _gameId) internal {
        require(games[_gameId].state == GameState.PENDING, "Game not in pending state");
        require(games[_gameId].player2 == msg.sender, "Not player2");
        require(msg.value == games[_gameId].bet, "Haven't sent enough ETH!");

        games[_gameId].state = GameState.PLAYING;

        emit GameAccepted(_gameId, games[_gameId].player1, games[_gameId].player2);
    }

    function finishGame(uint256 gameId, address winner, GameState state) internal {
        games[gameId].state = state;
        emit GameFinished(gameId, winner, state);
    }

    // This used to be the array to check against if there was a win condition already.
    // It is now replaced by the internal function checkWin
    //
    //  uint8[3][8] private winConditions = [
    //     [0, 1, 2],
    //     [3, 4, 5],
    //     [6, 7, 8], // Rows
    //     [0, 3, 6],
    //     [1, 4, 7],
    //     [2, 5, 8], // Columns
    //     [0, 4, 8],
    //     [2, 4, 6] // Diagonals
    // ];

    function checkWin(uint256 gameId, uint8 position, uint8 playerSymbol) internal view returns (bool) {
        uint8 row = position / 3;
        uint8 col = position % 3;

        // Check row
        if (
            games[gameId].board[row * 3] == playerSymbol && games[gameId].board[row * 3 + 1] == playerSymbol
                && games[gameId].board[row * 3 + 2] == playerSymbol
        ) {
            return true;
        }

        // Check column
        if (
            games[gameId].board[col] == playerSymbol && games[gameId].board[col + 3] == playerSymbol
                && games[gameId].board[col + 6] == playerSymbol
        ) {
            return true;
        }

        // Check diagonals
        if (
            (row == col || row + col == 2)
                && (
                    (
                        games[gameId].board[0] == playerSymbol && games[gameId].board[4] == playerSymbol
                            && games[gameId].board[8] == playerSymbol
                    )
                        || (
                            games[gameId].board[2] == playerSymbol && games[gameId].board[4] == playerSymbol
                                && games[gameId].board[6] == playerSymbol
                        )
                )
        ) {
            return true;
        }

        return false;
    }

    /* VIEW AND PURE FUNCTIONS */

    function getCurrentPlayer(uint256 _gameId) external view returns (uint256) {
        return games[_gameId].moves % 2 == 0 ? 1 : 2;
    }

    function getBoard(uint256 _gameId) external view returns (uint8[9] memory) {
        return games[_gameId].board;
    }
}