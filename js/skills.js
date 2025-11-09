// Skills, gathering, and processing management

import { GATHERING_ACTIVITIES, PROCESSING_ACTIVITIES } from './constants.js';
import { currentActivity, setCurrentActivity, gameData } from './game-state.js';
import { getCurrentCharacter } from './character.js';
import { addItemToInventory, removeItemFromInventory, countItemsInInventory } from './inventory.js';
import { saveGame } from './storage.js';
import { getXPForLevel, rollRarity } from './utils.js';
import { updateGameUI, updateInventoryUI, updateEquipmentUI } from './ui.js';
import { activeGameTab } from './game-state.js';

// Check if character has required materials
export function hasMaterials(requires) {
  const character = getCurrentCharacter();
  if (!character) return false;
  
  for (const [itemId, amount] of Object.entries(requires)) {
    if (countItemsInInventory(character, itemId) < amount) {
      return false;
    }
  }
  return true;
}

// Update activity buttons based on available materials
export function updateActivityButtons() {
  const character = getCurrentCharacter();
  if (!character) return;
  
  // Check all processing activities
  Object.values(PROCESSING_ACTIVITIES).forEach(activity => {
    const button = document.querySelector(`[onclick="startProcessing('${activity.id}')"]`);
    if (button) {
      const canCraft = hasMaterials(activity.requires);
      if (!canCraft && !currentActivity.active) {
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
      } else if (!currentActivity.active) {
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      }
    }
  });
}

// Start gathering
export function startGathering(activityId) {
  // If already doing this activity, do nothing
  if (currentActivity.active && currentActivity.activityId === activityId) {
    return;
  }
  
  const activity = GATHERING_ACTIVITIES[activityId];
  if (!activity) return;
  
  setCurrentActivity({
    active: true,
    activityId: activityId,
    activityType: 'gathering',
    startTime: Date.now(),
    duration: activity.duration * 1000,
    quantity: 1,
    completed: 0
  });
  
  // Show progress UI
  document.getElementById('activityProgress').style.display = 'block';
  document.getElementById('progressActivity').textContent = activity.name;
  
  // Disable all activity buttons
  document.querySelectorAll('.activity-btn').forEach(btn => {
    btn.disabled = true;
  });
}

// Start processing
export function startProcessing(activityId) {
  // If already doing this activity, do nothing
  if (currentActivity.active && currentActivity.activityId === activityId) {
    return;
  }
  
  const activity = PROCESSING_ACTIVITIES[activityId];
  if (!activity) return;
  
  // Get quantity from input
  const quantityInput = document.getElementById(`${activityId}Qty`);
  const quantity = quantityInput ? Math.max(1, parseInt(quantityInput.value) || 1) : 1;
  
  // Check if player has required materials for the quantity
  const character = getCurrentCharacter();
  let maxCanMake = Infinity;
  for (const [itemId, amount] of Object.entries(activity.requires)) {
    const available = countItemsInInventory(character, itemId);
    maxCanMake = Math.min(maxCanMake, Math.floor(available / amount));
  }
  
  if (maxCanMake < 1) {
    return; // Can't make any
  }
  
  // Cap quantity at what we can make
  const actualQuantity = Math.min(quantity, maxCanMake);
  
  setCurrentActivity({
    active: true,
    activityId: activityId,
    activityType: 'processing',
    startTime: Date.now(),
    duration: activity.duration * 1000,
    quantity: actualQuantity,
    completed: 0
  });
  
  // Show progress UI
  document.getElementById('activityProgress').style.display = 'block';
  document.getElementById('progressActivity').textContent = `${activity.name} (${currentActivity.completed}/${currentActivity.quantity})`;
  
  // Disable all activity buttons
  document.querySelectorAll('.activity-btn').forEach(btn => {
    btn.disabled = true;
  });
}

// Stop current activity
export function stopGathering() {
  setCurrentActivity({
    active: false,
    activityId: null,
    activityType: null,
    startTime: null,
    duration: 0,
    quantity: 1,
    completed: 0
  });
  
  document.getElementById('activityProgress').style.display = 'none';
  
  // Re-enable all activity buttons
  document.querySelectorAll('.activity-btn').forEach(btn => {
    btn.disabled = false;
  });
  
  // Update button states for processing activities
  updateActivityButtons();
}

