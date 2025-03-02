import React, { useState, useEffect, forwardRef } from 'react';
import { createParticleBurst, createRippleEffect } from '../utils/animationUtils';

interface SudokuCellProps {
  value: number | null;
  row: number;
  col: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isConflict: boolean;
  isPreset: boolean;
  onClick: () => void;
}

const SudokuCell = forwardRef<HTMLDivElement, SudokuCellProps>(({
  value,
  row,
  col,
  isSelected,
  isHighlighted,
  isConflict,
  isPreset,
  onClick,
}, ref) => {
  // Determine if this cell is at a box boundary (every 3rd cell)
  const isRightBorder = col % 3 === 2 && col < 8;
  const isBottomBorder = row % 3 === 2 && row < 8;
  
  // Animation when value changes
  const [animate, setAnimate] = useState(false);
  const [prevValue, setPrevValue] = useState<number | null>(value);
  
  useEffect(() => {
    if (value !== prevValue && value !== null) {
      // Create particle effect for correct entries
      if (!isConflict && !isPreset) {
        const element = ref as React.RefObject<HTMLDivElement>;
        if (element && element.current) {
          const rect = element.current.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          createParticleBurst(x, y, '#3b82f6');
        }
      }
      
      // Start animation
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      setPrevValue(value);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue, isPreset, isConflict, ref]);

  // Build the CSS classes
  const cellClasses = [
    'sudoku-cell',
    'ripple', // Add ripple effect class
    isSelected ? 'sudoku-cell-selected' : '',
    isHighlighted && !isSelected ? 'sudoku-cell-highlight' : '',
    isConflict ? 'sudoku-cell-error' : '',
    isPreset ? 'sudoku-cell-preset' : 'sudoku-cell-input',
    isRightBorder ? 'sudoku-cell-right-border' : '',
    isBottomBorder ? 'sudoku-cell-bottom-border' : '',
    animate ? 'animate-number-pop' : '',
    isPreset ? 'font-bold' : '', // Make preset numbers bold
  ].filter(Boolean).join(' ');
  
  // Apply different colors in dark mode
  const textColorClass = 
    isPreset 
      ? 'text-gray-900 dark:text-gray-100' 
      : 'text-blue-600 dark:text-blue-400';

  // For future enhancement: Allow players to add multiple candidate numbers to a cell
  // This would show small numbers in cells where the player is considering multiple options

  return (
    <div 
      ref={ref}
      className={`${cellClasses} ${textColorClass}`}
      onClick={(e) => {
        // Trigger ripple effect
        const element = ref as React.RefObject<HTMLDivElement>;
        if (element && element.current) {
          const rect = element.current.getBoundingClientRect();
          const x = e.clientX;
          const y = e.clientY;
          createRippleEffect(e);
        }
        onClick();
      }}
      data-testid={`cell-${row}-${col}`}
      aria-label={`Cell ${row+1},${col+1} ${value ? `contains ${value}` : 'is empty'}`}
      tabIndex={-1} // Allow tabbing for accessibility
    >
      <span className={animate ? 'inline-block' : ''}>
        {value || ''}
      </span>
    </div>
  );
});

// Add display name for debugging
SudokuCell.displayName = 'SudokuCell';

export default SudokuCell;