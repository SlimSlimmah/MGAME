// Shop management

import { GATHERING_ACTIVITIES, PROCESSING_ACTIVITIES, RARITY_TIERS } from './constants.js';
import { getCurrentCharacter } from './character.js';
import { removeItemFromInventory, removeSpecificItemFromInventory } from './inventory.js';
import { saveGame } from './storage.js';
import { updateShopUI, updatePlayerStats } from './ui.js';

// Sell a non-equipment item
export function sellItem(itemId) {
  const character = getCurrentCharacter();
  if (!character) return;
  
  const activity = GATHERING_ACTIVITIES[itemId] || PROCESSING_ACTIVITIES[itemId];
  if (!activity) return;
  
  // Remove one item from inventory
  const removed = removeItemFromInventory(character, itemId);
  if (!removed) return;
  
  // Add gold
  const sellValue = activity.sellValue || 1;
  character.gold = (character.gold || 0) + sellValue;
  
  saveGame();
  updateShopUI();
  updatePlayerStats();
}

// Sell an equipment item by instance ID
export function sellEquipmentItem(instanceId) {
  const character = getCurrentCharacter();
  if (!character) return;
  
  // Find the item
  const item = character.inventory.find(i => i.instanceId === instanceId);
  if (!item) return;
  
  const activity = PROCESSING_ACTIVITIES[item.id];
  if (!activity) return;
  
  // Remove the specific item
  const removed = removeSpecificItemFromInventory(character, instanceId);
  if (!removed) return;
  
  // Calculate sell value with rarity multiplier
  const rarityInfo = RARITY_TIERS[item.rarity];
  const baseSellValue = activity.sellValue || 10;
  const sellValue = Math.ceil(baseSellValue * rarityInfo.multiplier);
  
  // Add gold
  character.gold = (character.gold || 0) + sellValue;
  
  saveGame();
  updateShopUI();
  updatePlayerStats();
}
