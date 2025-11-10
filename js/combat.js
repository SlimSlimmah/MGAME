// Combat management

import { ENEMY_TYPES } from './constants.js';
import { combatState, setCombatState } from './game-state.js';
import { getCurrentCharacter } from './character.js';
import { calculateTotalStats, calculateTotalMaxHP } from './equipment.js';
import { saveGame } from './storage.js';
import { updatePlayerStats } from './ui.js';

// Start combat
export function startCombat() {
  const character = getCurrentCharacter();
  if (!character) return;
  
  // Initialize combat state
  const totalStats = calculateTotalStats();
  
  setCombatState({
    active: true,
    playerMaxHP: calculateTotalMaxHP(),
    playerHP: calculateTotalMaxHP(),
    playerDamage: totalStats.damage,
    playerDefense: totalStats.defense,
    playerDodge: totalStats.dodge,
    playerCritChance: totalStats.critChance,
    playerCritDamage: 100 + totalStats.critDamage,
    playerLifeOnHit: totalStats.lifeOnHit,
    playerBlock: totalStats.block,
    playerAttackSpeed: 2000,
    playerLastAttack: Date.now(),
    victories: 0,
    totalGoldEarned: 0,
    combatLog: [],
    enemyLastAttack: Date.now() + 500
  });
  
  // Generate first enemy
  generateEnemy();
  
  // Show combat screen
  document.getElementById('combatStartScreen').style.display = 'none';
  document.getElementById('combatActiveScreen').style.display = 'block';
  document.getElementById('combatResultScreen').style.display = 'none';
  
  // Update UI
  updateCombatUI();
  addCombatLog('⚔️ You venture into the wilderness...', 'info');
}

// Generate enemy
export function generateEnemy() {
  // Select enemy type based on victories (harder enemies appear later)
  let enemyTypeIndex = Math.min(Math.floor(combatState.victories / 5), ENEMY_TYPES.length - 1);
  if (combatState.victories > 10) {
    // Add some variety after 10 victories
    enemyTypeIndex = Math.floor(Math.random() * Math.min(ENEMY_TYPES.length, enemyTypeIndex + 2));
  }
  
  const enemyType = ENEMY_TYPES[enemyTypeIndex];
  const enemyLevel = 1 + Math.floor(combatState.victories / 3);
  
  // Scale enemy stats
  const baseHP = 50;
  const baseDamage = 5;
  const baseDefense = 0;
  
  const enemyMaxHP = Math.floor(baseHP * enemyType.hpMultiplier * (1 + (enemyLevel - 1) * 0.3));
  const enemyDamage = Math.floor(baseDamage * enemyType.damageMultiplier * (1 + (enemyLevel - 1) * 0.2));
  const enemyDefense = Math.floor(baseDefense * enemyType.defenseMultiplier * (1 + (enemyLevel - 1) * 0.15));
  
  setCombatState({
    enemyType: enemyType,
    enemyLevel: enemyLevel,
    enemyMaxHP: enemyMaxHP,
    enemyHP: enemyMaxHP,
    enemyDamage: enemyDamage,
    enemyDefense: enemyDefense
  });
  
  addCombatLog(`💀 A Level ${enemyLevel} ${enemyType.name} appears!`, 'enemy');
}

