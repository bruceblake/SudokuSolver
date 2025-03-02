import React, { useState, useEffect } from 'react';
import { getLeaderboard, LeaderboardEntry } from '../../firebase/leaderboardService';

interface LeaderboardProps {
  selectedDifficulty: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ selectedDifficulty }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard(selectedDifficulty);
        setEntries(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Error loading leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [selectedDifficulty]);
  
  // Format time as minutes and seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (err) {
      return 'Invalid date';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        {error}
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <div className="p-4 bg-gray-100 text-gray-600 rounded-lg text-center">
        No entries yet for {selectedDifficulty} difficulty. Be the first to complete a puzzle and get on the leaderboard!
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-center">
        Leaderboard - {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
      </h3>
      
      <div className="overflow-x-auto">
        <table className="leaderboard">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Time</th>
              <th>Moves</th>
              <th>Hints</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id}>
                <td>
                  <span className={`user-rank rank-${index + 1}`}>
                    {index + 1}
                  </span>
                </td>
                <td>{entry.userName}</td>
                <td>{formatTime(entry.timeElapsed)}</td>
                <td>{entry.movesCount}</td>
                <td>{entry.hintsUsed}</td>
                <td>{formatDate(entry.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;