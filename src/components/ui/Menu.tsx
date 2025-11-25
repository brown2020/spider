'use client';

import { memo } from 'react';
import { GameState } from '@/lib/types/game';

interface MenuProps {
  gameState: GameState;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

const Menu = memo(function Menu({ gameState, onStart, onResume, onRestart }: MenuProps) {
  const { gamePhase, score, highScore } = gameState;
  
  if (gamePhase === 'playing') return null;
  
  const isNewHighScore = gamePhase === 'gameOver' && score === highScore && score > 0;
  
  return (
    <div className="fixed inset-0 menu-overlay flex items-center justify-center z-[2000]">
      <div 
        className="glass-panel rounded-2xl p-8 max-w-md w-full mx-4"
        style={{ animation: 'scale-in 0.3s ease-out' }}
      >
        {/* Title */}
        {gamePhase === 'menu' && (
          <>
            <h1 className="game-title text-5xl font-black text-center mb-2">
              SPIDER
            </h1>
            <p className="text-gray-400 text-center mb-8 text-sm">
              Hunt prey, spin webs, survive
            </p>
          </>
        )}
        
        {gamePhase === 'paused' && (
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-200">
            Paused
          </h2>
        )}
        
        {gamePhase === 'gameOver' && (
          <>
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-200">
              Game Over
            </h2>
            <div className="text-center mb-6">
              <div className="text-gray-400 text-sm mb-1">Final Score</div>
              <div 
                className={`text-5xl font-black ${isNewHighScore ? 'text-yellow-400 high-score-new' : 'text-white'}`}
              >
                {score}
              </div>
              {isNewHighScore && (
                <div className="text-yellow-400 text-sm mt-2 animate-pulse">
                  ★ New High Score! ★
                </div>
              )}
              {!isNewHighScore && highScore > 0 && (
                <div className="text-gray-500 text-sm mt-2">
                  Best: {highScore}
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Buttons */}
        <div className="space-y-3">
          {gamePhase === 'menu' && (
            <button
              onClick={onStart}
              className="game-button w-full py-3 px-6 rounded-lg text-white font-bold text-lg"
            >
              Start Game
            </button>
          )}
          
          {gamePhase === 'paused' && (
            <>
              <button
                onClick={onResume}
                className="game-button w-full py-3 px-6 rounded-lg text-white font-bold text-lg"
              >
                Resume
              </button>
              <button
                onClick={onRestart}
                className="w-full py-3 px-6 rounded-lg text-gray-300 font-bold text-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 transition-all"
              >
                Restart
              </button>
            </>
          )}
          
          {gamePhase === 'gameOver' && (
            <button
              onClick={onRestart}
              className="game-button w-full py-3 px-6 rounded-lg text-white font-bold text-lg"
            >
              Play Again
            </button>
          )}
        </div>
        
        {/* Controls hint */}
        {(gamePhase === 'menu' || gamePhase === 'paused') && (
          <div className="mt-8 controls-hint text-sm">
            <h3 className="text-gray-300 font-semibold mb-3 text-center">Controls</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <kbd>↑↓←→</kbd>
                <span>Move</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd>Space</kbd>
                <span>Jump</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd>Click</kbd>
                <span>Shoot Web</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd>Right Click</kbd>
                <span>Zip</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd>Shift</kbd>
                <span>Run</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd>Esc</kbd>
                <span>Pause</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Tips for game over */}
        {gamePhase === 'gameOver' && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Tip: Chain catches for combo multipliers!
            </p>
          </div>
        )}
        
        {/* High score display on menu */}
        {gamePhase === 'menu' && highScore > 0 && (
          <div className="mt-6 text-center">
            <div className="text-gray-500 text-sm">
              High Score: <span className="text-yellow-400 font-bold">{highScore}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Menu;