// Update combat UI
export function updateCombatUI() {
  const character = getCurrentCharacter();
  if (!character) return;
  
  // Update player stats
  document.getElementById('combatPlayerName').textContent = character.name;
  document.getElementById('combatPlayerLevel').textContent = character.level;
  document.getElementById('combatPlayerHP').textContent = Math.max(0, Math.floor(combatState.playerHP));
  document.getElementById('combatPlayerMaxHP').textContent = combatState.playerMaxHP;
  document.getElementById('combatPlayerDamage').textContent = combatState.playerDamage;
  document.getElementById('combatPlayerDefense').textContent = combatState.playerDefense;
  
  const playerHPPercent = (combatState.playerHP / combatState.playerMaxHP) * 100;
  document.getElementById('combatPlayerHPBar').style.width = `${playerHPPercent}%`;
  
  // Update enemy stats
  if (combatState.enemyType) {
    document.getElementById('combatEnemyIcon').textContent = combatState.enemyType.icon;
    document.getElementById('combatEnemyName').textContent = combatState.enemyType.name;
    document.getElementById('combatEnemyLevel').textContent = combatState.enemyLevel;
    document.getElementById('combatEnemyHP').textContent = Math.max(0, Math.floor(combatState.enemyHP));
    document.getElementById('combatEnemyMaxHP').textContent = combatState.enemyMaxHP;
    document.getElementById('combatEnemyDamage').textContent = combatState.enemyDamage;
    document.getElementById('combatEnemyDefense').textContent = combatState.enemyDefense;
    
    const enemyHPPercent = (combatState.enemyHP / combatState.enemyMaxHP) * 100;
    document.getElementById('combatEnemyHPBar').style.width = `${enemyHPPercent}%`;
  }
  
  // Update victories
  document.getElementById('combatVictories').textContent = combatState.victories;
}

// Add combat log message
export function addCombatLog(message, type = 'info') {
  const log = document.getElementById('combatLog');
  const entry = document.createElement('div');
  entry.style.fontSize = '0.875rem';
  entry.style.marginBottom = '0.25rem';
  entry.style.opacity = '0.9';
  
  if (type === 'player') {
    entry.style.color = '#22c55e';
  } else if (type === 'enemy') {
    entry.style.color = '#ef4444';
  } else if (type === 'victory') {
    entry.style.color = '#f59e0b';
    entry.style.fontWeight = '600';
  } else if (type === 'dodge') {
    entry.style.color = '#3b82f6';
  } else if (type === 'crit') {
    entry.style.color = '#f59e0b';
  } else if (type === 'block') {
    entry.style.color = '#a855f7';
  }
  
  entry.textContent = message;
  log.appendChild(entry);
  
  // Auto-scroll to bottom
  log.scrollTop = log.scrollHeight;
  
  // Keep only last 20 messages
  while (log.children.length > 20) {
    log.removeChild(log.firstChild);
  }
}

// Process combat tick (called by game loop)
export function processCombatTick() {
  if (!combatState.active) return;
  
  const now = Date.now();
  
  // Update attack progress bars
  const playerAttackProgress = Math.min(((now - combatState.playerLastAttack) / combatState.playerAttackSpeed) * 100, 100);
  const enemyAttackProgress = Math.min(((now - combatState.enemyLastAttack) / combatState.enemyAttackSpeed) * 100, 100);
  
  document.getElementById('combatPlayerAttackBar').style.width = `${playerAttackProgress}%`;
  document.getElementById('combatEnemyAttackBar').style.width = `${enemyAttackProgress}%`;
  
  // Check for player attack
  if (now - combatState.playerLastAttack >= combatState.playerAttackSpeed) {
    executePlayerAttack();
    combatState.playerLastAttack = now;
  }
  
  // Check for enemy attack
  if (now - combatState.enemyLastAttack >= combatState.enemyAttackSpeed) {
    executeEnemyAttack();
    combatState.enemyLastAttack = now;
  }
}

// Execute player attack
export function executePlayerAttack() {
  // Check for crit
  const isCrit = Math.random() * 100 < combatState.playerCritChance;
  let damage = combatState.playerDamage;
  
  if (isCrit) {
    damage = Math.floor(damage * (combatState.playerCritDamage / 100));
  }
  
  // Apply defense (50% effectiveness)
  const damageReduction = Math.floor(combatState.enemyDefense * 0.5);
  damage = Math.max(1, damage - damageReduction);
  
  combatState.enemyHP -= damage;
  
  if (isCrit) {
    addCombatLog(`💥 CRITICAL HIT! You deal ${damage} damage!`, 'crit');
  } else {
    addCombatLog(`⚔️ You deal ${damage} damage!`, 'player');
  }
  
  // Life on hit
  if (combatState.playerLifeOnHit > 0) {
    const healAmount = combatState.playerLifeOnHit;
    combatState.playerHP = Math.min(combatState.playerMaxHP, combatState.playerHP + healAmount);
    addCombatLog(`💚 Recovered ${healAmount} HP`, 'player');
  }
  
  updateCombatUI();
  
  // Check if enemy defeated
  if (combatState.enemyHP <= 0) {
    handleEnemyDefeat();
  }
}

