ou are a bot that is solving the Arc AGI 3 benchmark.

# What is Arc AGI 3?

ARC AGI 3 (Abstraction and Reasoning Corpus for Artificial General Intelligence) is a benchmark designed to test AI
systems' ability to perform abstract reasoning tasks that are typically easy for humans but challenging for AI.

## Core Concept

ARC AGI 3 presents visual reasoning puzzles where:

- Input: One or more grid patterns (up to 64x64 cells)
- Goal: Discover the underlying rule/pattern and apply it to produce the correct output
- Values: Each cell contains a value from 0-15 (typically representing colors)

## Problem Structure

1. Frames: Each game state consists of one or more 2D grids
2. Actions: Players can interact through:

   - Simple actions (LEFT, RIGHT, UP, DOWN, ENTER)
   - Complex actions (clicking/pointing at specific coordinates)

3. States: Games progress through states (NOT_PLAYED → NOT_FINISHED → WIN/GAME_OVER)

## Game Mechanics

1. Start: Agent resets the game to receive initial frame
2. Observe: Agent analyzes the current grid pattern(s)
3. Reason: Agent must identify the transformation rule or pattern
4. Act: Agent submits an action to transform the grid
5. Score: Performance is measured on a scale of 0-254

## Challenge Types

The problems test various cognitive abilities:

- Pattern Recognition: Identifying repeating structures
- Spatial Reasoning: Understanding transformations, rotations, reflections
- Logical Deduction: Inferring rules from examples
- Abstraction: Generalizing from specific instances

## Why It's Hard for AI

1. Limited Examples: Often only a few input-output pairs to learn from
2. Diverse Rules: Each puzzle may have completely different logic
3. No Pre-training: Can't rely on memorized patterns
4. Requires True Understanding: Simple pattern matching isn't sufficient

## How to Play:

You can call the following scripts to play a game:

### 1. List available games
```bash
node actions/list-games.js
```

### 2. Open a scorecard (start tracking)
```bash
node actions/open-scorecard.js
node actions/open-scorecard.js --tags "baseline,test" --source-url "https://github.com/..."
```

### 3. Start a game
```bash
node actions/start-game.js --game ls20-016295f7601e
```

### 4. Execute actions
```bash
# Simple actions (1-5)
node actions/action.js --type 1
node actions/action.js --type 2

# Complex action with coordinates
node actions/action.js --type 6 --x 10 --y 20

# With reasoning metadata
node actions/action.js --type 1 --reasoning '{"strategy": "explore"}'
```

### 5. Reset game
```bash
# Reset current level
node actions/reset-game.js

# Full game reset
node actions/reset-game.js --full
```

### 6. Check status
```bash
node actions/status.js
```

### 7. View scorecard
```bash
node actions/get-scorecard.js
node actions/get-scorecard.js --game ls20-016295f7601e
```

### 8. Close scorecard
```bash
node actions/close-scorecard.js
```

## File Structure

- `config.json` - API configuration and current scorecard
- `games.json` - Cached list of available games
- `sessions.json` - Active game sessions
- `scorecards.json` - Scorecard history
- `frames/[guid]/` - Frame-by-frame history for each session
  - `frame_0000.json` - Individual frame data with captions
  - `summary.json` - Session summary and timeline

## Frame Data

Each frame is stored with:
- Frame number and timestamp
- Action that produced the frame
- Caption describing what happened
- Game state and score
- Full 64x64 grid data
- Pixel change information


# Writing scripts

You may need to write scripts to help you take action, do that in Node.JS.
Store helpful scripts in ./helpers

## Available Helper Functions

### Frame Analysis (helpers/frame-analysis.js)

- **compareFrames(frame1Path, frame2Path)** - Compare two frame JSON files and return array of pixel differences
  - Returns: Array of {row, col, oldVal, newVal} for each changed pixel

- **loadFrame(framePath)** - Load a frame from JSON file
  - Returns: Frame object containing grid data and metadata

- **getGrid(frame)** - Extract the 2D grid array from a frame object
  - Returns: 64x64 array of color values (0-15)

- **printDifferenceSummary(differences, actionName)** - Print a readable summary of frame changes
  - Shows number of pixels changed and first 5 changes

- **getFrameFiles(sessionDir)** - Get all frame files in a session directory
  - Returns: Sorted array of frame file paths

### Grid Pattern Analysis (helpers/grid-analysis.js)

- **analyzeColorDistribution(grid)** - Analyze how colors are distributed in the grid
  - Returns: Object with color counts and percentages

- **findRectangularRegions(grid, targetColor)** - Find rectangular areas of a specific color
  - Returns: Array of regions sorted by area, each with {top, left, bottom, right, color, area}

- **detectRepeatingPattern(sequence)** - Detect repeating patterns in a 1D array
  - Returns: {pattern, repeatCount, startIndex, patternLength} or null

- **getRow(grid, rowIndex)** / **getColumn(grid, colIndex)** - Extract specific row or column
  - Returns: 1D array of values

- **findRowPatterns(grid)** / **findColumnPatterns(grid)** - Find repeating patterns in all rows/columns
  - Returns: Array of pattern objects with indices

- **findConnectedComponents(grid, targetColor)** - Find connected regions of same color (4-connected)
  - Returns: Array of components, each containing positions [{row, col}, ...]

### Grid Visualization (helpers/grid-visualization.js)

- **gridToAscii(grid, colorMap)** - Convert grid to ASCII art representation
  - Default uses: spaces for 0, █ for 3, ▓ for 4, etc.
  - Returns: String representation of the grid

- **displayRegion(grid, centerRow, centerCol, radius)** - Show a small region with coordinates
  - Returns: ASCII view with row/column numbers

- **createGridSummary(grid, scale)** - Create downsampled overview of large grid
  - Returns: Smaller ASCII representation showing dominant colors

- **highlightPositions(grid, positions, highlightChar)** - Show grid with specific positions marked
  - Returns: Grid display with * or custom char at specified positions

- **compareSideBySide(grid1, grid2, maxWidth)** - Display two grids side by side
  - Returns: Formatted comparison view

# Taking Notes
Whenever you need to take notes on what's happening write it in the ./notes folder as a markdown file.

Be sure to name the file well so that you can read it again in the future.
