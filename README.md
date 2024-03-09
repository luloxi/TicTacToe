# ⭕ Tic Tac Toe ❌

dApp for betting on the outcome of a Tic Tac Toe game.

## How can I contribute to this build?

- 🐣 Project being developed by [Newbie's Lounge](https://lulox.notion.site/Newbie-s-Lounge-68ea7c4c5f1a4ec29786be6a76516878)
- 👷‍♀️ To view current development tasks, [check the Issues on the Github repo](https://github.com/luloxi/TicTacToe/issues).
- 🧰 To chat with other buidlers about this project, [join Newbies Lounge Telegram group](https://t.me/+FwCZPG51UhwzOTZh)
- 🛠️ To submit a PR (Pull Request), [fork and pull](https://github.com/susam/gitpr) a request to this repo.
- 🐣 Make sure you know the ETH Tech Stack and understand [how to make a dApp using Scaffold-ETH 2](https://lulox.notion.site/Newbie-s-Lounge-68ea7c4c5f1a4ec29786be6a76516878).

## Quickstart

To get started with Tic Tac Toe development, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/luloxi/TicTacToe.git
cd TicTacToe
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the contract component or the example ui in the frontend. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

## About the board:

Game board consists in 3 rows of 3 element per column.
There are 9 possible moves in total.

```nano
9 tiles (3 rows x 3 columns)

[0][1][2]
[3][4][5]
[6][7][8]

Win scenarios:

// ROWS
[0, 1, 2]
[3, 4, 5]
[6, 7, 8]

[0, 1, 2], // Row
[3, 4, 5], // Row
[6, 7, 8], // Row

// COLUMNS
[0] | [1] | [2]
[3] | [4] | [5]
[6] | [7] | [8]

[0, 3, 6], // Column
[1, 4, 7], // Column
[2, 5, 8], // Column

// DIAGONALS
[0] | [] | [2]
[] | [4] | []
[6] | [] | [8]

[0, 4, 8], // Diagonal
[2, 4, 6] // Diagonal
```

## Smart contract tests (pending deveopment)

Run smart contract test with `yarn hardhat:test`

## About Scaffold-ETH 2

See [SE2-DOCUMENTATION.md](./SE2-DOCUMENTATION.md)
