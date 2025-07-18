import chalk from "chalk";
import { makeRequest, writeJSON, GAMES_FILE } from "../utils.js";

async function listGames() {
  try {
    console.log(chalk.blue("Fetching available games..."));

    const games = await makeRequest("/api/games");

    await writeJSON(GAMES_FILE, {
      games,
      lastFetched: new Date().toISOString(),
    });

    console.log(chalk.green(`\n✓ Found ${games.length} games:\n`));

    games.forEach((game) => {
      console.log(chalk.yellow("Game ID:"), game.game_id);
      console.log(chalk.gray("Title:"), game.title);
      console.log();
    });

    console.log(chalk.gray("To start a game, run:"));
    console.log(
      chalk.gray(
        `  node ./actions/start-game.js --game ${
          games[0]?.game_id || "<game-id>"
        }`
      )
    );
  } catch (error) {
    console.error(chalk.red("Error fetching games:"), error.message);
    process.exit(1);
  }
}

listGames();
