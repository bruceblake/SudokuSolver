import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import AuthModal from './auth/AuthModal';
import UserProfile from './profile/UserProfile';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  return (
    <header style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '1rem',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <ThemeToggle />
        
        {currentUser ? (
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text)',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div 
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {currentUser.displayName?.charAt(0) || 'U'}
            </div>
            <span>{currentUser.displayName}</span>
          </button>
        ) : (
          <button 
            className="btn btn-primary"
            onClick={() => setIsAuthModalOpen(true)}
          >
            Login / Sign Up
          </button>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      
      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setIsProfileModalOpen(false)}
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
            className="modal-content"
            style={{
              width: '100%',
              maxWidth: '32rem',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <UserProfile onClose={() => setIsProfileModalOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;