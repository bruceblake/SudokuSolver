/**
 * @jest-environment jsdom
 */

import {
  highlightRelatedCells,
  animateNumberEntry,
  animateHintReveal,
  celebratePuzzleCompletion,
  animateSolving,
  animateError,
  animateCellSelection,
  animateBoardInitialization
} from './sudokuAnimations';

// Import animation utils to mock them
import * as animationUtils from './animationUtils';

describe('Sudoku Animations', () => {
  beforeEach(() => {
    // Set up document body
    document.body.innerHTML = '';
    
    // Mock animation utility functions
    jest.spyOn(animationUtils, 'createParticleBurst').mockImplementation(() => {});
    jest.spyOn(animationUtils, 'createConfetti').mockImplementation(() => {});
    jest.spyOn(animationUtils, 'createCelebrationBurst').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('highlightRelatedCells adds and removes highlight classes', () => {
    // Create a 9x9 grid of cell elements
    const gridCells = Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => {
        const cell = document.createElement('div');
        document.body.appendChild(cell);
        return cell;
      })
    );
    
    // Highlight cells related to position (4, 4)
    const removeHighlight = highlightRelatedCells(gridCells, 4, 4);
    
    // Check that related cells are highlighted
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        // Cell is related if it's in the same row, column, or 3x3 box
        const isRelated = (
          row === 4 || // Same row
          col === 4 || // Same column
          (Math.floor(row / 3) === Math.floor(4 / 3) && Math.floor(col / 3) === Math.floor(4 / 3)) // Same box
        ) && !(row === 4 && col === 4); // Not the same cell
        
        if (isRelated) {
          expect(gridCells[row][col].classList.contains('bg-blue-100')).toBe(true);
          expect(gridCells[row][col].classList.contains('dark:bg-blue-900/30')).toBe(true);
        } else {
          expect(gridCells[row][col].classList.contains('bg-blue-100')).toBe(false);
          expect(gridCells[row][col].classList.contains('dark:bg-blue-900/30')).toBe(false);
        }
      }
    }
    
    // Remove highlights
    removeHighlight();
    
    // Check that highlights are removed
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        expect(gridCells[row][col].classList.contains('bg-blue-100')).toBe(false);
        expect(gridCells[row][col].classList.contains('dark:bg-blue-900/30')).toBe(false);
      }
    }
  });
  
  test('animateNumberEntry adds number with animation class', () => {
    // Create a cell element
    const cell = document.createElement('div');
    document.body.appendChild(cell);
    
    // Animate a correct number entry
    animateNumberEntry(cell, 5, true);
    
    // Check that the number is added with animation
    expect(cell.textContent).toBe('5');
    expect(cell.querySelector('.animate-number-pop')).not.toBeNull();
    
    // Should call createParticleBurst for correct entries
    expect(animationUtils.createParticleBurst).toHaveBeenCalled();
    
    // Create another cell element for incorrect entry
    const incorrectCell = document.createElement('div');
    document.body.appendChild(incorrectCell);
    
    // Animate an incorrect number entry
    animateNumberEntry(incorrectCell, 3, false);
    
    // Check that the number is added with error styling
    expect(incorrectCell.textContent).toBe('3');
    expect(incorrectCell.querySelector('.text-red-500')).not.toBeNull();
    expect(incorrectCell.classList.contains('animate-shake')).toBe(true);
    
    // Advance timers to remove shake animation
    jest.useFakeTimers();
    jest.advanceTimersByTime(600);
    
    // Shake animation should be removed
    expect(incorrectCell.classList.contains('animate-shake')).toBe(false);
    
    jest.useRealTimers();
  });
  
  test('animateHintReveal adds hint with reveal animation', () => {
    // Create a cell element
    const cell = document.createElement('div');
    document.body.appendChild(cell);
    
    // Animate a hint reveal
    animateHintReveal(cell, 7);
    
    // Check that the hint is added with animation
    expect(cell.textContent).toBe('7');
    expect(cell.classList.contains('animate-reveal-hint')).toBe(true);
    expect(cell.querySelector('.text-purple-600')).not.toBeNull();
    
    // Advance timers to remove animation
    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);
    
    // Animation class should be removed
    expect(cell.classList.contains('animate-reveal-hint')).toBe(false);
    
    jest.useRealTimers();
  });
  
  test('celebratePuzzleCompletion triggers celebrations', () => {
    // Create a board element
    const board = document.createElement('div');
    document.body.appendChild(board);
    
    // Replace getBoundingClientRect to return a valid rectangle
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0
    }));
    
    // Trigger celebration
    celebratePuzzleCompletion(board);
    
    // Should call confetti animation
    expect(animationUtils.createConfetti).toHaveBeenCalled();
    
    // Should call celebration burst multiple times
    expect(animationUtils.createCelebrationBurst).toHaveBeenCalledTimes(8);
    
    // Should add floating and neon animations to the board
    expect(board.classList.contains('animate-float')).toBe(true);
    expect(board.classList.contains('animate-neon')).toBe(true);
    
    // Advance timers to remove animations
    jest.useFakeTimers();
    jest.advanceTimersByTime(6000);
    
    // Animation classes should be removed
    expect(board.classList.contains('animate-float')).toBe(false);
    expect(board.classList.contains('animate-neon')).toBe(false);
    
    jest.useRealTimers();
    
    // Restore original function
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });
  
  test('animateError adds and removes error styling', () => {
    // Create a cell element
    const cell = document.createElement('div');
    document.body.appendChild(cell);
    
    // Trigger error animation
    animateError(cell);
    
    // Should add shake animation and red border
    expect(cell.classList.contains('animate-shake')).toBe(true);
    expect(cell.classList.contains('ring-2')).toBe(true);
    expect(cell.classList.contains('ring-red-500')).toBe(true);
    
    // Advance timers to remove animations
    jest.useFakeTimers();
    jest.advanceTimersByTime(800);
    
    // Animation classes should be removed
    expect(cell.classList.contains('animate-shake')).toBe(false);
    expect(cell.classList.contains('ring-2')).toBe(false);
    expect(cell.classList.contains('ring-red-500')).toBe(false);
    
    jest.useRealTimers();
  });
  
  test('animateCellSelection adds focus styling to new cell and removes from old cell', () => {
    // Create previous and new cell elements
    const prevCell = document.createElement('div');
    const newCell = document.createElement('div');
    document.body.appendChild(prevCell);
    document.body.appendChild(newCell);
    
    // Add selection styling to previous cell
    prevCell.classList.add('ring-2', 'ring-blue-500', 'dark:ring-blue-400', 'animate-cell-focus');
    
    // Animate cell selection
    animateCellSelection(prevCell, newCell);
    
    // Previous cell should lose styling
    expect(prevCell.classList.contains('ring-2')).toBe(false);
    expect(prevCell.classList.contains('ring-blue-500')).toBe(false);
    expect(prevCell.classList.contains('dark:ring-blue-400')).toBe(false);
    expect(prevCell.classList.contains('animate-cell-focus')).toBe(false);
    
    // New cell should gain styling
    expect(newCell.classList.contains('ring-2')).toBe(true);
    expect(newCell.classList.contains('ring-blue-500')).toBe(true);
    expect(newCell.classList.contains('dark:ring-blue-400')).toBe(true);
    expect(newCell.classList.contains('animate-cell-focus')).toBe(true);
  });
  
  test('animateBoardInitialization reveals cells in sequence', async () => {
    // Create a 9x9 grid of cell elements
    const gridCells = Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => {
        const cell = document.createElement('div');
        // Set opacity to 0 initially
        cell.style.opacity = '0';
        document.body.appendChild(cell);
        return cell;
      })
    );
    
    // Create a board element as parent
    const board = document.createElement('div');
    board.className = 'sudoku-board';
    document.body.appendChild(board);
    
    // Add all cells to the board
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        board.appendChild(gridCells[row][col]);
      }
    }
    
    // Replace closest to return the board
    const originalClosest = Element.prototype.closest;
    Element.prototype.closest = jest.fn(() => board);
    
    // Trigger board initialization animation
    const animationPromise = animateBoardInitialization(gridCells);
    
    // Board should have stagger class
    expect(board.classList.contains('animate-stagger-fade-in')).toBe(true);
    
    // Advance timers
    jest.useFakeTimers();
    
    // Simulate animation delays
    for (let i = 0; i < 9; i++) {
      await Promise.resolve();
      jest.advanceTimersByTime(50);
      
      // Check that cells in this group are revealed
      for (let j = i * 9; j < Math.min((i + 1) * 9, 81); j++) {
        const row = Math.floor(j / 9);
        const col = j % 9;
        expect(gridCells[row][col].style.opacity).toBe('1');
      }
    }
    
    // Advance timer to end animation
    jest.advanceTimersByTime(2000);
    
    // Animation class should be removed
    expect(board.classList.contains('animate-stagger-fade-in')).toBe(false);
    
    jest.useRealTimers();
    
    // Restore original function
    Element.prototype.closest = originalClosest;
  });
  
  test('animateSolving animates solution steps with highlights', async () => {
    // Create a 9x9 grid of cell elements
    const gridCells = Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => {
        const cell = document.createElement('div');
        document.body.appendChild(cell);
        return cell;
      })
    );
    
    // Define solution steps
    const solutionSteps = [
      { row: 0, col: 0, value: 5 },
      { row: 1, col: 1, value: 3 },
      { row: 2, col: 2, value: 7 }
    ];
    
    // Spy on highlightRelatedCells
    const highlightSpy = jest.spyOn(window, 'highlightRelatedCells').mockImplementation(
      () => () => {} // Return a dummy cleanup function
    );
    
    // Spy on animateNumberEntry
    const numberEntrySpy = jest.spyOn(window, 'animateNumberEntry').mockImplementation(() => {});
    
    // Animate solving
    await animateSolving(gridCells, solutionSteps);
    
    // Should call highlightRelatedCells for each step
    expect(highlightSpy).toHaveBeenCalledTimes(solutionSteps.length);
    
    // Should call animateNumberEntry for each step
    expect(numberEntrySpy).toHaveBeenCalledTimes(solutionSteps.length);
    
    // Check that the calls were made with correct arguments
    solutionSteps.forEach((step, index) => {
      expect(highlightSpy).toHaveBeenNthCalledWith(index + 1, gridCells, step.row, step.col);
      expect(numberEntrySpy).toHaveBeenNthCalledWith(index + 1, gridCells[step.row][step.col], step.value);
    });
  });
});