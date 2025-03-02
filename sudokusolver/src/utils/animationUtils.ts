/**
 * Animation utilities for the Sudoku app
 */

// Function to create confetti effect
export const createConfetti = () => {
  // Create container if it doesn't exist
  let container = document.querySelector('.confetti-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
  }

  // Clear previous confetti
  container.innerHTML = '';

  // Generate random confetti pieces
  const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#277da1'];
  
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    // Random properties
    const color = colors[Math.floor(Math.random() * colors.length)];
    const leftPosition = Math.random() * 100;
    const width = Math.random() * 10 + 5;
    const height = Math.random() * 10 + 5;
    const delay = Math.random() * 3;
    const duration = Math.random() * 3 + 3;
    
    // Apply styles
    Object.assign(confetti.style, {
      backgroundColor: color,
      left: `${leftPosition}%`,
      width: `${width}px`,
      height: `${height}px`,
      animation: `confetti-fall ${duration}s ease-in-out ${delay}s forwards`
    });
    
    container.appendChild(confetti);
  }
  
  // Remove confetti after animation
  setTimeout(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 8000); // 8 seconds should be enough for all animations to complete
};

// Function to create ripple effect
export const createRippleEffect = (event: React.MouseEvent<HTMLElement>) => {
  const button = event.currentTarget;
  
  // Get the dimensions and position of the button
  const rect = button.getBoundingClientRect();
  
  // Calculate the position of the ripple
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Create the ripple element
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  
  // Set the position and dimensions of the ripple
  Object.assign(ripple.style, {
    position: 'absolute',
    top: `${y}px`,
    left: `${x}px`,
    width: '0',
    height: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none'
  });
  
  // Add the ripple to the button
  button.appendChild(ripple);
  
  // Start the ripple animation
  setTimeout(() => {
    const diagonal = Math.max(rect.width, rect.height) * 2;
    Object.assign(ripple.style, {
      width: `${diagonal}px`,
      height: `${diagonal}px`,
      opacity: '0'
    });
  }, 10);
  
  // Remove the ripple after animation
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
};

// Function to create particle burst effect
export const createParticleBurst = (x: number, y: number, color: string = '#3b82f6') => {
  // Create container if it doesn't exist
  let container = document.querySelector('.particle-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'particle-container';
    document.body.appendChild(container);
  }
  
  // Create particle burst
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 8 + 3;
    const distance = Math.random() * 80 + 40;
    const angle = Math.random() * 360 * (Math.PI / 180);
    const delay = Math.random() * 0.2;
    
    // Calculate end position
    const endX = x + distance * Math.cos(angle);
    const endY = y + distance * Math.sin(angle);
    
    // Apply styles
    Object.assign(particle.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      opacity: '0',
      transform: 'translate(-50%, -50%) scale(0)',
      animation: `particle-burst 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) ${delay}s forwards`
    });
    
    // Add custom animation
    particle.style.setProperty('--end-x', `${endX}px`);
    particle.style.setProperty('--end-y', `${endY}px`);
    
    container.appendChild(particle);
  }
  
  // Remove particles after animation
  setTimeout(() => {
    if (container) {
      container.innerHTML = '';
    }
  }, 1000);
};

// Function to create a wave animation on an array of elements
export const createWaveAnimation = (elements: HTMLElement[]) => {
  elements.forEach((element, index) => {
    element.style.setProperty('--i', index.toString());
    element.classList.add('animate-wave');
    
    // Remove class after animation
    setTimeout(() => {
      element.classList.remove('animate-wave');
    }, 3000);
  });
};

// Success checkmark animation
export const createSuccessCheckmark = (container: HTMLElement) => {
  // Clear container
  container.innerHTML = '';
  
  // Create checkmark HTML
  const checkmarkHTML = `
    <div class="success-checkmark">
      <div class="check-icon">
        <span class="icon-line line-tip"></span>
        <span class="icon-line line-long"></span>
        <div class="icon-circle"></div>
        <div class="icon-fix"></div>
      </div>
    </div>
  `;
  
  // Add checkmark to container
  container.innerHTML = checkmarkHTML;
  
  // Remove after animation
  setTimeout(() => {
    if (container) {
      container.innerHTML = '';
    }
  }, 4000);
};

// Create celebration burst effect
export const createCelebrationBurst = (x: number, y: number, color: string = '#4f46e5') => {
  const burst = document.createElement('div');
  burst.className = 'celebration-burst';
  
  // Set position and color
  Object.assign(burst.style, {
    left: `${x}px`,
    top: `${y}px`,
    background: `radial-gradient(circle, ${color} 0%, ${color}00 70%)`
  });
  
  // Add to body
  document.body.appendChild(burst);
  
  // Remove after animation
  setTimeout(() => {
    if (burst.parentNode) {
      burst.parentNode.removeChild(burst);
    }
  }, 800);
};

