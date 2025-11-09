// Character management

import { CLASS_INFO } from './constants.js';
import { gameData } from './game-state.js';
import { saveGame } from './storage.js';
import { migrateInventory } from './inventory.js';
import { saveCharacterActivity, loadCharacterActivity } from './skills.js';
import { updateGameUI, updatePlayerStats } from './ui.js';

// Select class during character creation
export function selectClass(className) {
  gameData.selectedClass = className;
  
  // Remove selected from all cards
  document.querySelectorAll('.class-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // Add selected to clicked card
  document.querySelector(`[data-class="${className}"]`).classList.add('selected');
  
  // Hide error
  document.getElementById('classError').classList.remove('show');
}

// Create a new character
export function createCharacter() {
  const nameInput = document.getElementById('characterName');
  const name = nameInput.value.trim();
  const selectedClass = gameData.selectedClass;
  
  let hasError = false;
  
  // Validate name
  if (!name) {
    document.getElementById('nameError').classList.add('show');
    hasError = true;
  } else {
    document.getElementById('nameError').classList.remove('show');
  }
  
  // Validate class
  if (!selectedClass) {
    document.getElementById('classError').classList.add('show');
    hasError = true;
  } else {
    document.getElementById('classError').classList.remove('show');
  }
  
  if (hasError) return;
  
  // Create new character
  const classInfo = CLASS_INFO[selectedClass];
  const newCharacter = {
    id: Date.now(),
    name: name,
    class: selectedClass,
    level: 1,
    hp: classInfo.baseHP,
    maxHP: classInfo.baseHP,
    damage: classInfo.baseDamage,
    experience: 0,
    gold: 0,
    createdAt: Date.now(),
    skills: {
      woodcutting: { level: 1, xp: 0 },
      fishing: { level: 1, xp: 0 },
      mining: { level: 1, xp: 0 },
      hunting: { level: 1, xp: 0 },
      cooking: { level: 1, xp: 0 },
      forging: { level: 1, xp: 0 },
      leatherworking: { level: 1, xp: 0 }
    },
    inventory: [],
    equipment: {
      weapon: null,
      tool: null,
      head: null,
      chest: null,
      legs: null,
      gloves: null,
      boots: null
    },
    currentActivity: null
  };
  
  gameData.characters.push(newCharacter);
  saveGame();
  
  // Reset form
  nameInput.value = '';
  gameData.selectedClass = null;
  document.querySelectorAll('.class-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // Show character list
  import('./ui.js').then(({ showCharacterList }) => {
    showCharacterList();
  });
}

// Play with a character
export function playCharacter(characterId) {
  // Save current character's activity before switching
  if (gameData.currentCharacterId) {
    saveCharacterActivity();
  }
  
  const character = gameData.characters.find(c => c.id === characterId);
  if (!character) return;
  
  // Ensure character has skills and inventory
  if (!character.skills) {
    character.skills = {
      woodcutting: { level: 1, xp: 0 },
      fishing: { level: 1, xp: 0 },
      mining: { level: 1, xp: 0 },
      hunting: { level: 1, xp: 0 },
      cooking: { level: 1, xp: 0 },
      forging: { level: 1, xp: 0 },
      leatherworking: { level: 1, xp: 0 }
    };
  }
  // Add new skills if missing
  if (!character.skills.cooking) character.skills.cooking = { level: 1, xp: 0 };
  if (!character.skills.forging) character.skills.forging = { level: 1, xp: 0 };
  if (!character.skills.hunting) character.skills.hunting = { level: 1, xp: 0 };
  if (!character.skills.leatherworking) character.skills.leatherworking = { level: 1, xp: 0 };
  
  // Migrate old inventory format to new format
  migrateInventory(character);
  
  if (!character.equipment) {
    character.equipment = {
      weapon: null,
      tool: null,
      head: null,
      chest: null,
      legs: null,
      gloves: null,
      boots: null
    };
  }
  // Add new equipment slots if missing
  if (character.equipment.head === undefined) character.equipment.head = null;
  if (character.equipment.chest === undefined) character.equipment.chest = null;
  if (character.equipment.legs === undefined) character.equipment.legs = null;
  if (character.equipment.gloves === undefined) character.equipment.gloves = null;
  if (character.equipment.boots === undefined) character.equipment.boots = null;
  
  gameData.currentCharacterId = characterId;
  
  // Initialize gold if missing
  if (character.gold === undefined) {
    character.gold = 0;
  }
  
  const classInfo = CLASS_INFO[character.class];
  
  document.getElementById('gamePlayerIcon').textContent = classInfo.icon;
  document.getElementById('gamePlayerName').textContent = character.name;
  document.getElementById('gamePlayerClass').textContent = `${classInfo.name} - Level ${character.level}`;
  
  document.getElementById('characterList').classList.remove('active');
  document.getElementById('characterCreation').classList.remove('active');
  document.getElementById('gameView').classList.add('active');
  
  // Load this character's activity state
  loadCharacterActivity();
  
  updateGameUI();
  updatePlayerStats();
}

// Delete a character
export function deleteCharacter(characterId, event) {
  event.stopPropagation();
  
  const character = gameData.characters.find(c => c.id === characterId);
  if (!character) return;
  
  if (confirm(`Are you sure you want to delete ${character.name}?`)) {
    gameData.characters = gameData.characters.filter(c => c.id !== characterId);
    
    // If we deleted the current character, clear the current character ID
    if (gameData.currentCharacterId === characterId) {
      gameData.currentCharacterId = null;
    }
    
    saveGame();
    import('./ui.js').then(({ renderCharacterSlots }) => {
      renderCharacterSlots();
    });
  }
}

// Get current character
export function getCurrentCharacter() {
  return gameData.characters.find(c => c.id === gameData.currentCharacterId);
}
