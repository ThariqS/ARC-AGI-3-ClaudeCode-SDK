# ARC AGI 3 Benchmark with Claude Code

This project provides a command-line interface for solving ARC AGI 3 (Abstraction and Reasoning Corpus) puzzles using Claude through the Claude Code terminal.

Read more on ARC here: https://three.arcprize.org/

## Prerequisites

- Claude Code CLI (`claude` command available in terminal)
- ARC AGI 3 API key (get one from https://three.arcprize.org)

## System Initialization

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone git@github.com:ThariqS/Claude-Code-ARC-AGI-3.git
cdC laude-Code-ARC-AGI-3

# Install required dependencies
npm install
```

### 2. Initialize the System with API Key

You'll need an ARC AGI 3 API key to use this system. Initialize with:

Or using the full command:

```bash
node init.js --api-key YOUR_API_KEY
```

This will create a `config.json` file with your API credentials.

### 3. Verify Installation

List available games to ensure everything is working:

```bash
node actions/list-games.js
```

## Getting Started

1. After initialization, run `claude` to start an interactive session with Claude
2. Claude will have access to all game scripts and helper functions
3. Ask Claude to play a specific game or explore available games
4. Give instructions to Claude on how to play `e.g. analyze patterns after every game`

## Automated Solver

Use the `play-arc-with-claude.js` script to run the Claude Code SDK to independently solve ARC AGI 3 puzzles:

```bash
# Basic usage (uses default game and 50 turns)
node play-arc-with-claude.js

# Specify a specific game
node play-arc-with-claude.js ls20-016295f7601e

# Specify game and 100 maximum turns
node play-arc-with-claude.js ls20-016295f7601e 100
```

This script will:

- Automatically start Claude Code in the project directory
- Have Claude read the game instructions from CLAUDE.md
- Play the specified game until winning or reaching the turn limit
- Log each turn's actions and results to the console

### Script Arguments

- **Game Name** (optional): The ID of the game to play. Defaults to "ls20-016295f7601e"
- **Max Turns** (optional): Maximum number of turns before stopping. Defaults to 50

## How to Play

Claude will help you solve ARC AGI 3 puzzles by analyzing visual patterns and reasoning about transformations. Here's the typical workflow claude will use:

### 1. List Available Games

```bash
node actions/list-games.js
```

### 2. Start Tracking Your Progress

```bash
node actions/open-scorecard.js
```

### 3. Begin a Game

```bash
node actions/start-game.js --game [game-id]
```

### 4. Make Moves

Simple directional moves:

```bash
node actions/action.js --type 1  # LEFT
node actions/action.js --type 2  # RIGHT
node actions/action.js --type 3  # UP
node actions/action.js --type 4  # DOWN
node actions/action.js --type 5  # ENTER
```

Click at specific coordinates:

```bash
node actions/action.js --type 6 --x 10 --y 20
```

### 5. Check Game Status

```bash
node actions/status.js
```

### 6. Reset if Needed

```bash
node actions/reset-game.js
```

## Project Structure

- `actions/` - CLI scripts for game interaction
- `helpers/` - Utility functions for analyzing grids and patterns
- `frames/` - Stored game states and history
- `notes/` - Claude's analysis notes during gameplay
- `config.json` - API configuration
- `games.json` - Available games cache
- `sessions.json` - Active game sessions
- `scorecards.json` - Performance history

## Tips for Success

1. Ask Claude to analyze the initial frames to understand the pattern
2. Use the visualization helpers to better see the grid structure
3. Let Claude track observations in the notes folder
4. Try different approaches if the first strategy doesn't work

## Getting Help

Simply ask Claude questions about:

- Pattern analysis strategies
- Understanding specific game mechanics
- Interpreting grid visualizations
- Debugging failed attempts

Claude will use the available helper functions to analyze frames, detect patterns, and suggest next moves.
