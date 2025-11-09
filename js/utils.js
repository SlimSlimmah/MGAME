// Utility functions

import { RARITY_TIERS, STAT_DEFINITIONS, STAT_POOLS, STATS_PER_RARITY } from './constants.js';

// Roll for random rarity based on weights
export function rollRarity() {
  const totalWeight = Object.values(RARITY_TIERS).reduce((sum, tier) => sum + tier.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [key, tier] of Object.entries(RARITY_TIERS)) {
    random -= tier.weight;
    if (random <= 0) {
      return key;
    }
  }
  
  return 'common'; // Fallback
}

// Generate random stats for an equipment item
export function generateItemStats(equipmentType, rarity) {
  const numStats = STATS_PER_RARITY[rarity] || 0;
  if (numStats === 0) return null;
  
  const pool = STAT_POOLS[equipmentType];
  if (!pool) return null;
  
  const stats = {};
  const availableStats = [...pool]; // Copy the pool
  
  for (let i = 0; i < numStats && availableStats.length > 0; i++) {
    // Pick a random stat from available ones
    const randomIndex = Math.floor(Math.random() * availableStats.length);
    const statDef = availableStats.splice(randomIndex, 1)[0]; // Remove to avoid duplicates
    
    // Roll value within range
    const value = Math.floor(Math.random() * (statDef.max - statDef.min + 1)) + statDef.min;
    stats[statDef.stat] = value;
  }
  
  return Object.keys(stats).length > 0 ? stats : null;
}

// Format stat value for display
export function formatStatValue(statName, value) {
  const statDef = STAT_DEFINITIONS[statName];
  if (!statDef) return value;
  
  if (statDef.isPercentage) {
    return `${value}%`;
  }
  return value;
}

// Generate HTML for item stats display
export function getItemStatsHTML(item) {
  if (!item || !item.stats) return '';
  
  let statsHTML = '<div style="font-size: 0.7rem; margin-top: 0.5rem; text-align: left; background: rgba(0, 0, 0, 0.2); padding: 0.5rem; border-radius: 0.25rem;">';
  for (const [statName, value] of Object.entries(item.stats)) {
    const statDef = STAT_DEFINITIONS[statName];
    if (statDef) {
      statsHTML += `
        <div style="margin-bottom: 0.25rem; display: flex; justify-content: space-between;">
          <span style="opacity: 0.8;">${statDef.icon} ${statDef.name}</span>
          <span style="font-weight: 700; color: #4ade80;">${formatStatValue(statName, value)}</span>
        </div>
      `;
    }
  }
  statsHTML += '</div>';
  return statsHTML;
}

// Get XP needed for next level
export function getXPForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
