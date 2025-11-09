// UI management and display functions

import { CLASS_INFO, GATHERING_ACTIVITIES, PROCESSING_ACTIVITIES, RARITY_TIERS, EQUIPMENT_STATS } from './constants.js';
import { gameData, activeGameTab, activeSkillsTab, setActiveGameTab, setActiveSkillsTab, currentActivity, combatState } from './game-state.js';
import { getCurrentCharacter } from './character.js';
import { calculateTotalStats, calculateTotalMaxHP } from './equipment.js';
import { countItemsInInventory } from './inventory.js';
import { getXPForLevel, getItemStatsHTML } from './utils.js';
import { updateActivityButtons } from './skills.js';
import { saveGame } from './storage.js';
import { sellItem, sellEquipmentItem } from './shop.js';
import { equipItemFromModal, unequipItemFromModal } from './equipment.js';

// Show character list
export function showCharacterList() {
  // Save current character's activity state before leaving
  if (window.saveCharacterActivity) {
    window.saveCharacterActivity();
  }
  
  document.getElementById('characterList').classList.add('active');
  document.getElementById('characterCreation').classList.remove('active');
  document.getElementById('gameView').classList.remove('active');
  
  renderCharacterSlots();
}

// Show character creation
export function showCharacterCreation() {
  document.getElementById('characterList').classList.remove('active');
  document.getElementById('characterCreation').classList.add('active');
  document.getElementById('gameView').classList.remove('active');
}

// Render character slots
export function renderCharacterSlots() {
  const container = document.getElementById('characterSlots');
  container.innerHTML = '';
  
  // Render existing characters
  gameData.characters.forEach(character => {
    const classInfo = CLASS_INFO[character.class];
    const slot = document.createElement('div');
    slot.className = 'char-slot';
    // Use global window function instead of import
    slot.onclick = () => window.playCharacter(character.id);
    
    let activityIndicator = '';
    if (character.currentActivity) {
      const activityType = character.currentActivity.activityType || 'gathering';
      const activities = activityType === 'gathering' ? GATHERING_ACTIVITIES : PROCESSING_ACTIVITIES;
      const activity = activities[character.currentActivity.activityId];
      if (activity) {
        activityIndicator = `<div class="char-activity">🔄 ${activity.name}</div>`;
      }
    }
    
    // Create delete button separately to avoid onclick conflicts
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      window.deleteCharacter(character.id, e);
    };
    
    slot.innerHTML = `
      <div class="char-info">
        <div class="char-icon">${classInfo.icon}</div>
        <div class="char-details">
          <h3>${character.name}</h3>
          <p>${classInfo.name} - Level ${character.level}</p>
          ${activityIndicator}
        </div>
      </div>
      <div class="char-actions">
        <div class="char-level">Lv ${character.level}</div>
        <span class="delete-btn-placeholder"></span>
      </div>
    `;
    
    // Insert the delete button
    slot.querySelector('.delete-btn-placeholder').replaceWith(deleteBtn);
    
    container.appendChild(slot);
  });
  
  // Render empty/locked slots
  const remainingSlots = gameData.maxSlots - gameData.characters.length;
  
  for (let i = 0; i < remainingSlots; i++) {
    const slot = document.createElement('div');
    slot.className = 'char-slot empty';
    // Use global window function
    slot.onclick = () => window.showCharacterCreation();
    slot.innerHTML = `
      <div>
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">➕</div>
        <div>Create New Character</div>
      </div>
    `;
    container.appendChild(slot);
  }
  
  // Show locked slots
  if (gameData.characters.length === gameData.maxSlots) {
    const lockedSlot = document.createElement('div');
    lockedSlot.className = 'char-slot locked-slot';
    lockedSlot.innerHTML = `
      <div>
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔒</div>
        <div class="unlock-text">Unlock at Level 10</div>
      </div>
    `;
    container.appendChild(lockedSlot);
  }
}

