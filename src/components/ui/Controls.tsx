'use client';

import { memo, useState } from 'react';

const Controls = memo(function Controls() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 game-ui">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="glass-panel-light px-3 py-2 rounded-lg text-gray-400 text-sm hover:text-white hover:bg-white/10 transition-all"
        >
          ?
        </button>
      ) : (
        <div className="glass-panel rounded-xl p-4 w-56">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-gray-300 font-semibold text-sm">Controls</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-white transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 controls-hint text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Move</span>
              <kbd>↑↓←→</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Jump</span>
              <kbd>Space</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Run</span>
              <kbd>Shift</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Shoot Web</span>
              <kbd>L-Click</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Zip</span>
              <kbd>R-Click</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pause</span>
              <kbd>Esc</kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Controls;
