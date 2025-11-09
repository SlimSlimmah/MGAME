// Main game initialization and game loop

import { gameData } from './game-state.js';
import { loadGame, saveGame, clearAllData } from './storage.js';
import { migrateInventory } from './inventory.js';
import { processOfflineActivity, completeActivity, saveCharacterActivity } from './skills.js';
import { currentActivity } from './game-state.js';
import { renderCharacterSlots } from './ui.js';
import { processCombatTick } from './combat.js';
import { combatState } from './game-state.js';

// Import functions that need to be globally accessible
import { selectClass, createCharacter, playCharacter, deleteCharacter } from './character.js';
import { showCharacterList, showCharacterCreation, switchGameTab, switchSkillsTab, toggleSkillSection, openEquipmentSelector, closeEquipmentModal } from './ui.js';
import { startGathering, startProcessing, stopGathering } from './skills.js';
import { startCombat, retreatFromCombat, resetCombat } from './combat.js';

// Make functions globally accessible for onclick handlers
window.selectClass = selectClass;
window.createCharacter = createCharacter;
window.playCharacter = playCharacter;
window.deleteCharacter = deleteCharacter;
window.showCharacterList = showCharacterList;
window.showCharacterCreation = showCharacterCreation;
window.switchGameTab = switchGameTab;
window.switchSkillsTab = switchSkillsTab;
window.toggleSkillSection = toggleSkillSection;
window.startGathering = startGathering;
window.startProcessing = startProcessing;
window.stopGathering = stopGathering;
window.openEquipmentSelector = openEquipmentSelector;
window.closeEquipmentModal = closeEquipmentModal;
window.startCombat = startCombat;
window.retreatFromCombat = retreatFromCombat;
window.resetCombat = resetCombat;
window.clearAllData = clearAllData;

// Game loop variables
let lastActivitySave = 0;
let lastCharacterListUpdate = 0;

// Game loop function
function gameLoop() {
  const now = Date.now();
  
  // Process combat if active
  if (combatState.active) {
    processCombatTick();
  }
  
  // Update current character's activity if one is active
  if (currentActivity.active) {
    const elapsed = now - currentActivity.startTime;
    const progress = Math.min(elapsed / currentActivity.duration, 1);
    
    // Update progress bar
    document.getElementById('gatheringProgressBar').style.width = `${progress * 100}%`;
    document.getElementById('progressText').textContent = 
      `${(elapsed / 1000).toFixed(1)}s / ${(currentActivity.duration / 1000).toFixed(1)}s`;
    
    // Check if complete
    if (progress >= 1) {
      completeActivity();
    }
    
    // Save activity state every 10 seconds
    if (now - lastActivitySave > 10000) {
      saveCharacterActivity();
      lastActivitySave = now;
    }
  }
  
  // Update character list display every 5 seconds if visible
  if (document.getElementById('characterList').classList.contains('active')) {
    if (now - lastCharacterListUpdate > 5000) {
      renderCharacterSlots();
      lastCharacterListUpdate = now;
    }
  }
}

// Initialize game
function initGame() {
  // Load saved game data
  loadGame();
  
  // Migrate all characters to new inventory system
  gameData.characters.forEach(character => {
    migrateInventory(character);
  });
  
  // Process offline progress for all characters
  gameData.characters.forEach(character => {
    if (character.currentActivity) {
      const now = Date.now();
      const timeSinceStart = now - character.currentActivity.startTime;
      const completedCycles = Math.floor(timeSinceStart / character.currentActivity.duration);
      
      if (completedCycles > 0) {
        const activityType = character.currentActivity.activityType || 'gathering';
        const activityId = character.currentActivity.activityId;
        
        processOfflineActivity.call({ character }, activityId, activityType, completedCycles);
        
        // Update the start time to account for completed cycles
        const timeIntoCurrentCycle = timeSinceStart % character.currentActivity.duration;
        character.currentActivity.startTime = now - timeIntoCurrentCycle;
      }
    }
  });
  
  // Save after processing offline progress
  saveGame();
  
  // Render initial character list
  renderCharacterSlots();
  
  // Start game loop
  setInterval(gameLoop, 100);
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
