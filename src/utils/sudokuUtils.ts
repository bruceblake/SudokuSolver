/**
 * Sudoku solver utility functions using backtracking algorithm
 */

export type SudokuGrid = (number | null)[][];

/**
 * Creates an empty 9x9 Sudoku grid filled with null values
 */
export const createEmptyGrid = (): SudokuGrid => {
  return Array(9).fill(null).map(() => Array(9).fill(null));
};

/**
 * Creates a deep copy of a Sudoku grid
 */
export const copyGrid = (grid: SudokuGrid): SudokuGrid => {
  return grid.map(row => [...row]);
};

/**
 * Finds the next empty cell in the grid (cell with null value)
 * Returns [row, col] if found, or null if no empty cell exists
 */
export const findEmptyCell = (grid: SudokuGrid): [number, number] | null => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        return [row, col];
      }
    }
  }
  return null;
};

/**
 * Checks if a number can be placed at the specified position
 * Returns true if the number is valid in that position
 */
export const isValidPlacement = (
  grid: SudokuGrid,
  row: number,
  col: number,
  num: number
): boolean => {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) {
      return false;
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[boxRow + r][boxCol + c] === num) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Solves the Sudoku puzzle using backtracking algorithm
 * Modifies the grid in place and returns true if a solution is found
 */
export const solveSudoku = (grid: SudokuGrid): boolean => {
  const emptyCell = findEmptyCell(grid);
  
  // If no empty cell is found, the puzzle is solved
  if (!emptyCell) {
    return true;
  }

  const [row, col] = emptyCell;

  // Try placing each number 1-9
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(grid, row, col, num)) {
      // Place the number
      grid[row][col] = num;

      // Recursively try to solve the rest of the puzzle
      if (solveSudoku(grid)) {
        return true;
      }

      // If placing the number didn't lead to a solution, backtrack
      grid[row][col] = null;
    }
  }

  // No solution found with any number
  return false;
};

/**
 * Checks if a Sudoku grid is valid (doesn't have any conflicts)
 */
export const isValidGrid = (grid: SudokuGrid): boolean => {
  // Check each cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = grid[row][col];
      
      // Skip empty cells
      if (value === null) continue;
      
      // Temporarily set cell to null to check if value conflicts with other cells
      grid[row][col] = null;
      
      // Check if placing the value back would be valid
      const isValid = isValidPlacement(grid, row, col, value);
      
      // Restore the value
      grid[row][col] = value;
      
      if (!isValid) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Gets all conflicts in the grid
 * Returns array of [row, col] positions that have conflicts
 */
export const getConflicts = (grid: SudokuGrid): [number, number][] => {
  const conflicts: [number, number][] = [];
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = grid[row][col];
      
      if (value === null) continue;
      
      // Temporarily set cell to null to check if value conflicts with other cells
      grid[row][col] = null;
      
      // Check if placing the value back would be valid
      const isValid = isValidPlacement(grid, row, col, value);
      
      // Restore the value
      grid[row][col] = value;
      
      if (!isValid) {
        conflicts.push([row, col]);
      }
    }
  }
  
  return conflicts;
};

/**
 * Gets all cells that share a row, column, or box with the given cell
 */
export const getRelatedCells = (row: number, col: number): [number, number][] => {
  const relatedCells: [number, number][] = [];
  
  // Add cells in the same row
  for (let c = 0; c < 9; c++) {
    if (c !== col) {
      relatedCells.push([row, c]);
    }
  }
  
  // Add cells in the same column
  for (let r = 0; r < 9; r++) {
    if (r !== row) {
      relatedCells.push([r, col]);
    }
  }
  
  // Add cells in the same 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const newRow = boxRow + r;
      const newCol = boxCol + c;
      if (newRow !== row || newCol !== col) {
        relatedCells.push([newRow, newCol]);
      }
    }
  }
  
  return relatedCells;
};

/**
 * Generate a Sudoku puzzle with the specified difficulty level
 * Difficulty determines how many cells are revealed (higher = harder)
 */
export const generatePuzzle = (difficulty: 'easy' | 'medium' | 'hard' | 'expert'): SudokuGrid => {
  // Create a solved grid first
  const solvedGrid = createEmptyGrid();
  solveSudoku(solvedGrid);
  
  // Clone the solved grid
  const puzzle = copyGrid(solvedGrid);
  
  // Define how many cells to remove based on difficulty
  const cellsToRemove = {
    easy: 40,    // 41 clues remain
    medium: 50,  // 31 clues remain
    hard: 55,    // 26 clues remain
    expert: 60   // 21 clues remain
  };
  
  // Create an array of all positions
  const positions: [number, number][] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col]);
    }
  }
  
  // Shuffle the positions array
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Remove cells one by one according to difficulty
  const numToRemove = cellsToRemove[difficulty];
  let removed = 0;
  
  for (let i = 0; i < positions.length && removed < numToRemove; i++) {
    const [row, col] = positions[i];
    const value = puzzle[row][col];
    
    // Try removing this cell
    puzzle[row][col] = null;
    
    // Check if the puzzle still has a unique solution
    const testGrid = copyGrid(puzzle);
    if (hasUniqueSolution(testGrid)) {
      removed++;
    } else {
      // If no unique solution, put the value back
      puzzle[row][col] = value;
    }
  }
  
  return puzzle;
};