// Update player stats display
export function updatePlayerStats() {
  const character = getCurrentCharacter();
  if (!character) return;
  
  // Initialize gold if missing
  if (character.gold === undefined) {
    character.gold = 0;
  }
  
  const totalStats = calculateTotalStats();
  
  document.getElementById('playerGold').textContent = character.gold;
  document.getElementById('totalDamage').textContent = totalStats.damage;
  document.getElementById('totalDefense').textContent = totalStats.defense;
  
  const maxHPElement = document.getElementById('totalMaxHP');
  if (maxHPElement) {
    maxHPElement.textContent = calculateTotalMaxHP();
  }
}

// Update game UI with character data
export function updateGameUI() {
  const character = getCurrentCharacter();
  if (!character) return;
  
  // Update skills display
  ['woodcutting', 'fishing', 'mining', 'hunting', 'cooking', 'forging', 'leatherworking'].forEach(skill => {
    const skillData = character.skills[skill];
    const xpNeeded = getXPForLevel(skillData.level + 1);
    const xpProgress = (skillData.xp / xpNeeded) * 100;
    
    document.getElementById(`${skill}Level`).textContent = skillData.level;
    document.getElementById(`${skill}XP`).textContent = Math.floor(skillData.xp);
    document.getElementById(`${skill}XPNext`).textContent = xpNeeded;
    document.getElementById(`${skill}XPBar`).style.width = `${xpProgress}%`;
  });
  
  // Update activity buttons based on available materials
  updateActivityButtons();
}

// Switch game tab
export function switchGameTab(tab) {
  setActiveGameTab(tab);
  
  document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.game-tab-content').forEach(t => t.classList.remove('active'));
  
  document.querySelector(`[onclick="switchGameTab('${tab}')"]`).classList.add('active');
  document.getElementById(`${tab}Tab`).classList.add('active');
  
  if (tab === 'inventory') {
    updateInventoryUI();
  } else if (tab === 'equipment') {
    updateEquipmentUI();
  } else if (tab === 'shop') {
    updateShopUI();
  } else if (tab === 'combat') {
    // Reset combat screen if not active
    if (combatState && !combatState.active && window.resetCombat) {
      window.resetCombat();
    }
  }
}

// Switch skills sub-tab
export function switchSkillsTab(tab) {
  setActiveSkillsTab(tab);
  
  document.querySelectorAll('.skills-sub-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.skills-sub-content').forEach(t => t.classList.remove('active'));
  
  document.querySelector(`[onclick="switchSkillsTab('${tab}')"]`).classList.add('active');
  document.getElementById(`${tab}SubTab`).classList.add('active');
}

// Toggle skill section collapse
export function toggleSkillSection(header) {
  const section = header.parentElement;
  section.classList.toggle('collapsed');
}