// Execute enemy attack
export function executeEnemyAttack() {
  // Check for dodge
  if (Math.random() * 100 < combatState.playerDodge) {
    addCombatLog(`🌀 You dodged the attack!`, 'dodge');
    return;
  }
  
  // Check for block
  let damage = combatState.enemyDamage;
  if (Math.random() * 100 < combatState.playerBlock) {
    damage = Math.floor(damage * 0.5);
    addCombatLog(`🛡️ You blocked the attack! Damage reduced to ${damage}`, 'block');
  }
  
  // Apply defense (50% effectiveness)
  const damageReduction = Math.floor(combatState.playerDefense * 0.5);
  damage = Math.max(1, damage - damageReduction);
  
  combatState.playerHP -= damage;
  
  addCombatLog(`💥 ${combatState.enemyType.name} deals ${damage} damage!`, 'enemy');
  updateCombatUI();
  
  // Check if player defeated
  if (combatState.playerHP <= 0) {
    handlePlayerDefeat();
  }
}

// Handle enemy defeat
export function handleEnemyDefeat() {
  combatState.victories++;
  
  // Award gold
  const goldReward = combatState.enemyType.goldReward + combatState.enemyLevel;
  combatState.totalGoldEarned += goldReward;
  
  const character = getCurrentCharacter();
  if (character) {
    character.gold = (character.gold || 0) + goldReward;
    saveGame();
    updatePlayerStats();
  }
  
  addCombatLog(`✨ Victory! You earned ${goldReward} gold!`, 'victory');
  addCombatLog(' ', 'info');
  
  // Generate next enemy
  setTimeout(() => {
    if (combatState.active) {
      generateEnemy();
      updateCombatUI();
    }
  }, 1000);
}

// Handle player defeat
export function handlePlayerDefeat() {
  combatState.active = false;
  
  // Show result screen
  document.getElementById('combatActiveScreen').style.display = 'none';
  document.getElementById('combatResultScreen').style.display = 'block';
  
  document.getElementById('combatResultIcon').textContent = '';
  document.getElementById('combatResultTitle').textContent = 'Defeated!';
  document.getElementById('combatResultMessage').textContent = `You were defeated by a Level ${combatState.enemyLevel} ${combatState.enemyType.name}.`;
  document.getElementById('resultVictories').textContent = combatState.victories;
  document.getElementById('resultGold').textContent = combatState.totalGoldEarned;
}

// Retreat from combat
export function retreatFromCombat() {
  combatState.active = false;
  
  // Show result screen
  document.getElementById('combatActiveScreen').style.display = 'none';
  document.getElementById('combatResultScreen').style.display = 'block';
  
  document.getElementById('combatResultIcon').textContent = '';
  document.getElementById('combatResultTitle').textContent = 'Retreated Safely';
  document.getElementById('combatResultMessage').textContent = 'You managed to escape back to safety.';
  document.getElementById('resultVictories').textContent = combatState.victories;
  document.getElementById('resultGold').textContent = combatState.totalGoldEarned;
}

// Reset combat
export function resetCombat() {
  combatState.active = false;
  document.getElementById('combatStartScreen').style.display = 'block';
  document.getElementById('combatActiveScreen').style.display = 'none';
  document.getElementById('combatResultScreen').style.display = 'none';
  
  // Clear combat log
  document.getElementById('combatLog').innerHTML = '<div style="text-align: center; opacity: 0.7; font-size: 0.875rem;">Combat log will appear here...</div>';
}