/**
 * Check if a puzzle has a unique solution
 * This is a simplified version and may not be completely accurate for all puzzles
 */
export const hasUniqueSolution = (grid: SudokuGrid): boolean => {
  const emptyCells = [];
  
  // Find all empty cells
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        emptyCells.push([row, col]);
      }
    }
  }
  
  // If no empty cells, it has a unique solution
  if (emptyCells.length === 0) {
    return true;
  }
  
  // Try the first empty cell
  const [row, col] = emptyCells[0];
  let solutionCount = 0;
  
  for (let num = 1; num <= 9 && solutionCount < 2; num++) {
    if (isValidPlacement(grid, row, col, num)) {
      grid[row][col] = num;
      
      // Recursively check if this leads to a solution
      if (solveSudoku(copyGrid(grid))) {
        solutionCount++;
      }
      
      grid[row][col] = null;
    }
  }
  
  return solutionCount === 1;
};

/**
 * Gets a hint for the current puzzle state
 * Returns [row, col, value] for a hint, or null if no hint is available
 */
export const getHint = (grid: SudokuGrid): [number, number, number] | null => {
  // Create a copy of the grid
  const workingGrid = copyGrid(grid);
  
  // Check if the puzzle is solvable
  if (!solveSudoku(workingGrid)) {
    return null;
  }
  
  // Find the first empty cell in the original grid
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        return [row, col, workingGrid[row][col]!];
      }
    }
  }
  
  return null;
};

/**
 * Predefined Sudoku puzzles for different difficulty levels
 */
export const PREDEFINED_PUZZLES = {
  easy: [
    [5, 3, null, null, 7, null, null, null, null],
    [6, null, null, 1, 9, 5, null, null, null],
    [null, 9, 8, null, null, null, null, 6, null],
    [8, null, null, null, 6, null, null, null, 3],
    [4, null, null, 8, null, 3, null, null, 1],
    [7, null, null, null, 2, null, null, null, 6],
    [null, 6, null, null, null, null, 2, 8, null],
    [null, null, null, 4, 1, 9, null, null, 5],
    [null, null, null, null, 8, null, null, 7, 9]
  ],
  medium: [
    [null, null, null, 2, 6, null, 7, null, 1],
    [6, 8, null, null, 7, null, null, 9, null],
    [1, 9, null, null, null, 4, 5, null, null],
    [8, 2, null, 1, null, null, null, 4, null],
    [null, null, 4, 6, null, 2, 9, null, null],
    [null, 5, null, null, null, 3, null, 2, 8],
    [null, null, 9, 3, null, null, null, 7, 4],
    [null, 4, null, null, 5, null, null, 3, 6],
    [7, null, 3, null, 1, 8, null, null, null]
  ],
  hard: [
    [null, null, null, 6, null, null, 4, null, null],
    [7, null, null, null, null, 3, 6, null, null],
    [null, null, null, null, 9, 1, null, 8, null],
    [null, null, null, null, null, null, null, null, null],
    [null, 5, null, 1, 8, null, null, null, 3],
    [null, null, null, 3, null, 6, null, 4, 5],
    [null, 4, null, 2, null, null, null, 6, null],
    [9, null, 3, null, null, null, null, null, null],
    [null, 2, null, null, null, null, 1, null, null]
  ],
  expert: [
    [null, 2, null, null, null, null, null, null, null],
    [null, null, null, 6, null, null, null, null, 3],
    [null, 7, 4, null, 8, null, null, null, null],
    [null, null, null, null, null, 3, null, null, 2],
    [null, 8, null, null, 4, null, null, 1, null],
    [6, null, null, 5, null, null, null, null, null],
    [null, null, null, null, 1, null, 7, 8, null],
    [5, null, null, null, null, 9, null, null, null],
    [null, null, null, null, null, null, null, 4, null]
  ]
} as Record<string, number[][]>;

// Convert the predefined puzzles to use null instead of 0
Object.keys(PREDEFINED_PUZZLES).forEach(key => {
  const puzzle = PREDEFINED_PUZZLES[key as keyof typeof PREDEFINED_PUZZLES];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] === 0) {
        // Convert 0 to null, but with proper type casting
        puzzle[row][col] = null as unknown as number;
      }
    }
  }
});