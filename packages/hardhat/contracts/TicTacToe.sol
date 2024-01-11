// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

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

    event GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2, uint256 bet);
    event GameAccepted(uint256 indexed gameId, address indexed team1, address indexed team2);
    event MoveMade(uint256 indexed gameId, address indexed player, uint8 position);
    event GameFinished(uint256 indexed gameId, address indexed winner, GameState state);

    /* MODIFIERS */

    modifier checkForTie(uint256 gameId) {
        // If all moves were used and no victory was gotten
        if (games[gameId].moves == 9) {
            // Set the game as a Tie and finish it so prizes can be withdrawn
            finishGame(gameId, address(0));
        }
        _;
    }

    modifier onlyPlayers(uint256 gameId) {
        require(msg.sender == games[gameId].player1 || msg.sender == games[gameId].player2, "Not a player");
        _;
    }

    modifier onlyValidMove(uint256 gameId, uint8 position) {
        require(position < 9, "Position not valid");
        require(games[gameId].board[position] == 0, "Position not empty");
        
        _;
    }

    /* EXTERNAL AND PUBLIC FUNCTIONS */

    function createGame(address _player2) external payable {
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
        // Emit an event
        // can be used by the frontend to know that something happened and react to it 
        emit GameCreated(gameIdCounter, msg.sender, _player2, msg.value); 
    }

    function makeMove(uint256 _gameId, uint8 position)
        external
        payable
        checkForTie(_gameId)
        onlyPlayers(_gameId)
        onlyValidMove(_gameId, position)
    {
        GameState currentState = games[_gameId].state;
        
        if (currentState == GameState.PENDING) {
            acceptGame(_gameId);
        } else {
            require(msg.value == 0, "Cannot send ETH with move");
            require(currentState == GameState.PLAYING, "Game already ended!");
        }

        // Determine the current Player symbol
        uint8 currentPlayer = games[_gameId].moves % 2 == 0 ? 1 : 2;
        // Add the corresponding mark in the position of the board
        games[_gameId].board[position] = currentPlayer;
        // Check if after adding that symbol, a win is achieved, and react to it if that's the case
        checkWin(_gameId, position, currentPlayer);    
        // And add 1 to the number of moves made in the game
        games[_gameId].moves++;

        emit MoveMade(_gameId, msg.sender, position);
        
    }

    /* INTERNAL FUNCTIONS */

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

    function checkWin(uint256 gameId, uint8 position, uint8 playerSymbol) internal returns (bool) {
        uint8 row = position / 3;
        uint8 col = position % 3;

        // Check row
        if (
            games[gameId].board[row * 3] == playerSymbol && games[gameId].board[row * 3 + 1] == playerSymbol
                && games[gameId].board[row * 3 + 2] == playerSymbol
        ) {
            finishGame(gameId, msg.sender);
            return true;
        }

        // Check column
        if (
            games[gameId].board[col] == playerSymbol && games[gameId].board[col + 3] == playerSymbol
                && games[gameId].board[col + 6] == playerSymbol
        ) {
            finishGame(gameId, msg.sender);
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
            finishGame(gameId, msg.sender);
            return true;
        }

        return false;
    }

    function acceptGame(uint256 _gameId) internal {
        require(games[_gameId].player2 == msg.sender, "You must be player 2 to accept!");
        require(msg.value == games[_gameId].bet, "You haven't sent enough ETH to accept!");

        games[_gameId].state = GameState.PLAYING;

        emit GameAccepted(_gameId, games[_gameId].player1, games[_gameId].player2);
    }

    function finishGame(uint256 gameId, address winner) internal {
        // Incliude a check for state assuming the winner will be the msg.sender
        // In the case of a tie call with address(0) as the winner, add a condition for that too

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