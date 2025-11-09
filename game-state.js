// Game state management

export let gameData = {
  characters: [],
  maxSlots: 3,
  selectedClass: null,
  currentCharacterId: null
};

export let currentActivity = {
  active: false,
  activityId: null,
  activityType: null,
  startTime: null,
  duration: 0,
  quantity: 1,
  completed: 0
};

export let combatState = {
  active: false,
  playerHP: 0,
  playerMaxHP: 0,
  playerDamage: 0,
  playerDefense: 0,
  playerAttackSpeed: 2000,
  playerLastAttack: 0,
  playerDodge: 0,
  playerCritChance: 0,
  playerCritDamage: 0,
  playerLifeOnHit: 0,
  playerBlock: 0,
  enemyHP: 0,
  enemyMaxHP: 0,
  enemyDamage: 0,
  enemyDefense: 0,
  enemyAttackSpeed: 2500,
  enemyLastAttack: 0,
  enemyLevel: 1,
  enemyType: null,
  victories: 0,
  totalGoldEarned: 0,
  combatLog: []
};

export let activeGameTab = 'skills';
export let activeSkillsTab = 'gathering';

// Helper to update game data
export function setGameData(newData) {
  gameData = newData;
}

// Helper to update current activity
export function setCurrentActivity(newActivity) {
  Object.assign(currentActivity, newActivity);
}

// Helper to update combat state
export function setCombatState(newState) {
  Object.assign(combatState, newState);
}

// Helper to set active tabs
export function setActiveGameTab(tab) {
  activeGameTab = tab;
}

export function setActiveSkillsTab(tab) {
  activeSkillsTab = tab;
}