// Create spotlight hover effect
export const addSpotlightEffect = (element: HTMLElement) => {
  element.classList.add('spotlight-hover');
  
  element.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    element.style.setProperty('--x', `${x}px`);
    element.style.setProperty('--y', `${y}px`);
  });
};

// Create 3D tilt effect for board
export const add3DTiltEffect = (boardElement: HTMLElement) => {
  // Wrap board in 3D wrapper if needed
  let wrapper = boardElement.parentElement;
  if (!wrapper?.classList.contains('board-3d-wrapper')) {
    wrapper = document.createElement('div');
    wrapper.className = 'board-3d-wrapper';
    boardElement.parentNode?.insertBefore(wrapper, boardElement);
    wrapper.appendChild(boardElement);
  }
  
  // Add 3D class to board
  boardElement.classList.add('board-3d');
  
  // Add mouse move handler for dynamic tilt
  boardElement.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = boardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt angle based on mouse position
    const tiltX = ((y / rect.height) * 10) - 5;
    const tiltY = (-(x / rect.width) * 10) + 5;
    
    // Apply tilt transformation
    boardElement.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });
  
  // Reset on mouse leave
  boardElement.addEventListener('mouseleave', () => {
    boardElement.style.transform = 'rotateX(0) rotateY(0)';
  });
};

// Create typing animation for text
export const createTypingAnimation = (element: HTMLElement, text: string, speed: number = 50) => {
  element.classList.add('animate-typing');
  element.textContent = '';
  
  let i = 0;
  const typeChar = () => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typeChar, speed);
    } else {
      // Animation complete
      element.classList.remove('animate-typing');
    }
  };
  
  typeChar();
};

// Create loading spinner that doesn't cause scroll jumps
export const createLoadingSpinner = (container: HTMLElement) => {
  // Clear container
  container.innerHTML = '';
  
  // Create spinner
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  
  // Add to container
  container.appendChild(spinner);
  
  // Save current scroll position
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  
  // Return a function to remove the spinner and restore scroll position
  return () => {
    if (spinner.parentNode) {
      spinner.parentNode.removeChild(spinner);
    }
    
    // Restore scroll position
    window.scrollTo(scrollX, scrollY);
  };
};

// Create shimmer loading effect
export const addShimmerEffect = (elements: HTMLElement[]) => {
  elements.forEach(element => {
    element.classList.add('animate-shimmer');
  });
  
  // Return function to remove effect
  return () => {
    elements.forEach(element => {
      element.classList.remove('animate-shimmer');
    });
  };
};

// Create notification badge
export const createNotificationBadge = (element: HTMLElement, count: number) => {
  // Remove existing badge if any
  const existingBadge = element.querySelector('.notification-badge');
  if (existingBadge) {
    existingBadge.parentNode?.removeChild(existingBadge);
  }
  
  // Create new badge if count > 0
  if (count > 0) {
    const badge = document.createElement('div');
    badge.className = 'notification-badge';
    badge.textContent = count > 99 ? '99+' : count.toString();
    
    // Add to element (which should be position: relative)
    if (window.getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    
    element.appendChild(badge);
  }
};

// Create cell focus animation for Sudoku grid
export const createCellFocusAnimation = (cellElement: HTMLElement) => {
  cellElement.classList.add('animate-cell-focus');
  
  // Remove class after animation
  setTimeout(() => {
    cellElement.classList.remove('animate-cell-focus');
  }, 600);
};

// Create grid scanning animation
export const createGridScanAnimation = async (gridCells: HTMLElement[][], rowIndex: number, columnIndex: number) => {
  // Row scan
  for (let i = 0; i < 9; i++) {
    if (i !== columnIndex) {
      gridCells[rowIndex][i].classList.add('animate-grid-scan-row');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  // Column scan
  for (let i = 0; i < 9; i++) {
    if (i !== rowIndex) {
      gridCells[i][columnIndex].classList.add('animate-grid-scan-column');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  // Remove animations after 1 second
  setTimeout(() => {
    document.querySelectorAll('.animate-grid-scan-row, .animate-grid-scan-column').forEach(element => {
      element.classList.remove('animate-grid-scan-row');
      element.classList.remove('animate-grid-scan-column');
    });
  }, 1000);
};

// Create progress animation
export const createProgressAnimation = (container: HTMLElement, duration: number = 2000) => {
  // Clear container
  container.innerHTML = '';
  
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.style.animation = `progress ${duration/1000}s cubic-bezier(0.65, 0, 0.35, 1) forwards`;
  
  // Add to container
  container.appendChild(progressBar);
  
  // Return a promise that resolves when animation completes
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
};

// Add bounce animation to button
export const addBounceEffect = (element: HTMLElement) => {
  element.classList.add('animate-bounce-gentle');
};