// Update inventory UI
export function updateInventoryUI() {
  const character = getCurrentCharacter();
  if (!character) return;
  
  const inventoryGrid = document.getElementById('inventoryGrid');
  inventoryGrid.innerHTML = '';
  
  if (character.inventory.length === 0) {
    inventoryGrid.innerHTML = '<div class="coming-soon"><p>Your inventory is empty.<br>Start gathering resources!</p></div>';
    return;
  }
  
  // Group non-equipment items by id for display
  const itemGroups = {};
  const equipmentItems = [];
  
  character.inventory.forEach(item => {
    const processingActivity = PROCESSING_ACTIVITIES[item.id];
    const isEquipment = processingActivity && processingActivity.equipmentType !== undefined;
    
    if (isEquipment) {
      equipmentItems.push(item);
    } else {
      if (!itemGroups[item.id]) {
        itemGroups[item.id] = [];
      }
      itemGroups[item.id].push(item);
    }
  });
  
  // Display grouped non-equipment items
  Object.entries(itemGroups).forEach(([itemId, items]) => {
    const activity = GATHERING_ACTIVITIES[itemId] || PROCESSING_ACTIVITIES[itemId];
    if (!activity) return;
    
    const count = items.length;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'inventory-item';
    
    itemDiv.innerHTML = `
      <div class="inventory-item-icon">${activity.resourceIcon}</div>
      <div class="inventory-item-name">${activity.resourceName}</div>
      <div class="inventory-item-count">×${count}</div>
    `;
    inventoryGrid.appendChild(itemDiv);
  });
  
  // Display each equipment item separately
  equipmentItems.forEach(item => {
    const activity = PROCESSING_ACTIVITIES[item.id];
    if (!activity) return;
    
    const rarityInfo = RARITY_TIERS[item.rarity];
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'inventory-item';
    
    // Show rarity styling for non-common equipment
    if (item.rarity !== 'common') {
      itemDiv.style.borderColor = rarityInfo.color;
      itemDiv.style.borderWidth = '2px';
      itemDiv.style.borderStyle = 'solid';
    }
    
    // Show stats for equipment
    let statsHtml = '';
    if (EQUIPMENT_STATS[item.id]) {
      const stats = EQUIPMENT_STATS[item.id];
      const multiplier = rarityInfo.multiplier;
      const finalDamage = Math.ceil(stats.damage * multiplier);
      const finalDefense = Math.ceil(stats.defense * multiplier);
      
      if (finalDamage > 0 || finalDefense > 0) {
        statsHtml = '<div style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.8;">';
        if (finalDamage > 0) statsHtml += `⚔️ ${finalDamage} `;
        if (finalDefense > 0) statsHtml += `🛡️ ${finalDefense}`;
        statsHtml += '</div>';
      }
    }
    
    const rarityNameHtml = item.rarity !== 'common' 
      ? `<div style="color: ${rarityInfo.color}; font-size: 0.75rem; font-weight: 600; margin-top: 0.25rem;">${rarityInfo.name}</div>`
      : '';
    
    itemDiv.innerHTML = `
      <div class="inventory-item-icon">${activity.resourceIcon}</div>
      <div class="inventory-item-name">${activity.resourceName}</div>
      ${rarityNameHtml}
      ${statsHtml}
      ${getItemStatsHTML(item)}
    `;
    inventoryGrid.appendChild(itemDiv);
  });
}

