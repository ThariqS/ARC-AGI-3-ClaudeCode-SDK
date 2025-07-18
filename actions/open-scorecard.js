import { program } from "commander";
import chalk from "chalk";
import {
  makeRequest,
  writeJSON,
  readJSON,
  CONFIG_FILE,
  SCORECARDS_FILE,
  ensureFile,
} from "../utils.js";

program
  .option("--source-url <url>", "Link to code or documentation")
  .option("--tags <tags>", "Comma-separated tags")
  .option("--metadata <json>", "Additional metadata as JSON string")
  .parse();

const options = program.opts();

async function openScorecard() {
  try {
    await ensureFile(SCORECARDS_FILE, { openScorecard: null, history: [] });

    const requestBody = {};

    if (options.sourceUrl) {
      requestBody.source_url = options.sourceUrl;
    }

    if (options.tags) {
      requestBody.tags = options.tags.split(",").map((tag) => tag.trim());
    }

    if (options.metadata) {
      try {
        requestBody.opaque = JSON.parse(options.metadata);
      } catch (e) {
        console.error(chalk.red("Invalid JSON in metadata:"), e.message);
        process.exit(1);
      }
    }

    console.log(chalk.blue("Opening new scorecard..."));

    const response = await makeRequest("/api/scorecard/open", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const config = await readJSON(CONFIG_FILE);
    config.currentScorecardId = response.card_id;
    console.log(response);
    await writeJSON(CONFIG_FILE, config);

    const scorecards = await readJSON(SCORECARDS_FILE);
    scorecards.openScorecard = {
      cardId: response.card_id,
      openedAt: new Date().toISOString(),
      metadata: requestBody,
    };
    await writeJSON(SCORECARDS_FILE, scorecards);

    console.log(chalk.green("\n✓ Scorecard opened successfully!"));
    console.log(chalk.yellow("Card ID:"), response.card_id);

    if (requestBody.tags) {
      console.log(chalk.gray("Tags:"), requestBody.tags.join(", "));
    }

    console.log("\nYou can now start playing games with this scorecard.");
    console.log("\nList the games with: node ./actions/list-games.js");
  } catch (error) {
    console.error(chalk.red("Error opening scorecard:"), error.message);
    process.exit(1);
  }
}

openScorecard();
