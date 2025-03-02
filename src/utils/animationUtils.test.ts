/**
 * @jest-environment jsdom
 */

import {
  createConfetti,
  createRippleEffect,
  createParticleBurst,
  createWaveAnimation,
  createSuccessCheckmark,
  createCelebrationBurst,
  addSpotlightEffect,
  add3DTiltEffect,
  createTypingAnimation,
  createLoadingSpinner,
  addShimmerEffect,
  createNotificationBadge,
  createCellFocusAnimation,
  createGridScanAnimation,
  createProgressAnimation,
  addBounceEffect
} from './animationUtils';

// Mock DOM methods not available in jest
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    position: 'static',
    getPropertyValue: jest.fn()
  })
});

describe('Animation Utilities', () => {
  beforeEach(() => {
    // Set up document body
    document.body.innerHTML = '';

    // Mock Element.getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 100,
        height: 100,
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
        x: 0,
        y: 0
      };
    });
  });

  test('createConfetti creates and removes confetti elements', () => {
    createConfetti();
    
    // Should create a container
    const container = document.querySelector('.confetti-container');
    expect(container).not.toBeNull();
    
    // Should create confetti elements
    const confettiElements = document.querySelectorAll('.confetti');
    expect(confettiElements.length).toBeGreaterThan(0);
    
    // Advance timers to trigger cleanup
    jest.useFakeTimers();
    jest.advanceTimersByTime(9000);
    
    // Container should be removed
    expect(document.querySelector('.confetti-container')).toBeNull();
    
    jest.useRealTimers();
  });

  test('createRippleEffect adds and removes ripple element', () => {
    // Create a button to test ripple effect
    const button = document.createElement('button');
    document.body.appendChild(button);
    
    // Create a mock event
    const mockEvent = {
      currentTarget: button,
      clientX: 50,
      clientY: 50
    } as unknown as React.MouseEvent<HTMLElement>;
    
    createRippleEffect(mockEvent);
    
    // Should add a ripple element
    const ripple = button.querySelector('.ripple-effect');
    expect(ripple).not.toBeNull();
    
    // Advance timers to trigger style changes and cleanup
    jest.useFakeTimers();
    jest.advanceTimersByTime(10);
    jest.advanceTimersByTime(600);
    
    // Ripple should be removed
    expect(button.querySelector('.ripple-effect')).toBeNull();
    
    jest.useRealTimers();
  });

  test('createParticleBurst creates and removes particle elements', () => {
    createParticleBurst(50, 50);
    
    // Should create a container
    const container = document.querySelector('.particle-container');
    expect(container).not.toBeNull();
    
    // Should create particle elements
    const particles = document.querySelectorAll('.particle');
    expect(particles.length).toBeGreaterThan(0);
    
    // Advance timers to trigger cleanup
    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);
    
    // Particles should be removed
    expect(document.querySelectorAll('.particle').length).toBe(0);
    
    jest.useRealTimers();
  });

  test('createWaveAnimation adds and removes wave animation class', () => {
    // Create elements to animate
    const elements = Array(5).fill(null).map(() => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      return el;
    });
    
    createWaveAnimation(elements);
    
    // Should add animation class to all elements
    elements.forEach((el, index) => {
      expect(el.classList.contains('animate-wave')).toBe(true);
      expect(el.style.getPropertyValue('--i')).toBe(index.toString());
    });
    
    // Advance timers to trigger cleanup
    jest.useFakeTimers();
    jest.advanceTimersByTime(3000);
    
    // Animation class should be removed
    elements.forEach(el => {
      expect(el.classList.contains('animate-wave')).toBe(false);
    });
    
    jest.useRealTimers();
  });

  test('createSuccessCheckmark creates and removes checkmark elements', () => {
    // Create a container for the checkmark
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    createSuccessCheckmark(container);
    
    // Should create checkmark elements
    const checkmark = container.querySelector('.success-checkmark');
    expect(checkmark).not.toBeNull();
    
    // Advance timers to trigger cleanup
    jest.useFakeTimers();
    jest.advanceTimersByTime(4000);
    
    // Checkmark should be removed
    expect(container.innerHTML).toBe('');
    
    jest.useRealTimers();
  });

  test('createCelebrationBurst creates and removes burst element', () => {
    createCelebrationBurst(50, 50);
    
    // Should create a burst element
    const burst = document.querySelector('.celebration-burst');
    expect(burst).not.toBeNull();
    
    // Advance timers to trigger cleanup
    jest.useFakeTimers();
    jest.advanceTimersByTime(800);
    
    // Burst should be removed
    expect(document.querySelector('.celebration-burst')).toBeNull();
    
    jest.useRealTimers();
  });

  test('addSpotlightEffect adds spotlight class and event listener', () => {
    // Create an element for the spotlight effect
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    // Spy on event listener
    const addEventListenerSpy = jest.spyOn(element, 'addEventListener');
    
    addSpotlightEffect(element);
    
    // Should add the spotlight class
    expect(element.classList.contains('spotlight-hover')).toBe(true);
    
    // Should add a mousemove event listener
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    
    // Clean up
    addEventListenerSpy.mockRestore();
  });

  test('add3DTiltEffect sets up 3D tilt effect with mouse tracking', () => {
    // Create an element for the 3D effect
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    // Spy on event listeners
    const addEventListenerSpy = jest.spyOn(element, 'addEventListener');
    
    add3DTiltEffect(element);
    
    // Should add the 3D board class
    expect(element.classList.contains('board-3d')).toBe(true);
    
    // Should add event listeners for mouse movement and mouse leave
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
    
    // Clean up
    addEventListenerSpy.mockRestore();
  });

  test('createTypingAnimation types text character by character', () => {
    // Create an element for the typing animation
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    const text = 'Hello, World!';
    createTypingAnimation(element, text, 10);
    
    // Should add the typing class
    expect(element.classList.contains('animate-typing')).toBe(true);
    
    // Text should start empty
    expect(element.textContent).toBe('');
    
    // Advance timers to type each character
    jest.useFakeTimers();
    
    // Advance time for each character
    for (let i = 1; i <= text.length; i++) {
      jest.advanceTimersByTime(10);
      expect(element.textContent).toBe(text.substring(0, i));
    }
    
    // Class should be removed after completion
    jest.advanceTimersByTime(10);
    expect(element.classList.contains('animate-typing')).toBe(false);
    
    jest.useRealTimers();
  });

  test('createLoadingSpinner creates and returns function to remove spinner', () => {
    // Create a container for the spinner
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const removeSpinner = createLoadingSpinner(container);
    
    // Should create a spinner element
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).not.toBeNull();
    
    // Should return a function to remove the spinner
    removeSpinner();
    expect(container.querySelector('.loading-spinner')).toBeNull();
  });

  test('addShimmerEffect adds and removes shimmer effect class', () => {
    // Create elements for the shimmer effect
    const elements = Array(3).fill(null).map(() => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      return el;
    });
    
    const removeShimmer = addShimmerEffect(elements);
    
    // Should add shimmer class to all elements
    elements.forEach(el => {
      expect(el.classList.contains('animate-shimmer')).toBe(true);
    });
    
    // Should return a function to remove the effect
    removeShimmer();
    
    // Shimmer class should be removed
    elements.forEach(el => {
      expect(el.classList.contains('animate-shimmer')).toBe(false);
    });
  });

  test('createNotificationBadge adds badge with count', () => {
    // Create an element for the notification badge
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    createNotificationBadge(element, 5);
    
    // Should create a badge element
    const badge = element.querySelector('.notification-badge');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toBe('5');
    
    // Update count
    createNotificationBadge(element, 10);
    expect(element.querySelector('.notification-badge')?.textContent).toBe('10');
    
    // Handle large numbers
    createNotificationBadge(element, 100);
    expect(element.querySelector('.notification-badge')?.textContent).toBe('99+');
    
    // Remove badge when count is 0
    createNotificationBadge(element, 0);
    expect(element.querySelector('.notification-badge')).toBeNull();
  });

  test('createCellFocusAnimation adds and removes focus animation class', () => {
    // Create a cell element
    const cell = document.createElement('div');
    document.body.appendChild(cell);
    
    createCellFocusAnimation(cell);
    
    // Should add focus animation class
    expect(cell.classList.contains('animate-cell-focus')).toBe(true);
    
    // Advance timers to trigger cleanup
    jest.useFakeTimers();
    jest.advanceTimersByTime(600);
    
    // Animation class should be removed
    expect(cell.classList.contains('animate-cell-focus')).toBe(false);
    
    jest.useRealTimers();
  });

  test('createProgressAnimation creates and animates progress bar', async () => {
    // Create a container for the progress bar
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const duration = 100; // Short duration for testing
    const progressPromise = createProgressAnimation(container, duration);
    
    // Should create a progress bar element
    const progressBar = container.querySelector('.progress-bar');
    expect(progressBar).not.toBeNull();
    
    // Animation should be applied
    expect(progressBar?.style.animation).toContain('progress');
    
    // Advance timers to complete animation
    jest.useFakeTimers();
    jest.advanceTimersByTime(duration);
    
    // Promise should resolve
    await progressPromise;
    
    jest.useRealTimers();
  });

  test('addBounceEffect adds bounce animation class', () => {
    // Create an element for the bounce effect
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    addBounceEffect(element);
    
    // Should add bounce animation class
    expect(element.classList.contains('animate-bounce-gentle')).toBe(true);
  });
});