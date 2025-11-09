// Inventory management

import { GATHERING_ACTIVITIES, PROCESSING_ACTIVITIES } from './constants.js';
import { rollRarity, generateItemStats } from './utils.js';

// Add item to inventory
export function addItemToInventory(character, itemId, rarity = null) {
  if (!rarity) {
    rarity = rollRarity();
  }
  
  // Check if this is equipment
  const processingActivity = PROCESSING_ACTIVITIES[itemId];
  const isEquipment = processingActivity && processingActivity.equipmentType !== undefined;
  
  const item = {
    id: itemId,
    rarity: rarity,
    instanceId: Date.now() + Math.random() // Unique identifier
  };
  
  // Generate stats for equipment based on rarity
  if (isEquipment && rarity !== 'common') {
    item.stats = generateItemStats(processingActivity.equipmentType, rarity);
  }
  
  character.inventory.push(item);
  return item;
}

// Remove first occurrence of item from inventory
export function removeItemFromInventory(character, itemId) {
  const index = character.inventory.findIndex(item => item.id === itemId);
  if (index !== -1) {
    return character.inventory.splice(index, 1)[0];
  }
  return null;
}

// Remove specific item instance from inventory
export function removeSpecificItemFromInventory(character, instanceId) {
  const index = character.inventory.findIndex(item => item.instanceId === instanceId);
  if (index !== -1) {
    return character.inventory.splice(index, 1)[0];
  }
  return null;
}

// Count items in inventory
export function countItemsInInventory(character, itemId) {
  return character.inventory.filter(item => item.id === itemId).length;
}

// Get all items of a type from inventory
export function getItemsFromInventory(character, itemId) {
  return character.inventory.filter(item => item.id === itemId);
}

// Check if character has enough items
export function hasItemsInInventory(character, itemId, count) {
  return countItemsInInventory(character, itemId) >= count;
}

// Convert old inventory format to new format
export function migrateInventory(character) {
  if (!Array.isArray(character.inventory)) {
    const oldInventory = character.inventory;
    character.inventory = [];
    
    // Convert each item type to instances
    for (const [itemId, count] of Object.entries(oldInventory)) {
      for (let i = 0; i < count; i++) {
        // Gathered resources are always common
        const isGatheredResource = GATHERING_ACTIVITIES[itemId] !== undefined;
        // Equipment gets random rarity, everything else is common
        const processingActivity = PROCESSING_ACTIVITIES[itemId];
        const isEquipment = processingActivity && processingActivity.equipmentType !== undefined;
        
        let rarity = 'common';
        if (!isGatheredResource && isEquipment) {
          rarity = rollRarity();
        }
        
        addItemToInventory(character, itemId, rarity);
      }
    }
  }
}
