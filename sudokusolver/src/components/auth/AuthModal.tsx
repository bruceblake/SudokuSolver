import React, { useState, useRef, useEffect } from 'react';
import Login from './Login';
import SignUp from './SignUp';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Trap focus inside modal when open - ALWAYS define hooks, even if modal is closed
  useEffect(() => {
    if (!isOpen) return; // Early return if modal is not open
    
    // Focus the first input after the modal opens
    const focusTimer = setTimeout(() => {
      const firstInput = modalRef.current?.querySelector('input') as HTMLElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
    
    // Trap focus inside modal
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        
        if (!focusableElements || focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // If shift+tab and on first element, move to last element
        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } 
        // If tab and on last element, move to first element
        else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
      
      // Close modal on escape key
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    
    // Clean up on unmount or when modal closes
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, onClose]);
  
  // Return null if modal is not open - but AFTER defining all hooks
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation(); // Prevent event propagation
      onClose();
    }
  };
  
  const handleAuthSuccess = () => {
    onClose();
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
        ref={modalRef}
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '28rem',
          maxHeight: '90vh',
          overflow: 'auto',
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--color-border)'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent click from reaching backdrop
      >
        {isLoginView ? (
          <Login 
            onSwitchToSignUp={() => setIsLoginView(false)} 
            onLoginSuccess={handleAuthSuccess} 
          />
        ) : (
          <SignUp 
            onSwitchToLogin={() => setIsLoginView(true)}
            onSignUpSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;