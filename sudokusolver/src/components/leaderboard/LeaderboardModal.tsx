import React, { useState } from 'react';
import Leaderboard from './Leaderboard';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDifficulty: string;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ 
  isOpen, 
  onClose,
  initialDifficulty
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }}
    >
      <div 
        className="modal-content app-card"
        style={{
          width: '100%',
          maxWidth: '42rem',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)'
            }}
          >
            ×
          </button>
        </div>
        
        <div className="tabs">
          {['easy', 'medium', 'hard', 'expert'].map(difficulty => (
            <div 
              key={difficulty}
              className={`tab ${selectedDifficulty === difficulty ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </div>
          ))}
        </div>
        
        <Leaderboard selectedDifficulty={selectedDifficulty} />
      </div>
    </div>
  );
};

export default LeaderboardModal;