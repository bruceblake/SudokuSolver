import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import * as sudokuUtils from './utils/sudokuUtils';

// Mock Firebase
jest.mock('./firebase/config', () => ({
  auth: {
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  },
  db: {},
  googleProvider: {},
}));

// Mock the Firebase service
jest.mock('./firebase/leaderboardService', () => ({
  updateUserStats: jest.fn().mockResolvedValue(true),
  getLeaderboard: jest.fn().mockResolvedValue([]),
}));

// Prevent window scroll issues in tests
window.scrollTo = jest.fn();

describe('App Component', () => {
  const renderApp = () => {
    return render(
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    );
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders the Sudoku board and controls', () => {
    renderApp();
    
    expect(screen.getByText('Sudoku Solver')).toBeInTheDocument();
    expect(screen.getByTestId('sudoku-board')).toBeInTheDocument();
    expect(screen.getByTestId('number-pad')).toBeInTheDocument();
    expect(screen.getByTestId('new-game-button')).toBeInTheDocument();
    expect(screen.getByTestId('solve-button')).toBeInTheDocument();
    expect(screen.getByTestId('hint-button')).toBeInTheDocument();
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });

  test('allows selecting a cell and entering a number', async () => {
    renderApp();
    
    // Find an empty cell (not preset)
    let emptyCellFound = false;
    let emptyCell = null;
    
    for (let row = 0; row < 9 && !emptyCellFound; row++) {
      for (let col = 0; col < 9 && !emptyCellFound; col++) {
        const cell = screen.queryByTestId(`cell-${row}-${col}`);
        if (cell && cell.textContent === '') {
          emptyCell = cell;
          emptyCellFound = true;
          break;
        }
      }
    }
    
    expect(emptyCell).not.toBeNull();
    
    if (emptyCell) {
      // Click the cell to select it
      fireEvent.click(emptyCell);
      
      // Click a number in the number pad
      const numberButton = screen.getByTestId('num-button-5');
      
      await act(async () => {
        fireEvent.click(numberButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // The cell should now contain the number 5
      expect(emptyCell).toHaveTextContent('5');
    }
  });

  test('New Game button starts a new game', async () => {
    const { container } = renderApp();
    
    // Get the current state of the board
    const initialBoard = screen.getByTestId('sudoku-board').innerHTML;
    
    // Mock generatePuzzle to return a predictable grid
    const mockNewGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    mockNewGrid[0][0] = 5; // Add a known value
    
    const spy = jest.spyOn(sudokuUtils, 'generatePuzzle').mockReturnValue(mockNewGrid);
    
    // Click the New Game button
    const newGameButton = screen.getByTestId('new-game-button');
    
    // Act to ensure all state updates happen
    await act(async () => {
      fireEvent.click(newGameButton);
      // Wait for state updates to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    
    // Get the new state of the board
    const newBoard = screen.getByTestId('sudoku-board').innerHTML;
    
    // The board should have changed
    expect(newBoard).not.toBe(initialBoard);
    
    // Cleanup
    spy.mockRestore();
  });

  test('New Game button starts a new game even when puzzle is solved', async () => {
    renderApp();
    
    // Mock a solved state
    const mockSolvedGrid = Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => 1) // Fill with 1s for simplicity
    );
    
    // Create a different grid for the new game
    const mockNewGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    mockNewGrid[0][0] = 5; // Add a known value
    
    // Mock the necessary functions
    const solveGridSpy = jest.spyOn(sudokuUtils, 'solveSudoku').mockImplementation((grid) => {
      // Copy the solved grid to the input grid
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          grid[i][j] = mockSolvedGrid[i][j];
        }
      }
      return true;
    });
    
    const generatePuzzleSpy = jest.spyOn(sudokuUtils, 'generatePuzzle').mockReturnValue(mockNewGrid);
    
    // Click the Solve button to force a solved state
    const solveButton = screen.getByTestId('solve-button');
    
    await act(async () => {
      fireEvent.click(solveButton);
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    // Verify the grid is solved
    expect(screen.queryByText('Congratulations!')).toBeInTheDocument();
    
    // Click the New Game button
    const newGameButton = screen.getByTestId('new-game-button');
    
    await act(async () => {
      fireEvent.click(newGameButton);
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    // Verify the new game is started (congratulations message should disappear)
    expect(screen.queryByText('Congratulations!')).not.toBeInTheDocument();
    
    // Should have a cell with the value 5 (from our mockNewGrid)
    const cell = screen.queryByTestId('cell-0-0');
    expect(cell).toHaveTextContent('5');
    
    // Cleanup
    solveGridSpy.mockRestore();
    generatePuzzleSpy.mockRestore();
  });

  test('Reset button resets the game', async () => {
    renderApp();
    
    // Find an empty cell
    let emptyCellFound = false;
    let emptyCell = null;
    let emptyCellCoords = [0, 0];
    
    for (let row = 0; row < 9 && !emptyCellFound; row++) {
      for (let col = 0; col < 9 && !emptyCellFound; col++) {
        const cell = screen.queryByTestId(`cell-${row}-${col}`);
        if (cell && cell.textContent === '') {
          emptyCell = cell;
          emptyCellCoords = [row, col];
          emptyCellFound = true;
          break;
        }
      }
    }
    
    expect(emptyCell).not.toBeNull();
    
    if (emptyCell) {
      // Click the cell to select it
      fireEvent.click(emptyCell);
      
      // Enter a number
      const numberButton = screen.getByTestId('num-button-5');
      
      await act(async () => {
        fireEvent.click(numberButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // The cell should now contain the number 5
      expect(emptyCell).toHaveTextContent('5');
      
      // Click the Reset button
      const resetButton = screen.getByTestId('reset-button');
      
      await act(async () => {
        fireEvent.click(resetButton);
        await new Promise(resolve => setTimeout(resolve, 300));
      });
      
      // The cell should now be empty again
      const resetCell = screen.queryByTestId(`cell-${emptyCellCoords[0]}-${emptyCellCoords[1]}`);
      expect(resetCell).toHaveTextContent('');
    }
  });

  test('Reset button works when puzzle is solved', async () => {
    renderApp();
    
    // Mock a solved state
    const mockSolvedGrid = Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => 1) // Fill with 1s for simplicity
    );
    
    // Mock the original grid that should be restored on reset
    const mockOriginalGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    mockOriginalGrid[0][0] = 5; // Add a known value
    
    // Mock the necessary functions
    let isGridSolved = false;
    
    const solveGridSpy = jest.spyOn(sudokuUtils, 'solveSudoku').mockImplementation((grid) => {
      // Copy the solved grid to the input grid
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          grid[i][j] = mockSolvedGrid[i][j];
        }
      }
      isGridSolved = true;
      return true;
    });
    
    const generatePuzzleSpy = jest.spyOn(sudokuUtils, 'generatePuzzle').mockReturnValue(mockOriginalGrid);
    
    // Force a new game with our mocked grid
    const newGameButton = screen.getByTestId('new-game-button');
    
    await act(async () => {
      fireEvent.click(newGameButton);
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    
    // Click the Solve button to force a solved state
    const solveButton = screen.getByTestId('solve-button');
    
    await act(async () => {
      fireEvent.click(solveButton);
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    // Verify the grid is solved
    expect(screen.queryByText('Congratulations!')).toBeInTheDocument();
    
    // Click the Reset button
    const resetButton = screen.getByTestId('reset-button');
    
    await act(async () => {
      fireEvent.click(resetButton);
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    // Verify the grid is reset (congratulations message should disappear)
    expect(screen.queryByText('Congratulations!')).not.toBeInTheDocument();
    
    // Should have restored to original grid (cell 0,0 should be 5)
    const cell = screen.queryByTestId('cell-0-0');
    expect(cell).toHaveTextContent('5');
    
    // Cleanup
    solveGridSpy.mockRestore();
    generatePuzzleSpy.mockRestore();
  });

  test('Hint button provides a hint', async () => {
    renderApp();
    
    // Mock getHint to return a predictable hint
    const mockHint: [number, number, number] = [0, 0, 5];
    const getHintSpy = jest.spyOn(sudokuUtils, 'getHint').mockReturnValue(mockHint);
    
    // Click the Hint button
    const hintButton = screen.getByTestId('hint-button');
    
    await act(async () => {
      fireEvent.click(hintButton);
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    
    // After clicking hint, the cell should contain the hint value
    const hintCell = screen.queryByTestId(`cell-${mockHint[0]}-${mockHint[1]}`);
    expect(hintCell).toHaveTextContent(mockHint[2].toString());
    
    // Cleanup
    getHintSpy.mockRestore();
  });

  test('Solve button completes the puzzle', async () => {
    renderApp();
    
    // Mock a solved state
    const mockSolvedGrid = Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => 1) // Fill with 1s for simplicity
    );
    
    // Mock the solve function
    const solveGridSpy = jest.spyOn(sudokuUtils, 'solveSudoku').mockImplementation((grid) => {
      // Copy the solved grid to the input grid
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          grid[i][j] = mockSolvedGrid[i][j];
        }
      }
      return true;
    });
    
    // Count empty cells before solving
    const emptyCellsBefore = document.querySelectorAll('[data-testid^="cell-"]:empty').length;
    
    // Click the Solve button
    const solveButton = screen.getByTestId('solve-button');
    
    await act(async () => {
      fireEvent.click(solveButton);
      // Wait for animation sequence to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
    });
    
    // All cells should now be filled
    const emptyCellsAfter = document.querySelectorAll('[data-testid^="cell-"]:empty').length;
    expect(emptyCellsAfter).toBe(0);
    
    // And the congratulations message should appear
    expect(screen.queryByText('Congratulations!')).toBeInTheDocument();
    
    // Cleanup
    solveGridSpy.mockRestore();
  });

  test('difficulty buttons change the game difficulty', async () => {
    renderApp();
    
    // Get initial board state
    const initialBoard = screen.getByTestId('sudoku-board').innerHTML;
    
    // Mock generatePuzzle to return a predictable grid
    const mockNewGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    mockNewGrid[0][0] = 9; // Add a known value
    
    const spy = jest.spyOn(sudokuUtils, 'generatePuzzle').mockReturnValue(mockNewGrid);
    
    // Change difficulty to hard
    const hardButton = screen.getByTestId('difficulty-hard');
    
    await act(async () => {
      fireEvent.click(hardButton);
      // Wait for new game to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    // Board should have changed
    const newBoard = screen.getByTestId('sudoku-board').innerHTML;
    expect(newBoard).not.toBe(initialBoard);
    
    // Should have a cell with the value 9 (from our mockNewGrid)
    const cell = screen.queryByTestId('cell-0-0');
    expect(cell).toHaveTextContent('9');
    
    // Cleanup
    spy.mockRestore();
  });

  test('keyboard navigation works on the board', async () => {
    renderApp();
    
    // Select a cell first
    const cell = await screen.findByTestId('cell-0-0');
    fireEvent.click(cell);
    
    // Use keyboard to navigate
    const board = screen.getByTestId('sudoku-board');
    
    // Move right
    fireEvent.keyDown(board, { key: 'ArrowRight' });
    
    // Enter a number
    fireEvent.keyDown(board, { key: '5' });
    
    // Check if cell-0-1 now has the value 5
    const nextCell = await screen.findByTestId('cell-0-1');
    expect(nextCell).toHaveTextContent('5');
  });

  test('should handle conflicting entries correctly', async () => {
    renderApp();
    
    // Create a conflict by entering the same number in the same row
    // First, find two empty cells in the same row
    let firstCell = null;
    let secondCell = null;
    
    for (let row = 0; row < 9; row++) {
      let emptyCellsInRow = 0;
      
      for (let col = 0; col < 9; col++) {
        const cell = screen.queryByTestId(`cell-${row}-${col}`);
        if (cell && cell.textContent === '') {
          if (emptyCellsInRow === 0) {
            firstCell = cell;
          } else if (emptyCellsInRow === 1) {
            secondCell = cell;
            break;
          }
          emptyCellsInRow++;
        }
      }
      
      if (firstCell && secondCell) break;
    }
    
    if (firstCell && secondCell) {
      // Click the first cell and enter a number
      fireEvent.click(firstCell);
      const numberButton = screen.getByTestId('num-button-5');
      
      await act(async () => {
        fireEvent.click(numberButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Click the second cell and enter the same number
      fireEvent.click(secondCell);
      
      await act(async () => {
        fireEvent.click(numberButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Both cells should have the number 5
      expect(firstCell).toHaveTextContent('5');
      expect(secondCell).toHaveTextContent('5');
      
      // Both cells should be marked as conflicts
      // This relies on your implementation of marking conflicts in the DOM
      expect(firstCell.className).toContain('conflict');
      expect(secondCell.className).toContain('conflict');
    }
  });
});