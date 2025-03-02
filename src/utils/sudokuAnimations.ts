/**
 * Sudoku-specific animation utilities
 */
import { createParticleBurst, createCelebrationBurst, createConfetti } from './animationUtils';

// Highlight related cells (same row, column, box)
export const highlightRelatedCells = (
  gridCells: HTMLElement[][],
  rowIndex: number,
  columnIndex: number,
  highlightClass: string = 'bg-blue-100'
) => {
  const darkModeHighlightClass = 'dark:bg-blue-900/30';
  const cellsToHighlight: HTMLElement[] = [];
  
  // Get box coordinates
  const boxRow = Math.floor(rowIndex / 3) * 3;
  const boxCol = Math.floor(columnIndex / 3) * 3;
  
  // Highlight row
  for (let i = 0; i < 9; i++) {
    if (i !== columnIndex) {
      cellsToHighlight.push(gridCells[rowIndex][i]);
    }
  }
  
  // Highlight column
  for (let i = 0; i < 9; i++) {
    if (i !== rowIndex) {
      cellsToHighlight.push(gridCells[i][columnIndex]);
    }
  }
  
  // Highlight box (3x3 square)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const currentRow = boxRow + r;
      const currentCol = boxCol + c;
      if (currentRow !== rowIndex || currentCol !== columnIndex) {
        cellsToHighlight.push(gridCells[currentRow][currentCol]);
      }
    }
  }
  
  // Apply highlight class
  cellsToHighlight.forEach(cell => {
    cell.classList.add(highlightClass);
    cell.classList.add(darkModeHighlightClass);
  });
  
  // Return function to remove highlights
  return () => {
    cellsToHighlight.forEach(cell => {
      cell.classList.remove(highlightClass);
      cell.classList.remove(darkModeHighlightClass);
    });
  };
};

// Animate entering a number in a cell
export const animateNumberEntry = (
  cellElement: HTMLElement,
  number: number,
  isCorrect: boolean = true
) => {
  // Create a span to animate the number
  const span = document.createElement('span');
  span.className = 'animate-number-pop inline-block';
  span.textContent = number.toString();
  
  // Add correct/incorrect styling
  if (!isCorrect) {
    span.classList.add('text-red-500');
    cellElement.classList.add('animate-shake');
    
    // Remove shake animation after it completes
    setTimeout(() => {
      cellElement.classList.remove('animate-shake');
    }, 600);
  } else {
    // Add subtle particle burst for correct entries
    const rect = cellElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    createParticleBurst(x, y, isCorrect ? '#3b82f6' : '#ef4444');
  }
  
  // Clear cell and add animated number
  cellElement.innerHTML = '';
  cellElement.appendChild(span);
};

// Animate hint reveal
export const animateHintReveal = (cellElement: HTMLElement, number: number) => {
  cellElement.classList.add('animate-reveal-hint');
  
  // Create a span for the number with special styling
  const span = document.createElement('span');
  span.className = 'text-purple-600 dark:text-purple-400 font-bold';
  span.textContent = number.toString();
  
  // Clear cell and add animated number
  cellElement.innerHTML = '';
  cellElement.appendChild(span);
  
  // Remove animation class after it completes
  setTimeout(() => {
    cellElement.classList.remove('animate-reveal-hint');
  }, 1000);
};

// Celebratory animation for puzzle completion
export const celebratePuzzleCompletion = (boardElement: HTMLElement) => {
  // Launch confetti
  createConfetti();
  
  // Add celebration bursts around the board
  const rect = boardElement.getBoundingClientRect();
  
  // Create bursts at different positions around the board
  const burstPositions = [
    { x: rect.left, y: rect.top },
    { x: rect.right, y: rect.top },
    { x: rect.left, y: rect.bottom },
    { x: rect.right, y: rect.bottom },
    { x: rect.left + rect.width / 2, y: rect.top },
    { x: rect.left + rect.width / 2, y: rect.bottom },
    { x: rect.left, y: rect.top + rect.height / 2 },
    { x: rect.right, y: rect.top + rect.height / 2 }
  ];
  
  // Create bursts with staggered timing
  burstPositions.forEach((pos, index) => {
    setTimeout(() => {
      createCelebrationBurst(pos.x, pos.y);
    }, index * 150);
  });
  
  // Add floating animation to the entire board
  boardElement.classList.add('animate-float');
  
  // Add neon glow to the board in dark mode
  boardElement.classList.add('animate-neon');
  
  // Remove animations after some time
  setTimeout(() => {
    boardElement.classList.remove('animate-float');
    boardElement.classList.remove('animate-neon');
  }, 6000);
};

// Animate scanning/solving animation
export const animateSolving = async (
  gridCells: HTMLElement[][],
  solutionSteps: { row: number; col: number; value: number }[]
) => {
  for (const step of solutionSteps) {
    const { row, col, value } = step;
    const cell = gridCells[row][col];
    
    // Highlight related cells
    const removeHighlight = highlightRelatedCells(gridCells, row, col);
    
    // Wait briefly
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Animate number entry
    animateNumberEntry(cell, value);
    
    // Wait before moving to next step
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Remove highlight
    removeHighlight();
  }
};

// Animate error when rules are violated
export const animateError = (cellElement: HTMLElement) => {
  // Add shake animation
  cellElement.classList.add('animate-shake');
  
  // Temporarily add red border
  cellElement.classList.add('ring-2', 'ring-red-500');
  
  // Remove animations after they complete
  setTimeout(() => {
    cellElement.classList.remove('animate-shake');
    cellElement.classList.remove('ring-2', 'ring-red-500');
  }, 800);
};

// Animate cell selection
export const animateCellSelection = (
  previousCell: HTMLElement | null,
  newCell: HTMLElement
) => {
  // Remove selection from previous cell
  if (previousCell) {
    previousCell.classList.remove('ring-2', 'ring-blue-500', 'dark:ring-blue-400');
    previousCell.classList.remove('animate-cell-focus');
  }
  
  // Add selection to new cell
  newCell.classList.add('ring-2', 'ring-blue-500', 'dark:ring-blue-400');
  newCell.classList.add('animate-cell-focus');
};

// Animate board initialization
export const animateBoardInitialization = async (gridCells: HTMLElement[][]) => {
  // Create a flattened list of all cells
  const allCells: HTMLElement[] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      allCells.push(gridCells[row][col]);
    }
  }
  
  // Add stagger class to parent container
  const boardElement = gridCells[0][0].closest('.sudoku-board');
  if (boardElement) {
    boardElement.classList.add('animate-stagger-fade-in');
  }
  
  // Reveal cells in sequence groups
  for (let i = 0; i < allCells.length; i += 9) {
    const cellsGroup = allCells.slice(i, i + 9);
    cellsGroup.forEach(cell => {
      cell.style.opacity = '1';
    });
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // Remove animation class after complete
  setTimeout(() => {
    if (boardElement) {
      boardElement.classList.remove('animate-stagger-fade-in');
    }
  }, 2000);
};