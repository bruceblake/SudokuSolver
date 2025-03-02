import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, getUserBestEntries, UserProfile as UserProfileType } from '../../firebase/leaderboardService';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { currentUser, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'best'>('stats');
  const [bestEntries, setBestEntries] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch user profile
        const userProfile = await getUserProfile(currentUser.uid);
        if (userProfile) {
          setProfile(userProfile);
        }
        
        // Fetch user's best entries
        const entries = await getUserBestEntries(currentUser.uid);
        setBestEntries(entries);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);
  
  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };
  
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!currentUser) {
    return (
      <div className="auth-container">
        <h2 className="app-title">Profile</h2>
        <p className="text-center">Please log in to view your profile.</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="auth-container">
        <h2 className="app-title">Profile</h2>
        <div className="flex justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auth-container">
      <h2 className="app-title">Your Profile</h2>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
              {(currentUser.displayName || 'A').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <h3 className="profile-name">{currentUser.displayName || 'Anonymous'}</h3>
          <div className="profile-stats">
            <span>{profile?.gamesPlayed || 0} games played</span>
            <span>{profile?.gamesWon || 0} wins</span>
          </div>
        </div>
      </div>
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </div>
        <div 
          className={`tab ${activeTab === 'best' ? 'active' : ''}`}
          onClick={() => setActiveTab('best')}
        >
          Best Times
        </div>
      </div>
      
      {activeTab === 'stats' && (
        <div className="stats-tab">
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-item">
              <span className="stat-label">Games Played</span>
              <span className="stat-value">{profile?.gamesPlayed || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Games Won</span>
              <span className="stat-value">{profile?.gamesWon || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">
                {profile?.gamesPlayed 
                  ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Play Time</span>
              <span className="stat-value">{formatTime(profile?.totalPlayTime || 0)}</span>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'best' && (
        <div className="best-times-tab">
          <table className="leaderboard">
            <thead>
              <tr>
                <th>Difficulty</th>
                <th>Best Time</th>
                <th>Moves</th>
                <th>Hints</th>
              </tr>
            </thead>
            <tbody>
              {['easy', 'medium', 'hard', 'expert'].map(difficulty => {
                const entry = bestEntries[difficulty];
                return (
                  <tr key={difficulty}>
                    <td>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</td>
                    <td>{entry ? formatTime(entry.timeElapsed) : '--:--'}</td>
                    <td>{entry ? entry.movesCount : '--'}</td>
                    <td>{entry ? entry.hintsUsed : '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-8">
        <button
          className="btn btn-primary w-full"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;