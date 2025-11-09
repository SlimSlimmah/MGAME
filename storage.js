// Storage management (localStorage)

import { gameData, setGameData } from './game-state.js';

// Load game data from localStorage
export function loadGame() {
  const saved = localStorage.getItem('idleRPGSave');
  if (saved) {
    try {
      const loadedData = JSON.parse(saved);
      setGameData(loadedData);
    } catch (e) {
      console.error('Failed to load save:', e);
    }
  }
}

// Save game data to localStorage
export function saveGame() {
  try {
    localStorage.setItem('idleRPGSave', JSON.stringify(gameData));
  } catch (e) {
    console.error('Failed to save:', e);
  }
}

// Clear all game data
export function clearAllData() {
  if (confirm('Are you sure you want to delete ALL characters and start fresh? This cannot be undone!')) {
    if (confirm('Really? This will permanently delete everything!')) {
      localStorage.removeItem('idleRPGSave');
      location.reload();
    }
  }
}
