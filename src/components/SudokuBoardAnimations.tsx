/**
 * Sudoku Board Animation Manager
 * Connects the animation utilities with the Sudoku board component
 */
import React, { useEffect, useRef } from 'react';
import { 
  createConfetti, 
  createParticleBurst, 
  createRippleEffect, 
  createSuccessCheckmark,
  add3DTiltEffect,
  createCelebrationBurst,
  createLoadingSpinner,
  addBounceEffect
} from '../utils/animationUtils';

import {
  animateBoardInitialization,
  animateNumberEntry,
  animateHintReveal,
  celebratePuzzleCompletion,
  animateSolving,
  highlightRelatedCells,
  animateError
} from '../utils/sudokuAnimations';

interface SudokuBoardAnimationsProps {
  boardRef: React.RefObject<HTMLDivElement>;
  cellRefs: React.RefObject<Array<Array<HTMLElement | null>>>;
  isComplete: boolean;
  isPuzzleSolved: boolean;
  isBoardInitialized: boolean;
  onBoardInitialized: () => void;
}

/**
 * Component to manage and trigger animations for the Sudoku board
 */
const SudokuBoardAnimations: React.FC<SudokuBoardAnimationsProps> = ({
  boardRef,
  cellRefs,
  isComplete,
  isPuzzleSolved,
  isBoardInitialized,
  onBoardInitialized
}) => {
  const animationsTriggeredRef = useRef({
    celebrationTriggered: false,
    boardInitialized: false
  });

  // Board initialization animation
  useEffect(() => {
    if (!isBoardInitialized && cellRefs.current && !animationsTriggeredRef.current.boardInitialized) {
      // Create a proper 2D array from the refs
      const cells: HTMLElement[][] = [];
      
      // Make sure all refs are populated
      let allRefsPopulated = true;
      for (let row = 0; row < 9; row++) {
        const rowArray: HTMLElement[] = [];
        for (let col = 0; col < 9; col++) {
          const cell = cellRefs.current[row][col];
          if (cell) {
            rowArray.push(cell);
          } else {
            allRefsPopulated = false;
            break;
          }
        }
        if (!allRefsPopulated) break;
        cells.push(rowArray);
      }
      
      if (allRefsPopulated) {
        // Animate board initialization
        animationsTriggeredRef.current.boardInitialized = true;
        animateBoardInitialization(cells).then(() => {
          onBoardInitialized();
        });
      }
    }
  }, [isBoardInitialized, cellRefs, onBoardInitialized]);

  // Celebration animation when puzzle is solved
  useEffect(() => {
    if (isPuzzleSolved && isComplete && !animationsTriggeredRef.current.celebrationTriggered) {
      animationsTriggeredRef.current.celebrationTriggered = true;

      // Access the board element
      if (boardRef.current) {
        // Celebrate with various effects
        celebratePuzzleCompletion(boardRef.current);
        
        // Add success checkmark
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
        
        createSuccessCheckmark(container);
        
        // Remove container after animation
        setTimeout(() => {
          document.body.removeChild(container);
        }, 4000);
      }
    }
  }, [isPuzzleSolved, isComplete, boardRef]);

  // Apply 3D tilt effect to the board
  useEffect(() => {
    if (boardRef.current) {
      add3DTiltEffect(boardRef.current);
    }
  }, [boardRef]);

  // Apply bounce effect to buttons
  useEffect(() => {
    const buttons = document.querySelectorAll('.number-pad-button');
    buttons.forEach(button => {
      addBounceEffect(button as HTMLElement);
    });
  }, []);

  // Return null as this is just a controller component
  return null;
};

// Utility functions to be used outside the component
export const animateNumberInput = (
  row: number, 
  col: number, 
  value: number,
  cellRefs: Array<Array<HTMLElement | null>>,
  isCorrect: boolean = true
) => {
  const cell = cellRefs[row][col];
  if (cell) {
    animateNumberEntry(cell, value, isCorrect);
  }
};

export const animateHint = (
  row: number,
  col: number,
  value: number,
  cellRefs: Array<Array<HTMLElement | null>>
) => {
  const cell = cellRefs[row][col];
  if (cell) {
    animateHintReveal(cell, value);
  }
};

export const showLoadingSpinner = () => {
  // Create a fixed-position container that won't disrupt layout
  const container = document.createElement('div');
  container.className = 'loading-overlay';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.zIndex = '1000';
  container.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
  container.style.pointerEvents = 'none'; // Allow clicking through
  
  // Save current scroll position
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  
  document.body.appendChild(container);
  
  // Create the spinner
  const removeSpinner = createLoadingSpinner(container);
  
  // Return a function that removes the spinner and also restores scroll position
  return () => {
    removeSpinner();
    
    // Also remove the container
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    // Restore scroll position
    window.scrollTo(scrollX, scrollY);
  };
};

export const triggerError = (
  row: number,
  col: number,
  cellRefs: Array<Array<HTMLElement | null>>
) => {
  const cell = cellRefs[row][col];
  if (cell) {
    animateError(cell);
  }
};

export default SudokuBoardAnimations;