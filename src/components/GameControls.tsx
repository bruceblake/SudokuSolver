import React, { useRef, useEffect } from 'react';
import { createRippleEffect, addBounceEffect } from '../utils/animationUtils';

interface GameControlsProps {
  onNewGame: () => void;
  onSolve: () => void;
  onHint: () => void;
  onReset: () => void;
  onDifficultyChange: (difficulty: string) => void;
  currentDifficulty: string;
  isSolved: boolean;
  isLoading: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onSolve,
  onHint,
  onReset,
  onDifficultyChange,
  currentDifficulty,
  isSolved,
  isLoading,
}) => {
  // We'll completely remove the refs and simplify button handling
  // to eliminate any potential sources of bugs

  // Direct button click handler - no animations, just functionality
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    // Log the click for debugging
    console.log("Button clicked:", e.currentTarget.textContent);
    
    // Execute the action directly - no delays, no animations for now
    // until we get the core functionality working
    action();
  };

  return (
    <div className="app-card">
      <h2 style={{fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-gray-700)'}}>Game Controls</h2>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
          <button 
            className="btn btn-primary"
            style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}} 
            onClick={(e) => handleButtonClick(e, onNewGame)}
            disabled={isLoading}
            data-testid="new-game-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{width: '1.25rem', height: '1.25rem'}} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            New Game
          </button>
          <button 
            className="btn btn-secondary"
            style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}} 
            onClick={(e) => handleButtonClick(e, onSolve)}
            disabled={isSolved || isLoading}
            data-testid="solve-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{width: '1.25rem', height: '1.25rem'}} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Solve
          </button>
        </div>
        
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
          <button 
            className="btn btn-outline"
            style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}} 
            onClick={(e) => handleButtonClick(e, onHint)}
            disabled={isSolved || isLoading}
            data-testid="hint-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{width: '1.25rem', height: '1.25rem'}} viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 010-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 010-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            Hint
          </button>
          <button 
            className="btn btn-outline"
            style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}} 
            onClick={(e) => handleButtonClick(e, onReset)}
            disabled={isLoading}
            data-testid="reset-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{width: '1.25rem', height: '1.25rem'}} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M3.008 11.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reset
          </button>
        </div>
        
        <div style={{marginTop: '0.75rem'}}>
          <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-gray-700)', marginBottom: '0.5rem'}}>
            Difficulty Level
          </label>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem'}}>
            {['easy', 'medium', 'hard', 'expert'].map((difficulty) => (
              <button
                key={difficulty}
                className={currentDifficulty === difficulty ? 'btn btn-primary' : 'btn btn-outline'}
                style={{
                  fontSize: '0.875rem', 
                  textTransform: 'capitalize',
                  boxShadow: currentDifficulty === difficulty ? '0 1px 3px rgba(0,0,0,0.12)' : 'none'
                }}
                onClick={(e) => handleButtonClick(e, () => onDifficultyChange(difficulty))}
                disabled={isLoading}
                data-testid={`difficulty-${difficulty}`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {isLoading && (
        <div style={{marginTop: '1rem', display: 'flex', justifyContent: 'center'}}>
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default GameControls;