// Complete current activity
export function completeActivity() {
  const character = getCurrentCharacter();
  if (!character) return;
  
  const activityType = currentActivity.activityType;
  const activityId = currentActivity.activityId;
  
  if (activityType === 'gathering') {
    const activity = GATHERING_ACTIVITIES[activityId];
    if (!activity) return;
    
    // Add item to inventory - gathered items are always Common
    addItemToInventory(character, activityId, 'common');
    
    // Add XP to skill
    const skill = activity.skill;
    character.skills[skill].xp += activity.xpGain;
    
    // Check for level up
    const xpNeeded = getXPForLevel(character.skills[skill].level + 1);
    if (character.skills[skill].xp >= xpNeeded) {
      character.skills[skill].level++;
      character.skills[skill].xp -= xpNeeded;
      console.log(`${skill} leveled up to ${character.skills[skill].level}!`);
    }
    
    // Restart the same activity (loop for gathering)
    currentActivity.startTime = Date.now();
    
  } else if (activityType === 'processing') {
    const activity = PROCESSING_ACTIVITIES[activityId];
    if (!activity) return;
    
    // Check if player still has materials
    if (!hasMaterials(activity.requires)) {
      stopGathering();
      return;
    }
    
    // Consume materials
    for (const [itemId, amount] of Object.entries(activity.requires)) {
      for (let i = 0; i < amount; i++) {
        removeItemFromInventory(character, itemId);
      }
    }
    
    // Add produced item with random rarity only for equipment
    const isEquipment = activity.equipmentType !== undefined;
    const rarity = isEquipment ? rollRarity() : 'common';
    addItemToInventory(character, activityId, rarity);
    
    // Add XP to skill
    const skill = activity.skill;
    character.skills[skill].xp += activity.xpGain;
    
    // Check for level up
    const xpNeeded = getXPForLevel(character.skills[skill].level + 1);
    if (character.skills[skill].xp >= xpNeeded) {
      character.skills[skill].level++;
      character.skills[skill].xp -= xpNeeded;
      console.log(`${skill} leveled up to ${character.skills[skill].level}!`);
    }
    
    // Increment completed count
    currentActivity.completed++;
    
    // Check if we've completed the quantity
    if (currentActivity.completed >= currentActivity.quantity) {
      stopGathering();
      return;
    }
    
    // Update progress label
    document.getElementById('progressActivity').textContent = `${activity.name} (${currentActivity.completed}/${currentActivity.quantity})`;
    
    // Restart for next item in quantity
    currentActivity.startTime = Date.now();
  }
  
  saveGame();
  updateGameUI();
  
  // Update inventory display if on that tab
  if (activeGameTab === 'inventory') {
    updateInventoryUI();
  } else if (activeGameTab === 'equipment') {
    updateEquipmentUI();
  }
}

