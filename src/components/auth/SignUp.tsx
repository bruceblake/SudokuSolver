import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SignUpProps {
  onSwitchToLogin: () => void;
  onSignUpSuccess: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToLogin, onSignUpSuccess }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      await signUp(email, password, displayName);
      onSignUpSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <h2 className="app-title">Sign Up</h2>
      
      {error && (
        <div className="error-message" style={{
          backgroundColor: 'rgba(248, 113, 113, 0.2)', 
          color: '#b91c1c',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            type="text"
            className="form-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ marginTop: '1rem' }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="auth-switch">
        Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Login</a>
      </div>
    </div>
  );
};

export default SignUp;