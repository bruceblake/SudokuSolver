import React, { useEffect, useRef, forwardRef, ForwardedRef } from 'react';
import SudokuCell from './SudokuCell';
import { SudokuGrid, getRelatedCells } from '../utils/sudokuUtils';
import { animateCellSelection } from '../utils/sudokuAnimations';

interface SudokuBoardProps {
  grid: SudokuGrid;
  presetCells: boolean[][];
  conflicts: [number, number][];
  selectedCell: [number, number] | null;
  onCellClick: (row: number, col: number) => void;
  onCellValueChange?: (value: number | null) => void;
  cellRefs?: Array<Array<HTMLElement | null>>;
}

const SudokuBoard = forwardRef<HTMLDivElement, SudokuBoardProps>(({
  grid,
  presetCells,
  conflicts,
  selectedCell,
  onCellClick,
  onCellValueChange,
  cellRefs: externalCellRefs,
}, ref) => {
  // Use forwarded ref for the board
  const internalBoardRef = useRef<HTMLDivElement>(null);
  const resolvedRef = ref || internalBoardRef;
  
  // Use external cell refs if provided, or internal ones otherwise
  const internalCellRefs = useRef<Array<Array<HTMLElement | null>>>(
    Array(9).fill(null).map(() => Array(9).fill(null))
  );
  const cellRefsToUse = externalCellRefs || internalCellRefs.current;
  const prevSelectedCellRef = useRef<[number, number] | null>(null);

  // Get the related cells for highlighting based on the selected cell
  const relatedCells: [number, number][] = selectedCell 
    ? getRelatedCells(selectedCell[0], selectedCell[1])
    : [];
  
  // Create a Set of conflict positions for easier lookup
  const conflictSet = new Set(conflicts.map(([row, col]) => `${row}-${col}`));
  
  // Create a Set of related cell positions for easier lookup
  const relatedCellSet = new Set(relatedCells.map(([row, col]) => `${row}-${col}`));

  // Handle keyboard navigation and input
  useEffect(() => {
    // Get the current board element from resolvedRef
    const boardElement = resolvedRef instanceof HTMLDivElement 
      ? resolvedRef 
      : resolvedRef.current;
    
    if (!boardElement) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      
      const [currentRow, currentCol] = selectedCell;
      
      // Navigation keys
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentRow > 0) onCellClick(currentRow - 1, currentCol);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentRow < 8) onCellClick(currentRow + 1, currentCol);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentCol > 0) onCellClick(currentRow, currentCol - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentCol < 8) onCellClick(currentRow, currentCol + 1);
          break;
        // Number keys
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9':
          e.preventDefault();
          if (onCellValueChange && !presetCells[currentRow][currentCol]) {
            onCellValueChange(parseInt(e.key, 10));
          }
          break;
        // Clear cell
        case 'Backspace':
        case 'Delete':
        case '0':
          e.preventDefault();
          if (onCellValueChange && !presetCells[currentRow][currentCol]) {
            onCellValueChange(null);
          }
          break;
      }
    };

    boardElement.focus();
    boardElement.addEventListener('keydown', handleKeyDown);
    return () => {
      boardElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, onCellClick, onCellValueChange, presetCells, resolvedRef]);

  // Apply animation when selected cell changes
  useEffect(() => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      const currentCell = cellRefsToUse[row][col];
      
      // Get previous cell element
      let prevCell: HTMLElement | null = null;
      if (prevSelectedCellRef.current) {
        const [prevRow, prevCol] = prevSelectedCellRef.current;
        const prevCellRef = cellRefsToUse[prevRow]?.[prevCol];
        prevCell = prevCellRef || null;
      }
      
      // Animate the selection change if both elements exist
      if (currentCell && currentCell !== prevCell) {
        animateCellSelection(prevCell, currentCell);
      }
      
      // Update ref for next change
      prevSelectedCellRef.current = selectedCell;
    }
  }, [selectedCell, cellRefsToUse]);

  // Set up board with keyboard focus and 3D tilt effect
  useEffect(() => {
    // Get the current board element
    const boardElement = resolvedRef instanceof HTMLDivElement 
      ? resolvedRef 
      : resolvedRef.current;
    
    if (boardElement) {
      boardElement.tabIndex = 0; // Make it focusable
      
      // Add 3D wrapper with proper perspective if not already there
      const parent = boardElement.parentElement;
      if (parent && !parent.classList.contains('board-3d-wrapper')) {
        parent.classList.add('board-3d-wrapper');
      }
      
      // Add 3D board class for hover effect
      boardElement.classList.add('board-3d');
    }
  }, [resolvedRef]);

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', userSelect: 'none'}}>
      <div 
        ref={resolvedRef}
        className="sudoku-board animate-stagger-fade-in focus:outline-none focus:ring-2 focus:ring-blue-400"
        data-testid="sudoku-board"
      >
        {grid.map((row, rowIndex) => (
          // React Fragment to avoid unnecessary divs
          <React.Fragment key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => {
              const isSelected = selectedCell !== null && 
                selectedCell[0] === rowIndex && 
                selectedCell[1] === colIndex;
              
              const isHighlighted = relatedCellSet.has(`${rowIndex}-${colIndex}`);
              
              const isConflict = conflictSet.has(`${rowIndex}-${colIndex}`);
              
              const isPreset = presetCells[rowIndex][colIndex];
              
              return (
                <SudokuCell
                  key={`cell-${rowIndex}-${colIndex}`}
                  value={cell}
                  row={rowIndex}
                  col={colIndex}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  isConflict={isConflict}
                  isPreset={isPreset}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  ref={(el: HTMLElement | null) => {
                    if (el) {
                      // Store the element reference in both refs
                      if (externalCellRefs) {
                        externalCellRefs[rowIndex][colIndex] = el;
                      }
                      internalCellRefs.current[rowIndex][colIndex] = el;
                    }
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

// Add display name for debugging
SudokuBoard.displayName = 'SudokuBoard';

export default SudokuBoard;