// Process offline activity rewards
export function processOfflineActivity(activityId, activityType, cycles) {
  const character = getCurrentCharacter();
  if (!character) return;
  
  if (activityType === 'gathering') {
    const activity = GATHERING_ACTIVITIES[activityId];
    if (!activity) return;
    
    // Add items - gathered items are always Common
    for (let i = 0; i < cycles; i++) {
      addItemToInventory(character, activityId, 'common');
    }
    
    // Add XP
    const skill = activity.skill;
    character.skills[skill].xp += activity.xpGain * cycles;
    
    // Process level ups
    let levelsGained = 0;
    while (true) {
      const xpNeeded = getXPForLevel(character.skills[skill].level + 1);
      if (character.skills[skill].xp >= xpNeeded) {
        character.skills[skill].level++;
        character.skills[skill].xp -= xpNeeded;
        levelsGained++;
      } else {
        break;
      }
    }
    
    if (levelsGained > 0) {
      console.log(`${skill} gained ${levelsGained} levels while away!`);
    }
  } else if (activityType === 'processing') {
    const activity = PROCESSING_ACTIVITIES[activityId];
    if (!activity) return;
    
    // Calculate how many we can actually make with available materials
    let canMake = cycles;
    for (const [itemId, amount] of Object.entries(activity.requires)) {
      const maxFromThisItem = Math.floor(countItemsInInventory(character, itemId) / amount);
      canMake = Math.min(canMake, maxFromThisItem);
    }
    
    if (canMake > 0) {
      // Consume materials
      for (let i = 0; i < canMake; i++) {
        for (const [itemId, amount] of Object.entries(activity.requires)) {
          for (let j = 0; j < amount; j++) {
            removeItemFromInventory(character, itemId);
          }
        }
      }
      
      // Add produced items
      for (let i = 0; i < canMake; i++) {
        // Only equipment gets random rarity, materials are Common
        const isEquipment = activity.equipmentType !== undefined;
        const rarity = isEquipment ? rollRarity() : 'common';
        addItemToInventory(character, activityId, rarity);
      }
      
      // Add XP
      const skill = activity.skill;
      character.skills[skill].xp += activity.xpGain * canMake;
      
      // Process level ups
      let levelsGained = 0;
      while (true) {
        const xpNeeded = getXPForLevel(character.skills[skill].level + 1);
        if (character.skills[skill].xp >= xpNeeded) {
          character.skills[skill].level++;
          character.skills[skill].xp -= xpNeeded;
          levelsGained++;
        } else {
          break;
        }
      }
      
      if (levelsGained > 0) {
        console.log(`${skill} gained ${levelsGained} levels while away!`);
      }
    }
  }
  
  saveGame();
  updateGameUI();
}

// Save current character's activity state
export function saveCharacterActivity() {
  const character = getCurrentCharacter();
  if (!character) return;
  
  if (currentActivity.active) {
    character.currentActivity = {
      activityId: currentActivity.activityId,
      activityType: currentActivity.activityType,
      startTime: currentActivity.startTime,
      duration: currentActivity.duration,
      quantity: currentActivity.quantity || 1,
      completed: currentActivity.completed || 0
    };
  } else {
    character.currentActivity = null;
  }
  
  saveGame();
}

// Load character's activity state
export function loadCharacterActivity() {
  const character = getCurrentCharacter();
  if (!character || !character.currentActivity) {
    setCurrentActivity({
      active: false,
      activityId: null,
      activityType: null,
      startTime: null,
      duration: 0,
      quantity: 1,
      completed: 0
    });
    document.getElementById('activityProgress').style.display = 'none';
    document.querySelectorAll('.activity-btn').forEach(btn => {
      btn.disabled = false;
    });
    return;
  }
  
  // Calculate offline progress
  const savedActivity = character.currentActivity;
  const now = Date.now();
  const timeSinceStart = now - savedActivity.startTime;
  const completedCycles = Math.floor(timeSinceStart / savedActivity.duration);
  
  // Process all completed cycles
  if (completedCycles > 0) {
    processOfflineActivity(savedActivity.activityId, savedActivity.activityType, completedCycles);
  }
  
  // Resume the activity from where it should be
  const timeIntoCurrentCycle = timeSinceStart % savedActivity.duration;
  setCurrentActivity({
    active: true,
    activityId: savedActivity.activityId,
    activityType: savedActivity.activityType,
    startTime: now - timeIntoCurrentCycle,
    duration: savedActivity.duration,
    quantity: savedActivity.quantity || 1,
    completed: savedActivity.completed || 0
  });
  
  // Update UI
  const activities = savedActivity.activityType === 'gathering' ? GATHERING_ACTIVITIES : PROCESSING_ACTIVITIES;
  const activity = activities[savedActivity.activityId];
  document.getElementById('activityProgress').style.display = 'block';
  
  if (savedActivity.activityType === 'processing' && savedActivity.quantity > 1) {
    document.getElementById('progressActivity').textContent = `${activity.name} (${currentActivity.completed}/${currentActivity.quantity})`;
  } else {
    document.getElementById('progressActivity').textContent = activity.name;
  }
  
  document.querySelectorAll('.activity-btn').forEach(btn => {
    btn.disabled = true;
  });
}
