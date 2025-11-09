// Equipment management and stats calculation

import { CLASS_INFO, EQUIPMENT_STATS, RARITY_TIERS } from './constants.js';
import { gameData } from './game-state.js';
import { saveGame } from './storage.js';

// Get current character
export function getCurrentCharacter() {
  return gameData.characters.find(c => c.id === gameData.currentCharacterId);
}

// Calculate total stats from all equipment
export function calculateTotalStats() {
  const character = getCurrentCharacter();
  if (!character) return {
    damage: 0,
    defense: 0,
    maxHealth: 0,
    strength: 0,
    agility: 0,
    intelligence: 0,
    dodge: 0,
    critChance: 0,
    critDamage: 0,
    lifeOnHit: 0,
    block: 0
  };
  
  const classInfo = CLASS_INFO[character.class];
  let stats = {
    damage: classInfo.baseDamage,
    defense: 0,
    maxHealth: 0,
    strength: 0,
    agility: 0,
    intelligence: 0,
    dodge: 0,
    critChance: 0,
    critDamage: 0,
    lifeOnHit: 0,
    block: 0
  };
  
  // Add stats from equipped items
  Object.values(character.equipment).forEach(equippedItem => {
    if (equippedItem && EQUIPMENT_STATS[equippedItem.id]) {
      const baseStats = EQUIPMENT_STATS[equippedItem.id];
      const rarityMultiplier = RARITY_TIERS[equippedItem.rarity].multiplier;
      
      // Base damage and defense
      stats.damage += Math.ceil(baseStats.damage * rarityMultiplier);
      stats.defense += Math.ceil(baseStats.defense * rarityMultiplier);
      
      // Additional stats from the item
      if (equippedItem.stats) {
        for (const [statName, value] of Object.entries(equippedItem.stats)) {
          stats[statName] = (stats[statName] || 0) + value;
        }
      }
    }
  });
  
  // Apply derived stats from primary stats
  // Strength increases damage
  stats.damage += stats.strength;
  
  // Agility increases dodge and crit chance
  stats.dodge += Math.floor(stats.agility * 0.5);
  stats.critChance += Math.floor(stats.agility * 0.5);
  
  // Intelligence increases crit damage
  stats.critDamage += Math.floor(stats.intelligence * 2);
  
  return stats;
}

// Legacy functions for compatibility
export function calculateTotalDamage() {
  return calculateTotalStats().damage;
}

export function calculateTotalDefense() {
  return calculateTotalStats().defense;
}

export function calculateTotalMaxHP() {
  const character = getCurrentCharacter();
  if (!character) return 0;
  
  const classInfo = CLASS_INFO[character.class];
  return classInfo.baseHP + calculateTotalStats().maxHealth;
}

// Equip an item
export function equipItem(itemId) {
  const character = getCurrentCharacter();
  if (!character) return;
  
  // Find first item of this type in inventory
  const item = character.inventory.find(i => i.id === itemId);
  if (!item) return;
  
  const activity = PROCESSING_ACTIVITIES[itemId];
  if (!activity || !activity.equipmentType) return;
  
  const equipmentSlot = activity.equipmentType;
  
  // Unequip current item if any
  if (character.equipment[equipmentSlot]) {
    character.inventory.push(character.equipment[equipmentSlot]);
  }
  
  // Equip new item
  const index = character.inventory.findIndex(i => i.id === itemId);
  if (index !== -1) {
    character.equipment[equipmentSlot] = character.inventory.splice(index, 1)[0];
  }
  
  saveGame();
}

// Unequip an item
export function unequipItem(slot) {
  const character = getCurrentCharacter();
  if (!character) return;
  
  if (!character.equipment[slot]) return;
  
  // Return item to inventory
  character.inventory.push(character.equipment[slot]);
  character.equipment[slot] = null;
  
  saveGame();
}

// Equip item from modal by instance ID
export function equipItemFromModal(instanceId, slotType) {
  const character = getCurrentCharacter();
  if (!character) return;
  
  // Convert instanceId to number if it's a string
  const numericInstanceId = typeof instanceId === 'string' ? parseFloat(instanceId) : instanceId;
  
  // Find the item instance in inventory
  const item = character.inventory.find(i => i.instanceId === numericInstanceId);
  if (!item) return;
  
  const activity = PROCESSING_ACTIVITIES[item.id];
  if (!activity || activity.equipmentType !== slotType) return;
  
  // Unequip current item if any (return to inventory)
  if (character.equipment[slotType]) {
    character.inventory.push(character.equipment[slotType]);
  }
  
  // Remove item from inventory and equip it
  const index = character.inventory.findIndex(i => i.instanceId === numericInstanceId);
  if (index !== -1) {
    character.equipment[slotType] = character.inventory.splice(index, 1)[0];
  }
  
  saveGame();
}

// Unequip item from modal
export function unequipItemFromModal(slotType) {
  const character = getCurrentCharacter();
  if (!character) return;
  
  if (!character.equipment[slotType]) return;
  
  // Return item to inventory
  character.inventory.push(character.equipment[slotType]);
  character.equipment[slotType] = null;
  
  saveGame();
}
