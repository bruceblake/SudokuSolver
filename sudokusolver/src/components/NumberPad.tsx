import React from 'react';

interface NumberPadProps {
  onNumberClick: (num: number | null) => void;
  disabled: boolean;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, disabled }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Simplified direct handler with logging
  const handleNumberClick = (e: React.MouseEvent<HTMLButtonElement>, num: number | null) => {
    console.log("Number clicked:", num);
    
    // Call the handler immediately - no animations, no delays
    onNumberClick(num);
  };

  return (
    <div className="app-card" data-testid="number-pad-container">
      <h2 style={{fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--color-gray-700)'}}>Enter Number</h2>
      <div className="number-pad" data-testid="number-pad">
        {numbers.map((num, index) => (
          <button
            key={`num-${num}`}
            className="number-pad-button"
            onClick={(e) => handleNumberClick(e, num)}
            disabled={disabled}
            aria-label={`Number ${num}`}
            data-testid={`num-button-${num}`}
          >
            {num}
          </button>
        ))}
        <button
          className="number-pad-button"
          style={{backgroundColor: 'var(--color-gray-200)'}}
          onClick={(e) => handleNumberClick(e, null)}
          disabled={disabled}
          aria-label="Clear cell"
          data-testid="erase-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{width: '1.5rem', height: '1.5rem', margin: '0 auto'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div style={{marginTop: '0.75rem', height: '1.5rem'}}>
        {disabled && (
          <p style={{fontSize: '0.875rem', color: 'var(--color-gray-500)', textAlign: 'center'}}>
            This cell cannot be modified
          </p>
        )}
        {!disabled && (
          <p style={{fontSize: '0.875rem', color: 'var(--color-primary)', textAlign: 'center'}}>
            Select a number to place in the highlighted cell
          </p>
        )}
      </div>
    </div>
  );
};

export default NumberPad;