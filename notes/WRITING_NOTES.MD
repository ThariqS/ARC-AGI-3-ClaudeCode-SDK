# Writing Notes for ARC AGI 3 Problem Solving

## Purpose
Notes serve as a persistent memory system for tracking insights, patterns, and strategies discovered while solving ARC AGI 3 puzzles. They enable learning from past attempts and building a knowledge base of successful approaches.

## File Naming Convention
- Use descriptive names that indicate the content: `game_[game-id]_analysis.md`, `pattern_[type]_examples.md`, `strategy_[approach].md`
- Include timestamps for session-specific notes: `session_2025-07-18_insights.md`
- Group related notes with prefixes: `color_`, `spatial_`, `logic_`, etc.

## Note Structure

### Game Analysis Notes
```markdown
# Game: [game-id]

## Initial Observations
- Grid dimensions
- Color distribution
- Visible patterns
- Symmetries or regularities

## Hypotheses
1. [Hypothesis 1]
   - Evidence for
   - Evidence against
   - Test approach

## Actions Taken
- Action 1: [type] -> [result]
- Action 2: [coordinates] -> [effect]

## Pattern Discovered
- Rule: [description]
- Examples: [specific cases]
- Edge cases: [exceptions]

## Solution Strategy
[Step-by-step approach that worked]
```

### Pattern Recognition Notes
```markdown
# Pattern Type: [name]

## Description
[What the pattern looks like]

## Common Occurrences
- Game examples where seen
- Typical transformations

## Detection Method
[How to identify this pattern programmatically]

## Solution Approach
[Standard actions that work for this pattern]
```

### Strategy Notes
```markdown
# Strategy: [name]

## When to Apply
- Grid characteristics
- Game state indicators

## Steps
1. [Step 1]
2. [Step 2]

## Success Rate
- Games where effective
- Games where failed

## Variations
[Alternative approaches for edge cases]
```

## Best Practices

### Be Specific
- Include exact coordinates, color values, and action sequences
- Reference specific frames: `frame_0023.json showed...`
- Note pixel changes: "Changed (12,34) from color 3 to color 7"

### Track Failures
- Document what didn't work and why
- Include reasoning that led to incorrect actions
- Note misleading patterns to avoid

### Link Related Concepts
- Reference other note files: `See spatial_rotation.md for similar pattern`
- Group games with similar mechanics
- Build a taxonomy of puzzle types

### Use Visual Representations
```
Grid Region (10,10) to (15,15):
░░░░░░
░███░░
░█□█░░
░███░░
░░░░░░
```

### Include Code Snippets
```javascript
// Pattern detection logic that worked
const isSymmetric = (grid) => {
  // Implementation
};
```

## Organization

### Directory Structure
```
./notes/
├── games/           # Individual game analyses
├── patterns/        # Recognized pattern types
├── strategies/      # Successful approaches
├── failures/        # Failed attempts and lessons
└── insights/        # General observations
```

### Indexing
Maintain an `index.md` that categorizes notes by:
- Puzzle difficulty
- Pattern types
- Solution strategies
- Success rate

## Review Process
- After each session, consolidate temporary notes
- Identify recurring patterns across games
- Update strategy documents with new findings
- Remove outdated or incorrect hypotheses

## Example Note

```markdown
# Game: ls20-016295f7601e Analysis

## Initial State
- 64x64 grid, mostly black (0)
- Blue rectangle (3) at (10,10) to (20,20)
- Red dots (4) scattered in pattern

## Hypothesis 1: Movement Pattern
The blue rectangle moves based on red dot positions.
- Test: Action RIGHT
- Result: Rectangle moved 5 pixels right
- Confirmed: Distance matches nearest red dot

## Solution
1. Count red dots in each direction
2. Move rectangle toward highest concentration
3. Repeat until all red dots covered

## Key Insight
This is a "collection" puzzle where the movable object must visit all targets. Similar to games x, y, z.
```
