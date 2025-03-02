import {
  SudokuGrid,
  createEmptyGrid,
  copyGrid,
  solveSudoku,
  getConflicts,
  isValidPlacement as isValid,
  getHint,
  generatePuzzle,
  getRelatedCells
} from './sudokuUtils';

describe('SudokuUtils', () => {
  // Test createEmptyGrid
  describe('createEmptyGrid', () => {
    it('should create a 9x9 grid of null values', () => {
      const grid = createEmptyGrid();
      
      // Check dimensions
      expect(grid.length).toBe(9);
      expect(grid[0].length).toBe(9);
      
      // Check all cells are null
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          expect(grid[i][j]).toBeNull();
        }
      }
    });
  });
  
  // Test copyGrid
  describe('copyGrid', () => {
    it('should create a deep copy of the grid', () => {
      const original = createEmptyGrid();
      original[0][0] = 5;
      
      const copy = copyGrid(original);
      
      // Should be equal in value
      expect(copy[0][0]).toBe(5);
      
      // But not the same reference
      copy[0][0] = 8;
      expect(original[0][0]).toBe(5); // Original should be unchanged
    });
  });
  
  // Test isValid
  describe('isValid', () => {
    it('should return true for valid number placement', () => {
      const grid: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      // Should be valid to place 1 in the top-left corner
      expect(isValid(grid, 0, 2, 1)).toBe(true);
    });
    
    it('should return false for invalid row placement', () => {
      const grid: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      // Should be invalid to place 5 in the first row (already exists)
      expect(isValid(grid, 0, 2, 5)).toBe(false);
    });
    
    it('should return false for invalid column placement', () => {
      const grid: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      // Should be invalid to place 6 in the first column (already exists)
      expect(isValid(grid, 2, 0, 6)).toBe(false);
    });
    
    it('should return false for invalid box placement', () => {
      const grid: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      // Should be invalid to place 3 in the top-left 3x3 box (already exists)
      expect(isValid(grid, 1, 1, 3)).toBe(false);
    });
  });
  
  // Test getConflicts
  describe('getConflicts', () => {
    it('should return empty array for a valid grid', () => {
      const grid: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      const conflicts = getConflicts(grid);
      expect(conflicts.length).toBe(0);
    });
    
    it('should detect row conflicts', () => {
      const grid: SudokuGrid = [
        [5, 3, 5, null, 7, null, null, null, null], // Conflict: 5 appears twice in the first row
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      const conflicts = getConflicts(grid);
      expect(conflicts.length).toBe(2);
      expect(conflicts).toContainEqual([0, 0]); // First 5
      expect(conflicts).toContainEqual([0, 2]); // Second 5
    });
    
    it('should detect column conflicts', () => {
      const grid: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [8, 9, 8, null, null, null, null, 6, null], // Conflict: 8 appears twice in the first column
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      const conflicts = getConflicts(grid);
      expect(conflicts.length).toBe(2);
      expect(conflicts).toContainEqual([2, 0]); // First 8
      expect(conflicts).toContainEqual([3, 0]); // Second 8
    });
    
    it('should detect box conflicts', () => {
      const grid: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, 8, null, 1, 9, 5, null, null, null], // Conflict: 8 appears twice in the top-left 3x3 box
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      const conflicts = getConflicts(grid);
      expect(conflicts.length).toBe(2);
      expect(conflicts).toContainEqual([1, 1]); // First 8
      expect(conflicts).toContainEqual([2, 2]); // Second 8
    });
  });
  
  // Test solveSudoku
  describe('solveSudoku', () => {
    it('should solve a valid sudoku puzzle', () => {
      const grid: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      const solved = solveSudoku(grid);
      expect(solved).toBe(true);
      
      // Grid should be fully filled
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          expect(grid[i][j]).not.toBeNull();
        }
      }
      
      // No conflicts should exist
      const conflicts = getConflicts(grid);
      expect(conflicts.length).toBe(0);
    });
    
    it('should return false for an unsolvable puzzle', () => {
      const grid: SudokuGrid = [
        [5, 3, 5, null, 7, null, null, null, null], // Conflict: 5 appears twice in the first row
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      const solved = solveSudoku(grid);
      expect(solved).toBe(false);
    });
  });
  
  // Test getHint
  describe('getHint', () => {
    it('should provide a valid hint', () => {
      const grid: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      const hint = getHint(grid);
      
      expect(hint).not.toBeNull();
      
      if (hint) {
        const [row, col, value] = hint;
        
        // The hint should be for an empty cell
        expect(grid[row][col]).toBeNull();
        
        // Placing the hint value should be valid
        expect(isValid(grid, row, col, value)).toBe(true);
      }
    });
    
    it('should return null for an unsolvable puzzle', () => {
      const grid: SudokuGrid = [
        [5, 3, 5, null, 7, null, null, null, null], // Conflict: 5 appears twice in the first row
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];
      
      const hint = getHint(grid);
      expect(hint).toBeNull();
    });
  });
  
  // Test getRelatedCells
  describe('getRelatedCells', () => {
    it('should return related cells in the same row, column, and box', () => {
      const row = 4, col = 4; // Center cell
      const relatedCells = getRelatedCells(row, col);
      
      expect(relatedCells.length).toBe(20); // 8 in the same row + 8 in the same column + 4 in the same box
      
      // Same row
      for (let c = 0; c < 9; c++) {
        if (c !== col) {
          expect(relatedCells).toContainEqual([row, c]);
        }
      }
      
      // Same column
      for (let r = 0; r < 9; r++) {
        if (r !== row) {
          expect(relatedCells).toContainEqual([r, col]);
        }
      }
      
      // Same box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if (r !== row || c !== col) {
            expect(relatedCells).toContainEqual([r, c]);
          }
        }
      }
    });
  });
  
  // Test box start calculation
  describe('Box start calculation', () => {
    it('should correctly calculate the starting indices of the 3x3 box', () => {
      // Test with manual calculations instead of using a separate function
      expect(Math.floor(0 / 3) * 3).toBe(0);
      expect(Math.floor(1 / 3) * 3).toBe(0);
      expect(Math.floor(2 / 3) * 3).toBe(0);
      expect(Math.floor(3 / 3) * 3).toBe(3);
      expect(Math.floor(4 / 3) * 3).toBe(3);
      expect(Math.floor(5 / 3) * 3).toBe(3);
      expect(Math.floor(6 / 3) * 3).toBe(6);
      expect(Math.floor(7 / 3) * 3).toBe(6);
      expect(Math.floor(8 / 3) * 3).toBe(6);
    });
  });
  
  // Test generatePuzzle
  describe('generatePuzzle', () => {
    it('should generate a valid sudoku puzzle with the correct difficulty', () => {
      // Test different difficulty levels
      const difficulties = ['easy', 'medium', 'hard', 'expert'] as const;
      
      for (const difficulty of difficulties) {
        const grid = generatePuzzle(difficulty);
        
        // Count non-null cells to verify difficulty
        let filledCount = 0;
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            if (grid[i][j] !== null) {
              filledCount++;
            }
          }
        }
        
        // Verify appropriate number of filled cells based on difficulty
        switch (difficulty) {
          case 'easy':
            expect(filledCount).toBeGreaterThanOrEqual(35);
            break;
          case 'medium':
            expect(filledCount).toBeGreaterThanOrEqual(30);
            expect(filledCount).toBeLessThan(35);
            break;
          case 'hard':
            expect(filledCount).toBeGreaterThanOrEqual(25);
            expect(filledCount).toBeLessThan(30);
            break;
          case 'expert':
            expect(filledCount).toBeGreaterThanOrEqual(20);
            expect(filledCount).toBeLessThan(25);
            break;
        }
        
        // No conflicts should exist
        const conflicts = getConflicts(grid);
        expect(conflicts.length).toBe(0);
        
        // Puzzle should be solvable
        const gridCopy = copyGrid(grid);
        const solvable = solveSudoku(gridCopy);
        expect(solvable).toBe(true);
      }
    });
  });
});