import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginProps {
  onSwitchToSignUp: () => void;
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignUp, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <h2 className="app-title">Login</h2>
      
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
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ marginTop: '1rem' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-switch">
        Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignUp(); }}>Sign up</a>
      </div>
    </div>
  );
};

export default Login;