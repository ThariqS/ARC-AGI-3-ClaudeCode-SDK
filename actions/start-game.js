import { program } from "commander";
import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  makeRequest,
  readJSON,
  writeJSON,
  saveFrame,
  CONFIG_FILE,
  SESSIONS_FILE,
  GAMES_DIR,
  ensureFile,
} from "../utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program.requiredOption("--game <game-id>", "Game ID to start").parse();

const options = program.opts();

async function startGame() {
  try {
    const config = await readJSON(CONFIG_FILE);

    if (!config.currentScorecardId) {
      console.error(
        chalk.red("No open scorecard found. Please open a scorecard first:")
      );
      console.error(chalk.gray("  node ./actions/open-scorecard.js"));
      process.exit(1);
    }

    await ensureFile(SESSIONS_FILE, {});

    console.log(chalk.blue(`Starting new game: ${options.game}`));

    const requestBody = {
      game_id: options.game,
      card_id: config.currentScorecardId,
    };

    const response = await makeRequest("/api/cmd/RESET", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    console.log(response);

    const sessions = await readJSON(SESSIONS_FILE);
    sessions[response.guid] = {
      gameId: options.game,
      guid: response.guid,
      state: response.state,
      score: response.score,
      winScore: response.win_score,
      frameCount: 1,
      actionCount: 0,
      startTime: new Date().toISOString(),
    };
    await writeJSON(SESSIONS_FILE, sessions);

    // Create/update game.json in the new structure
    const gameJsonPath = path.join(GAMES_DIR, options.game, "game.json");
    await fs.mkdir(path.join(GAMES_DIR, options.game), { recursive: true });

    let gameData = await readJSON(gameJsonPath);
    if (!gameData) {
      gameData = {
        gameId: options.game,
        title: options.game.split("-")[0].toUpperCase(),
        description: "Grid puzzle game",
        observations: {
          gridSize: `${response.frame[0].length}x${response.frame[0][0].length}`,
          colors: {},
        },
        hypotheses: {
          goal: "Unknown - need to interact to understand objective",
          mechanics: "Grid-based puzzle with color transformations",
        },
        strategies: [],
        sessionId: response.guid,
        currentScore: response.score,
        targetScore: response.win_score,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      gameData.sessionId = response.guid;
      gameData.currentScore = response.score;
      gameData.targetScore = response.win_score;
      gameData.lastUpdated = new Date().toISOString();
    }
    await writeJSON(gameJsonPath, gameData);

    await saveFrame(
      response.guid,
      0,
      { ...response, game_id: options.game },
      { type: "RESET", params: {} },
      "Game initialized"
    );

    console.log(chalk.green("\n✓ Game started successfully!"));
    console.log(chalk.yellow("Session ID:"), response.guid);
    console.log(chalk.blue("State:"), response.state);
    console.log(
      chalk.blue("Score:"),
      `${response.score}/${response.win_score}`
    );
    console.log(
      chalk.gray(
        `Frame size: ${response.frame[0].length}x${response.frame[0][0].length}`
      )
    );

    const nonZeroPixels = response.frame[0]
      .flat()
      .flat()
      .filter((pixel) => pixel !== 0).length;
    console.log(chalk.gray(`Non-zero pixels: ${nonZeroPixels}`));

    console.log("\nNext steps:");
    console.log(
      chalk.gray("  node status.js                    # View current state")
    );
    console.log(
      chalk.gray("  node action.js --type 1           # Execute ACTION1")
    );
    console.log(
      chalk.gray("  node action.js --type 6 --x 10 --y 20  # Execute ACTION6")
    );
  } catch (error) {
    console.error(chalk.red("Error starting game:"), error.message);
    process.exit(1);
  }
}

startGame();