// Update equipment UI
export function updateEquipmentUI() {
  const character = getCurrentCharacter();
  if (!character) return;
  
  const slots = [
    { id: 'head', label: 'Head' },
    { id: 'chest', label: 'Chest' },
    { id: 'legs', label: 'Legs' },
    { id: 'gloves', label: 'Gloves' },
    { id: 'boots', label: 'Boots' },
    { id: 'weapon', label: 'Weapon' },
    { id: 'tool', label: 'Tool' }
  ];
  
  // Update each equipment slot
  slots.forEach(slot => {
    const slotElement = document.getElementById(`${slot.id}SlotContent`);
    if (!slotElement) return;
    
    if (character.equipment[slot.id]) {
      const equippedItem = character.equipment[slot.id];
      const itemData = PROCESSING_ACTIVITIES[equippedItem.id];
      const rarityInfo = RARITY_TIERS[equippedItem.rarity];
      
      if (itemData && rarityInfo) {
        const stats = EQUIPMENT_STATS[equippedItem.id];
        const multiplier = rarityInfo.multiplier;
        const finalDamage = Math.ceil(stats.damage * multiplier);
        const finalDefense = Math.ceil(stats.defense * multiplier);
        
        let statsText = '';
        if (finalDamage > 0) statsText += `⚔️ ${finalDamage} `;
        if (finalDefense > 0) statsText += `🛡️ ${finalDefense}`;
        
        slotElement.innerHTML = `
          <div class="equipped-item" style="border: 2px solid ${rarityInfo.color}; padding: 0.5rem; border-radius: 0.5rem;">
            <div class="equipped-item-icon">${itemData.resourceIcon}</div>
            <div class="equipped-item-name">${itemData.resourceName}</div>
            <div style="color: ${rarityInfo.color}; font-size: 0.75rem; font-weight: 600; margin-top: 0.25rem;">${rarityInfo.name}</div>
            ${statsText ? `<div style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.8;">${statsText}</div>` : ''}
            ${getItemStatsHTML(equippedItem)}
          </div>
        `;
      } else {
        slotElement.innerHTML = '<div class="slot-empty">Click to equip</div>';
      }
    } else {
      slotElement.innerHTML = '<div class="slot-empty">Click to equip</div>';
    }
  });
  
  // Update player stats display after equipment changes
  updatePlayerStats();
}

// Open equipment selector modal
export function openEquipmentSelector(slotType) {
  const character = getCurrentCharacter();
  if (!character) return;
  
  const modal = document.getElementById('equipmentModal');
  const modalBody = document.getElementById('equipmentModalBody');
  const modalTitle = document.getElementById('modalTitle');
  
  const slotLabels = {
    weapon: 'Weapon',
    tool: 'Tool',
    head: 'Helmet',
    chest: 'Chestplate',
    legs: 'Leggings',
    gloves: 'Gloves',
    boots: 'Boots'
  };
  
  modalTitle.textContent = `Select ${slotLabels[slotType] || 'Equipment'}`;
  
  // Get available equipment for this slot type
  const availableEquipment = character.inventory.filter(item => {
    const activity = PROCESSING_ACTIVITIES[item.id];
    return activity && activity.equipmentType === slotType;
  });
  
  let content = '';
  
  // Add unequip button if something is equipped
  if (character.equipment[slotType]) {
    content += `<button class="modal-unequip-btn" onclick="unequipItemFromModal('${slotType}'); closeEquipmentModal(); updateEquipmentUI();">Unequip Current</button>`;
  }
  
  if (availableEquipment.length === 0) {
    content += `<div class="modal-empty">No ${slotLabels[slotType].toLowerCase()}s available.<br>Craft some in the Processing tab!</div>`;
  } else {
    content += '<div class="modal-equipment-list">';
    availableEquipment.forEach(item => {
      const activity = PROCESSING_ACTIVITIES[item.id];
      const rarityInfo = RARITY_TIERS[item.rarity];
      const isEquipped = character.equipment[slotType]?.instanceId === item.instanceId;
      
      const stats = EQUIPMENT_STATS[item.id];
      const multiplier = rarityInfo.multiplier;
      const finalDamage = Math.ceil(stats.damage * multiplier);
      const finalDefense = Math.ceil(stats.defense * multiplier);
      
      let statsText = '';
      if (finalDamage > 0) statsText += `⚔️ ${finalDamage} `;
      if (finalDefense > 0) statsText += `🛡️ ${finalDefense}`;
      
      content += `
        <div class="modal-equipment-item ${isEquipped ? 'equipped' : ''}" 
             onclick="equipItemFromModal('${item.instanceId}', '${slotType}'); updateEquipmentUI(); closeEquipmentModal();"
             style="border-color: ${rarityInfo.color}; ${isEquipped ? 'background: rgba(74, 222, 128, 0.1);' : ''}">
          <div class="modal-equipment-icon">${activity.resourceIcon}</div>
          <div class="modal-equipment-name">${activity.resourceName}</div>
          <div style="color: ${rarityInfo.color}; font-size: 0.7rem; font-weight: 600;">${rarityInfo.name}</div>
          ${statsText ? `<div style="font-size: 0.7rem; margin-top: 0.25rem; opacity: 0.8;">${statsText}</div>` : ''}
          ${getItemStatsHTML(item)}
          ${isEquipped ? '<div style="color: #4ade80; font-size: 0.7rem; margin-top: 0.25rem;">✓ Equipped</div>' : ''}
        </div>
      `;
    });
    content += '</div>';
  }
  
  modalBody.innerHTML = content;
  modal.classList.add('active');
}

// Close equipment modal
export function closeEquipmentModal() {
  document.getElementById('equipmentModal').classList.remove('active');
}

// Update shop UI
export function updateShopUI() {
  const character = getCurrentCharacter();
  if (!character) return;
  
  const shopGrid = document.getElementById('shopGrid');
  shopGrid.innerHTML = '';
  
  if (character.inventory.length === 0) {
    shopGrid.innerHTML = '<div class="coming-soon"><p>Your inventory is empty.<br>Nothing to sell!</p></div>';
    return;
  }
  
  // Group non-equipment items by id
  const itemGroups = {};
  const equipmentItems = [];
  
  character.inventory.forEach(item => {
    const processingActivity = PROCESSING_ACTIVITIES[item.id];
    const isEquipment = processingActivity && processingActivity.equipmentType !== undefined;
    
    if (isEquipment) {
      equipmentItems.push(item);
    } else {
      if (!itemGroups[item.id]) {
        itemGroups[item.id] = [];
      }
      itemGroups[item.id].push(item);
    }
  });
  
  // Display grouped non-equipment items
  Object.entries(itemGroups).forEach(([itemId, items]) => {
    const activity = GATHERING_ACTIVITIES[itemId] || PROCESSING_ACTIVITIES[itemId];
    if (!activity) return;
    
    const count = items.length;
    const sellValue = activity.sellValue || 1;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'inventory-item';
    itemDiv.style.cursor = 'pointer';
    itemDiv.onclick = () => sellItem(itemId);
    
    itemDiv.innerHTML = `
      <div class="inventory-item-icon">${activity.resourceIcon}</div>
      <div class="inventory-item-name">${activity.resourceName}</div>
      <div class="inventory-item-count">×${count}</div>
      <div style="color: #f59e0b; font-size: 0.875rem; font-weight: 600; margin-top: 0.25rem;">💰 ${sellValue} each</div>
    `;
    itemDiv.onmouseenter = () => itemDiv.style.transform = 'translateY(-2px)';
    itemDiv.onmouseleave = () => itemDiv.style.transform = '';
    
    shopGrid.appendChild(itemDiv);
  });
  
  // Display each equipment item separately
  equipmentItems.forEach(item => {
    const activity = PROCESSING_ACTIVITIES[item.id];
    if (!activity) return;
    
    const rarityInfo = RARITY_TIERS[item.rarity];
    const baseSellValue = activity.sellValue || 10;
    const sellValue = Math.ceil(baseSellValue * rarityInfo.multiplier);
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'inventory-item';
    itemDiv.style.cursor = 'pointer';
    itemDiv.onclick = () => sellEquipmentItem(item.instanceId);
    
    if (item.rarity !== 'common') {
      itemDiv.style.borderColor = rarityInfo.color;
      itemDiv.style.borderWidth = '2px';
      itemDiv.style.borderStyle = 'solid';
    }
    
    let statsHtml = '';
    if (EQUIPMENT_STATS[item.id]) {
      const stats = EQUIPMENT_STATS[item.id];
      const multiplier = rarityInfo.multiplier;
      const finalDamage = Math.ceil(stats.damage * multiplier);
      const finalDefense = Math.ceil(stats.defense * multiplier);
      
      if (finalDamage > 0 || finalDefense > 0) {
        statsHtml = '<div style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.8;">';
        if (finalDamage > 0) statsHtml += `⚔️ ${finalDamage} `;
        if (finalDefense > 0) statsHtml += `🛡️ ${finalDefense}`;
        statsHtml += '</div>';
      }
    }
    
    const rarityNameHtml = item.rarity !== 'common' 
      ? `<div style="color: ${rarityInfo.color}; font-size: 0.75rem; font-weight: 600; margin-top: 0.25rem;">${rarityInfo.name}</div>`
      : '';
    
    itemDiv.innerHTML = `
      <div class="inventory-item-icon">${activity.resourceIcon}</div>
      <div class="inventory-item-name">${activity.resourceName}</div>
      ${rarityNameHtml}
      ${statsHtml}
      ${getItemStatsHTML(item)}
      <div style="color: #f59e0b; font-size: 0.875rem; font-weight: 600; margin-top: 0.25rem;">💰 ${sellValue}</div>
    `;
    itemDiv.onmouseenter = () => itemDiv.style.transform = 'translateY(-2px)';
    itemDiv.onmouseleave = () => itemDiv.style.transform = '';
    
    shopGrid.appendChild(itemDiv);
  });
}