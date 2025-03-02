import React from 'react';

interface GameStatsProps {
  timeElapsed: number;
  movesCount: number;
  hintsUsed: number;
  isSolved: boolean;
}

const GameStats: React.FC<GameStatsProps> = ({
  timeElapsed,
  movesCount,
  hintsUsed,
  isSolved,
}) => {
  // Format time elapsed into minutes and seconds
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-card">
      <h2 style={{fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--color-gray-700)'}}>Game Stats</h2>
      <div className="stats-container">
        <div className="stat-item" style={{backgroundColor: '#eff6ff'}}>
          <span className="stat-label">Time</span>
          <span className="stat-value" style={{color: '#1d4ed8'}} data-testid="time-display">
            {formatTime(timeElapsed)}
          </span>
        </div>
        
        <div className="stat-item" style={{backgroundColor: '#faf5ff'}}>
          <span className="stat-label">Moves</span>
          <span className="stat-value" style={{color: '#7e22ce'}} data-testid="moves-count">
            {movesCount}
          </span>
        </div>
        
        <div className="stat-item" style={{backgroundColor: '#f0fdfa'}}>
          <span className="stat-label">Hints</span>
          <span className="stat-value" style={{color: '#0f766e'}} data-testid="hints-used">
            {hintsUsed}
          </span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Status</span>
          <span 
            className={isSolved ? 'stat-badge stat-badge-success' : 'stat-badge stat-badge-info'}
            data-testid="game-status"
          >
            {isSolved ? 'Solved!' : 'Playing'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameStats;