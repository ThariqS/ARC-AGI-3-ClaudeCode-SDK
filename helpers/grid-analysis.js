/**
 * Analyze color distribution in a grid
 * @param {Array} grid - 2D grid array
 * @returns {Object} Color counts and percentages
 */
export function analyzeColorDistribution(grid) {
    const colorCounts = {};
    const totalPixels = grid.length * grid[0].length;
    
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
            const val = grid[row][col];
            colorCounts[val] = (colorCounts[val] || 0) + 1;
        }
    }
    
    const distribution = {};
    for (const [color, count] of Object.entries(colorCounts)) {
        distribution[color] = {
            count,
            percentage: (count / totalPixels * 100).toFixed(1)
        };
    }
    
    return distribution;
}

/**
 * Find rectangular regions of a specific color
 * @param {Array} grid - 2D grid array
 * @param {number} targetColor - Color value to search for
 * @returns {Array} Array of rectangular regions {top, left, bottom, right, color}
 */
export function findRectangularRegions(grid, targetColor = null) {
    const regions = [];
    const visited = Array(grid.length).fill(null).map(() => Array(grid[0].length).fill(false));
    
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
            if (!visited[row][col] && (targetColor === null || grid[row][col] === targetColor)) {
                const color = grid[row][col];
                let top = row, bottom = row, left = col, right = col;
                
                // Find the extent of the rectangle
                while (right + 1 < grid[0].length && grid[row][right + 1] === color) right++;
                
                let validRect = true;
                for (let r = row; r < grid.length && validRect; r++) {
                    for (let c = left; c <= right; c++) {
                        if (grid[r][c] !== color) {
                            validRect = false;
                            break;
                        }
                    }
                    if (validRect) bottom = r;
                }
                
                // Mark as visited
                for (let r = top; r <= bottom; r++) {
                    for (let c = left; c <= right; c++) {
                        visited[r][c] = true;
                    }
                }
                
                if ((bottom - top + 1) * (right - left + 1) > 1) {
                    regions.push({ top, left, bottom, right, color, area: (bottom - top + 1) * (right - left + 1) });
                }
            }
        }
    }
    
    return regions.sort((a, b) => b.area - a.area);
}

/**
 * Detect repeating patterns in a row or column
 * @param {Array} sequence - 1D array of values
 * @returns {Object} Pattern information {pattern, repeatCount, startIndex}
 */
export function detectRepeatingPattern(sequence) {
    for (let patternLength = 1; patternLength <= sequence.length / 2; patternLength++) {
        for (let start = 0; start < sequence.length - patternLength; start++) {
            const pattern = sequence.slice(start, start + patternLength);
            let repeatCount = 1;
            let pos = start + patternLength;
            
            while (pos + patternLength <= sequence.length) {
                let matches = true;
                for (let i = 0; i < patternLength; i++) {
                    if (sequence[pos + i] !== pattern[i]) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    repeatCount++;
                    pos += patternLength;
                } else {
                    break;
                }
            }
            
            if (repeatCount >= 2 && repeatCount * patternLength >= sequence.length * 0.5) {
                return { pattern, repeatCount, startIndex: start, patternLength };
            }
        }
    }
    return null;
}

/**
 * Get a specific row from the grid
 * @param {Array} grid - 2D grid array
 * @param {number} rowIndex - Row index
 * @returns {Array} Row values
 */
export function getRow(grid, rowIndex) {
    return grid[rowIndex];
}

/**
 * Get a specific column from the grid
 * @param {Array} grid - 2D grid array
 * @param {number} colIndex - Column index
 * @returns {Array} Column values
 */
export function getColumn(grid, colIndex) {
    return grid.map(row => row[colIndex]);
}

/**
 * Find all unique patterns in rows
 * @param {Array} grid - 2D grid array
 * @returns {Array} Array of pattern objects with row indices
 */
export function findRowPatterns(grid) {
    const patterns = [];
    
    for (let row = 0; row < grid.length; row++) {
        const pattern = detectRepeatingPattern(grid[row]);
        if (pattern) {
            patterns.push({ row, ...pattern });
        }
    }
    
    return patterns;
}

/**
 * Find all unique patterns in columns
 * @param {Array} grid - 2D grid array
 * @returns {Array} Array of pattern objects with column indices
 */
export function findColumnPatterns(grid) {
    const patterns = [];
    
    for (let col = 0; col < grid[0].length; col++) {
        const column = getColumn(grid, col);
        const pattern = detectRepeatingPattern(column);
        if (pattern) {
            patterns.push({ col, ...pattern });
        }
    }
    
    return patterns;
}

/**
 * Find connected components of a specific color
 * @param {Array} grid - 2D grid array
 * @param {number} targetColor - Color to find components for
 * @returns {Array} Array of components, each containing array of {row, col} positions
 */
export function findConnectedComponents(grid, targetColor) {
    const visited = Array(grid.length).fill(null).map(() => Array(grid[0].length).fill(false));
    const components = [];
    
    function dfs(row, col, component) {
        if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length || 
            visited[row][col] || grid[row][col] !== targetColor) {
            return;
        }
        
        visited[row][col] = true;
        component.push({row, col});
        
        // Check 4-connected neighbors
        dfs(row - 1, col, component);
        dfs(row + 1, col, component);
        dfs(row, col - 1, component);
        dfs(row, col + 1, component);
    }
    
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
            if (!visited[row][col] && grid[row][col] === targetColor) {
                const component = [];
                dfs(row, col, component);
                if (component.length > 0) {
                    components.push(component);
                }
            }
        }
    }
    
    return components.sort((a, b) => b.length - a.length);
}