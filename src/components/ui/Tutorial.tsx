'use client';

import { memo, useState, useEffect, useCallback } from 'react';

interface TutorialProps {
  isPlaying: boolean;
  onComplete: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: 'center' | 'bottom-left' | 'bottom-right' | 'top';
  highlight?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome, Spider!',
    description: 'Hunt prey, spin webs, and survive as long as you can. Let\'s learn the basics!',
    icon: '🕷️',
    position: 'center',
  },
  {
    id: 'movement',
    title: 'Movement',
    description: 'Use WASD or Arrow keys to move. Hold Shift to run faster!',
    icon: '🎮',
    position: 'center',
  },
  {
    id: 'jump',
    title: 'Jump',
    description: 'Press Space to jump. You can reach higher prey and avoid obstacles.',
    icon: '⬆️',
    position: 'center',
  },
  {
    id: 'web',
    title: 'Shoot Webs',
    description: 'Click to shoot webs. Prey caught in webs moves slower and is easier to catch!',
    icon: '🕸️',
    position: 'center',
  },
  {
    id: 'zip',
    title: 'Zip Around',
    description: 'Right-click to zip quickly toward a location. Great for catching fast prey!',
    icon: '⚡',
    position: 'center',
  },
  {
    id: 'prey',
    title: 'Catch Prey',
    description: 'Different prey have different values. Butterflies are erratic, dragonflies are fast!',
    icon: '🦋',
    position: 'center',
  },
  {
    id: 'combo',
    title: 'Build Combos',
    description: 'Catch prey quickly in succession to build combo multipliers for higher scores!',
    icon: '🔥',
    position: 'center',
  },
  {
    id: 'ready',
    title: 'Ready to Hunt!',
    description: 'Good luck! Watch your web energy and keep those combos going.',
    icon: '✨',
    position: 'center',
  },
];

const Tutorial = memo(function Tutorial({ isPlaying, onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true); // Default true to not flash
  
  // Check if tutorial should show
  useEffect(() => {
    const seen = localStorage.getItem('spiderTutorialComplete');
    setHasSeenTutorial(!!seen);
    
    if (!seen && isPlaying) {
      setIsVisible(true);
    }
  }, [isPlaying]);
  
  // Hide when game starts playing and tutorial is done
  useEffect(() => {
    if (!isPlaying) {
      setIsVisible(false);
      setCurrentStep(0);
    }
  }, [isPlaying]);
  
  const handleNext = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete tutorial
      localStorage.setItem('spiderTutorialComplete', 'true');
      setIsVisible(false);
      onComplete();
    }
  }, [currentStep, onComplete]);
  
  const handleSkip = useCallback(() => {
    localStorage.setItem('spiderTutorialComplete', 'true');
    setIsVisible(false);
    onComplete();
  }, [onComplete]);
  
  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleNext, handleSkip]);
  
  if (!isVisible || hasSeenTutorial) return null;
  
  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;
  
  return (
    <div 
      className="fixed inset-0 z-[3000] flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.85) 100%)',
      }}
    >
      {/* Tutorial card */}
      <div 
        className="max-w-md w-full mx-4 tutorial-step"
        key={step.id}
      >
        <div 
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(20, 35, 60, 0.95) 0%, rgba(15, 25, 45, 0.98) 100%)',
            border: '1px solid rgba(100, 140, 200, 0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(100, 140, 200, 0.1)',
          }}
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
            <div 
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
              }}
            />
          </div>
          
          {/* Step counter */}
          <div className="absolute top-4 right-4 text-xs text-gray-500">
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </div>
          
          {/* Icon */}
          <div className="text-center mb-4">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(100, 140, 200, 0.1) 100%)',
                border: '2px solid rgba(100, 140, 200, 0.3)',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)',
              }}
            >
              {step.icon}
            </div>
          </div>
          
          {/* Title */}
          <h2 
            className="text-2xl font-bold text-center mb-3"
            style={{ color: 'rgba(230, 240, 255, 0.95)' }}
          >
            {step.title}
          </h2>
          
          {/* Description */}
          <p 
            className="text-center mb-6 leading-relaxed"
            style={{ color: 'rgba(180, 200, 230, 0.8)' }}
          >
            {step.description}
          </p>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all hover:bg-white/5"
              style={{
                border: '1px solid rgba(148, 163, 184, 0.2)',
                color: 'rgba(148, 163, 184, 0.7)',
              }}
            >
              Skip Tutorial
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 1) 100%)',
                border: '1px solid rgba(147, 197, 253, 0.3)',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                color: '#fff',
              }}
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? 'Start Playing!' : 'Next →'}
            </button>
          </div>
          
          {/* Keyboard hint */}
          <div className="mt-4 text-center">
            <span className="text-xs text-gray-600">
              Press <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px]">Enter</kbd> to continue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Tutorial;






