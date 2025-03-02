import { useState, useEffect, useCallback, useRef } from 'react';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import GameControls from './components/GameControls';
import GameStats from './components/GameStats';
import Header from './components/Header';
import LeaderboardModal from './components/leaderboard/LeaderboardModal';
import SudokuBoardAnimations, { animateNumberInput, animateHint, showLoadingSpinner, triggerError } from './components/SudokuBoardAnimations';

import { useAuth } from './contexts/AuthContext';
import { updateUserStats } from './firebase/leaderboardService';

import { 
  SudokuGrid, 
  createEmptyGrid, 
  copyGrid, 
  solveSudoku, 
  getConflicts, 
  getHint, 
  PREDEFINED_PUZZLES,
  generatePuzzle
} from './utils/sudokuUtils';
import './App.css';
import './animations.css';

function App() {
  // Global error handling
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const [grid, setGrid] = useState<SudokuGrid>(createEmptyGrid());
  const [originalGrid, setOriginalGrid] = useState<SudokuGrid>(createEmptyGrid());
  const [presetCells, setPresetCells] = useState<boolean[][]>(
    Array(9).fill(null).map(() => Array(9).fill(false))
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [conflicts, setConflicts] = useState<[number, number][]>([]);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [solveAnimation, setSolveAnimation] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [solveProgress, setSolveProgress] = useState<number>(0);
  
  // Refs for animation control
  const boardRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Array<Array<HTMLElement | null>>>(
    Array(9).fill(null).map(() => Array(9).fill(null))
  );
  const [isBoardInitialized, setIsBoardInitialized] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // Check if puzzle is solved
  // This is memoized to prevent unnecessary recalculations and updates
  const checkSolved = useCallback(() => {
    // Early return if we know it's already solved - this helps prevent unnecessary checks
    if (isSolved) return true;
    
    // Puzzle is solved if there are no empty cells and no conflicts
    // First check for empty cells
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) {
          return false;
        }
      }
    }
    
    // Then check for conflicts
    // Note: conflicts state may not be updated yet, so we're checking both
    if (conflicts.length > 0) {
      return false;
    }
    
    return true;
  }, [grid, conflicts, isSolved]);

  // Update conflicts and check solution state
  // Use useRef to store previous grid state to avoid unnecessary updates
  const prevGridRef = useRef<SudokuGrid | null>(null);
  
  useEffect(() => {
    // Only update conflicts if the grid has actually changed
    // Compare current grid with previous grid to avoid unnecessary updates
    const gridChanged = !prevGridRef.current || JSON.stringify(grid) !== JSON.stringify(prevGridRef.current);
    
    if (gridChanged) {
      // Update the previous grid
      prevGridRef.current = copyGrid(grid);
      
      // Update conflicts
      const newConflicts = getConflicts(copyGrid(grid));
      setConflicts(newConflicts);
      
      // Check if puzzle is solved - only run this check if no conflicts exist
      if (newConflicts.length === 0) {
        const solved = checkSolved();
        if (solved && !isSolved) {
          setIsSolved(true);
          setTimerActive(false);
          
          // Celebration animation - confetti will be triggered by SudokuBoardAnimations 
          // when it detects isPuzzleSolved changed to true
          
          // Add extra celebration
          if (boardRef.current) {
            // Create celebration effect at the center of the board
            const rect = boardRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Trigger multiple celebration bursts in sequence
            for (let i = 0; i < 5; i++) {
              setTimeout(() => {
                const offsetX = centerX + (Math.random() * 100 - 50);
                const offsetY = centerY + (Math.random() * 100 - 50);
                import('./utils/animationUtils').then(({ createCelebrationBurst }) => {
                  createCelebrationBurst(offsetX, offsetY);
                });
              }, i * 300);
            }
          }
          
          // Update user stats if logged in
          if (currentUser) {
            updateUserStats(
              currentUser.uid,
              currentUser.displayName || 'Anonymous',
              {
                difficulty,
                timeElapsed,
                movesCount,
                hintsUsed,
                won: true
              }
            ).catch(err => {
              console.error('Error updating user stats:', err);
            });
          }
        }
      }
    }
  }, [grid, checkSolved, isSolved, currentUser, difficulty, timeElapsed, movesCount, hintsUsed]);

  // Handle starting a new game - with specific handling for solved state
  const handleNewGame = useCallback(() => {
    setIsLoading(true);
    console.log("Starting new game with difficulty:", difficulty, "isSolved:", isSolved);
    
    // Force a state reset before creating new grid to break dependency cycles
    if (isSolved) {
      console.log("Game was solved, doing force reset first");
      // Immediately clear solved state to prevent update loops
      setIsSolved(false);
      // Reset other state that might block updates
      setSelectedCell(null);
      setTimerActive(false);
      setSolveAnimation(false);
      // Create an empty grid temporarily to force re-renders
      const emptyGrid = createEmptyGrid();
      setGrid(emptyGrid);
      setPresetCells(Array(9).fill(null).map(() => Array(9).fill(false)));
      setConflicts([]);
    }
    
    // Wait for state reset to complete
    setTimeout(() => {
      try {
        // Get a new grid
        let newGrid;
        if (difficulty in PREDEFINED_PUZZLES) {
          // Use predefined puzzle
          newGrid = copyGrid(PREDEFINED_PUZZLES[difficulty as keyof typeof PREDEFINED_PUZZLES]);
        } else {
          // Generate random puzzle
          newGrid = generatePuzzle(difficulty as 'easy' | 'medium' | 'hard' | 'expert');
        }
        
        // Create preset cells map
        const newPresetCells = Array(9).fill(null).map(() => Array(9).fill(false));
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (newGrid[row][col] !== null) {
              newPresetCells[row][col] = true;
            }
          }
        }
        
        // Reset all game state in clear order to avoid race conditions
        setSelectedCell(null);
        setConflicts([]);
        setSolveProgress(0);
        setSolveAnimation(false);
        setIsSolved(false); // Explicitly ensure solved state is reset
        setTimeElapsed(0);
        setMovesCount(0);
        setHintsUsed(0);
        
        // Assign grid and related state
        setOriginalGrid(copyGrid(newGrid));
        setGrid(newGrid);
        setPresetCells(newPresetCells);
        
        // Start the timer after state updates
        setTimeout(() => {
          // Double check we're still not in a solved state
          if (!isSolved) {
            setTimerActive(true);
          }
        }, 100);
        
        console.log("New game started successfully");
      } catch (error) {
        console.error('Error starting new game:', error);
        setGlobalError("Failed to start new game: " + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsLoading(false);
      }
    }, 50); // Short delay to ensure state resets properly
  }, [difficulty, isSolved]);

  // Initialize game on first load
  useEffect(() => {
    handleNewGame();
  }, [handleNewGame]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // Don't allow selection if the puzzle is solved
    if (isSolved) return;
    
    setSelectedCell([row, col]);
  };

  // Handle number input
  const handleNumberInput = (num: number | null) => {
    if (!selectedCell || isSolved) return;
    
    const [row, col] = selectedCell;
    
    // Don't allow changing preset cells
    if (presetCells[row][col]) return;
    
    // Update grid
    const newGrid = copyGrid(grid);
    newGrid[row][col] = num;
    setGrid(newGrid);
    
    // Increment moves counter
    setMovesCount(prev => prev + 1);
    
    // Apply animation when a number is entered
    if (num !== null && cellRefs.current[row][col]) {
      // Check if this creates a conflict
      const newConflicts = getConflicts(newGrid);
      const isCorrect = !newConflicts.some(([r, c]) => r === row && c === col);
      
      // Animate number entry with success/error indication
      animateNumberInput(row, col, num, cellRefs.current, isCorrect);
      
      // If it's an error, trigger error animation
      if (!isCorrect) {
        triggerError(row, col, cellRefs.current);
      }
    }
  };

  // Handle solving the puzzle
  const handleSolve = useCallback(() => {
    if (isSolved) return;
    
    // Prevent default button behavior that might cause scroll issues
    // and use a more subtle indicator instead of a full screen overlay
    setSolveAnimation(true);
    
    // Use requestAnimationFrame to make sure we're not interrupting rendering
    requestAnimationFrame(() => {
      try {
        // Create a copy to solve
        const solutionGrid = copyGrid(grid);
        
        // Attempt to solve
        const solved = solveSudoku(solutionGrid);
        
        if (solved) {
          // Build solution steps - only for empty or incorrect cells
          const solutionSteps = [];
          for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
              // Only include non-preset cells that need to be filled
              if (!presetCells[row][col] && 
                  (grid[row][col] === null || grid[row][col] !== solutionGrid[row][col])) {
                solutionSteps.push({
                  row,
                  col,
                  value: solutionGrid[row][col] as number
                });
              }
            }
          }
          
          // Reset progress indicator
          setSolveProgress(0);
          
          // Create a stable reference to the current grid to avoid closure issues
          const currentGrid = grid;
          
          // Animate the solution with our enhanced utilities
          const animateSolution = (steps: {row: number, col: number, value: number}[], currentIndex: number = 0) => {
            if (currentIndex >= steps.length) {
              setSolveAnimation(false);
              setSolveProgress(0);
              // Explicitly set isSolved to true when all steps are completed
              setIsSolved(true);
              return;
            }
            
            const { row, col, value } = steps[currentIndex];
            
            // Update grid - use a clean copy of the current grid
            const newGrid = copyGrid(currentGrid);
            newGrid[row][col] = value;
            setGrid(newGrid);
            
            // Update progress safely
            setSolveProgress((prev) => {
              const newProgress = (currentIndex + 1) / steps.length;
              return newProgress > prev ? newProgress : prev;
            });
            
            // Animate the cell update using timeout to ensure UI updates
            setTimeout(() => {
              if (cellRefs.current?.[row]?.[col]) {
                // This will trigger the particle effect animation
                animateNumberInput(row, col, value, cellRefs.current, true);
              }
              
              // Continue to next cell after a short delay
              setTimeout(() => {
                // Continue animation
                animateSolution(steps, currentIndex + 1);
              }, 50); // Slightly faster animation
            }, 10);
          };
          
          // Start animation process for solving
          if (solutionSteps.length > 0) {
            animateSolution(solutionSteps);
            // Force check for solved state after animation is done
            setTimeout(() => {
              setIsSolved(checkSolved());
            }, solutionSteps.length * 60 + 100);
          } else {
            // If no steps needed, the puzzle is already solved
            setSolveAnimation(false);
            setIsSolved(true);
          }
        } else {
          alert('No solution exists for the current state of the puzzle.');
          setSolveAnimation(false);
        }
      } catch (error) {
        console.error('Error solving puzzle:', error);
        setSolveAnimation(false);
      }
    });
  }, [grid, presetCells, isSolved, cellRefs]);

  // Handle getting a hint
  const handleHint = useCallback(() => {
    if (isSolved) return;
    
    // Use a less intrusive approach without full screen overlay
    // Just show a subtle animation on the board
    setSolveAnimation(true);
    
    // Use requestAnimationFrame to ensure smooth UI
    requestAnimationFrame(() => {
      // Calculate hint
      const hint = getHint(copyGrid(grid));
      
      if (hint) {
        const [row, col, value] = hint;
        
        // Don't provide hints for preset cells
        if (presetCells[row][col]) {
          setSolveAnimation(false);
          alert('That cell is already filled in correctly.');
          return;
        }
        
        // Update grid with hint - make a clean copy to avoid closure issues
        const newGrid = copyGrid(grid);
        newGrid[row][col] = value;
        setGrid(newGrid);
        
        // Select the cell with the hint
        setSelectedCell([row, col]);
        
        // Increment hints used counter
        setHintsUsed(prev => prev + 1);
        
        // Animate the hint cell with a small delay to ensure UI update
        setTimeout(() => {
          if (cellRefs.current?.[row]?.[col]) {
            animateHint(row, col, value, cellRefs.current);
          }
          setSolveAnimation(false);
        }, 50);
      } else {
        setSolveAnimation(false);
        alert('No hint available. The puzzle may not be solvable in its current state.');
      }
    });
  }, [grid, presetCells, isSolved, cellRefs]);

  // Handle resetting the puzzle - with special handling for solved state
  const handleReset = useCallback(() => {
    console.log("Resetting game... (isSolved:", isSolved, ")");
    
    // Update UI state that we're doing something
    setIsLoading(true);
    
    try {
      // Force a more aggressive reset when game is solved
      if (isSolved) {
        console.log("Game was solved, performing force reset");
        // First reset the solved state flag to break any potential update loops
        setIsSolved(false);
        
        // Stop timer immediately
        setTimerActive(false);
        
        // Temporarily set an empty grid to break any state dependencies
        setGrid(createEmptyGrid());
        
        // Then use a short timeout to ensure state propagation before setting the original grid
        setTimeout(() => {
          // Reset core game stats and flags
          setSelectedCell(null);
          setConflicts([]);
          setSolveProgress(0);
          setSolveAnimation(false);
          setTimeElapsed(0);
          setMovesCount(0);
          setHintsUsed(0);
          
          // Make a fresh deep copy of the original grid
          const freshGrid = copyGrid(originalGrid);
          
          // Set the grid and start the timer
          setGrid(freshGrid);
          
          // Start the timer after a short delay
          setTimeout(() => {
            setTimerActive(true);
            setIsLoading(false);
          }, 50);
          
          console.log("Solved game reset successfully with deep reset");
        }, 50);
      } else {
        // Standard reset for non-solved games
        // Reset all game state in a clear order
        setSelectedCell(null);
        setConflicts([]);
        setSolveProgress(0);
        setSolveAnimation(false);
        setTimeElapsed(0);
        setMovesCount(0);
        setHintsUsed(0);
        
        // Make a fresh deep copy of the original grid
        const freshGrid = copyGrid(originalGrid);
        setGrid(freshGrid);
        
        // Start the timer after a short delay
        setTimeout(() => {
          setTimerActive(true);
          setIsLoading(false);
        }, 50);
        
        console.log("Game reset successfully");
      }
    } catch (error) {
      console.error('Error resetting game:', error);
      setGlobalError("Failed to reset game: " + (error instanceof Error ? error.message : String(error)));
      setIsLoading(false);
    }
  }, [originalGrid, isSolved]);

  // Handle difficulty change
  const handleDifficultyChange = useCallback((newDifficulty: string) => {
    if (difficulty !== newDifficulty) {
      setDifficulty(newDifficulty);
      // Start a new game with the new difficulty
      // Use requestAnimationFrame instead of setTimeout for better performance
      requestAnimationFrame(() => {
        handleNewGame();
      });
    }
  }, [difficulty, handleNewGame]);

  // Handle opening leaderboard
  const handleOpenLeaderboard = useCallback(() => {
    setIsLeaderboardOpen(true);
  }, []);

  return (
    <div className="app-container">
      <Header />

      <div className="text-center">
        <h1 className="app-title">Sudoku Solver</h1>
        <p className="app-subtitle">Play, solve, and learn with our advanced Sudoku solver</p>
      </div>
      
      {/* Global error message - shown if something goes wrong */}
      {globalError && (
        <div 
          className="error-message" 
          style={{
            maxWidth: '600px',
            margin: '1rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{globalError}</span>
          <button 
            onClick={() => setGlobalError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0.25rem',
              marginLeft: '1rem'
            }}
          >
            &times;
          </button>
        </div>
      )}

      <GameStats
        timeElapsed={timeElapsed}
        movesCount={movesCount}
        hintsUsed={hintsUsed}
        isSolved={isSolved}
      />

      <div className="sudoku-container">
        <div className={solveAnimation ? 'animate-solve' : ''}>
          <SudokuBoard
            grid={grid}
            presetCells={presetCells}
            conflicts={conflicts}
            selectedCell={selectedCell}
            onCellClick={handleCellClick}
            onCellValueChange={handleNumberInput}
            ref={boardRef}
            cellRefs={cellRefs.current}
          />
          
          {/* Animation controller component */}
          <SudokuBoardAnimations 
            boardRef={boardRef}
            cellRefs={cellRefs}
            isComplete={checkSolved()}
            isPuzzleSolved={isSolved}
            isBoardInitialized={isBoardInitialized}
            onBoardInitialized={() => setIsBoardInitialized(true)}
          />
          
          {/* Solving progress indicator - only visible during solve operation */}
          {solveAnimation && solveProgress > 0 && (
            <div 
              className="progress-bar" 
              style={{
                height: '4px',
                backgroundColor: 'var(--color-primary)',
                width: `${solveProgress * 100}%`,
                marginTop: '8px',
                borderRadius: '2px',
                transition: 'width 0.1s ease-out'
              }}
            />
          )}
        </div>
        
        <div style={{marginTop: '1.5rem'}}>
          <NumberPad
            onNumberClick={handleNumberInput}
            disabled={!selectedCell || (selectedCell && presetCells[selectedCell[0]][selectedCell[1]]) || isSolved}
          />
        </div>
      </div>

      <GameControls
        onNewGame={handleNewGame}
        onSolve={handleSolve}
        onHint={handleHint}
        onReset={handleReset}
        onDifficultyChange={handleDifficultyChange}
        currentDifficulty={difficulty}
        isSolved={isSolved}
        isLoading={isLoading}
      />

      {isSolved && (
        <div className="app-card animate-celebrate" style={{backgroundColor: '#dcfce7', color: '#15803d', textAlign: 'center'}}>
          <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Congratulations!</h3>
          <p>You've solved the puzzle in {timeElapsed} seconds with {movesCount} moves and {hintsUsed} hints.</p>
          
          <button 
            className="btn btn-primary"
            onClick={handleOpenLeaderboard}
            style={{ marginTop: '1rem' }}
          >
            View Leaderboard
          </button>
        </div>
      )}

      <footer style={{marginTop: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem'}}>
        <p>Built with React and TypeScript. Uses a backtracking algorithm for solving.</p>
        
        <button 
          onClick={handleOpenLeaderboard}
          className="btn btn-outline"
          style={{ marginTop: '1rem' }}
        >
          View Leaderboard
        </button>
      </footer>
      
      {/* Leaderboard Modal */}
      <LeaderboardModal 
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        initialDifficulty={difficulty}
      />
    </div>
  );
}

export default App;