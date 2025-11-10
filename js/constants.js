// Game constants and data definitions

export const CLASS_INFO = {
  warrior: {
    name: 'Warrior',
    icon: '⚔️',
    baseHP: 150,
    baseDamage: 12,
    description: 'High HP, melee damage'
  },
  ranger: {
    name: 'Ranger',
    icon: '🏹',
    baseHP: 100,
    baseDamage: 15,
    description: 'Balanced, ranged attacks'
  },
  mage: {
    name: 'Mage',
    icon: '🔮',
    baseHP: 80,
    baseDamage: 20,
    description: 'High damage, low HP'
  }
};

export const RARITY_TIERS = {
  common: {
    name: 'Common',
    color: '#9ca3af',
    multiplier: 1.0,
    weight: 60
  },
  uncommon: {
    name: 'Uncommon',
    color: '#22c55e',
    multiplier: 1.25,
    weight: 25
  },
  rare: {
    name: 'Rare',
    color: '#3b82f6',
    multiplier: 1.5,
    weight: 10
  },
  epic: {
    name: 'Epic',
    color: '#a855f7',
    multiplier: 2.0,
    weight: 4
  },
  legendary: {
    name: 'Legendary',
    color: '#f59e0b',
    multiplier: 2.5,
    weight: 1
  }
};

export const STAT_DEFINITIONS = {
  strength: {
    name: 'Strength',
    icon: '💪',
    description: 'Increases damage'
  },
  agility: {
    name: 'Agility',
    icon: '⚡',
    description: 'Increases dodge and crit chance'
  },
  intelligence: {
    name: 'Intelligence',
    icon: '🧠',
    description: 'Increases crit damage'
  },
  maxHealth: {
    name: 'Max Health',
    icon: '❤️',
    description: 'Increases maximum HP'
  },
  dodge: {
    name: 'Dodge',
    icon: '🌀',
    description: 'Chance to avoid attacks',
    isPercentage: true
  },
  critChance: {
    name: 'Crit Chance',
    icon: '✨',
    description: 'Chance to deal critical damage',
    isPercentage: true
  },
  critDamage: {
    name: 'Crit Damage',
    icon: '💥',
    description: 'Critical hit damage multiplier',
    isPercentage: true
  },
  lifeOnHit: {
    name: 'Life on Hit',
    icon: '💚',
    description: 'HP recovered per attack'
  },
  block: {
    name: 'Block',
    icon: '🛡️',
    description: 'Chance to block attacks',
    isPercentage: true
  }
};

export const STAT_POOLS = {
  weapon: [
    { stat: 'strength', min: 2, max: 8 },
    { stat: 'critChance', min: 3, max: 12 },
    { stat: 'critDamage', min: 10, max: 40 },
    { stat: 'lifeOnHit', min: 1, max: 5 }
  ],
  head: [
    { stat: 'maxHealth', min: 10, max: 30 },
    { stat: 'dodge', min: 2, max: 8 },
    { stat: 'intelligence', min: 1, max: 5 }
  ],
  chest: [
    { stat: 'maxHealth', min: 15, max: 50 },
    { stat: 'block', min: 3, max: 10 },
    { stat: 'strength', min: 1, max: 4 }
  ],
  legs: [
    { stat: 'maxHealth', min: 12, max: 40 },
    { stat: 'dodge', min: 2, max: 8 },
    { stat: 'agility', min: 1, max: 5 }
  ],
  gloves: [
    { stat: 'critChance', min: 2, max: 8 },
    { stat: 'agility', min: 2, max: 6 },
    { stat: 'strength', min: 1, max: 4 }
  ],
  boots: [
    { stat: 'dodge', min: 3, max: 12 },
    { stat: 'agility', min: 2, max: 6 },
    { stat: 'maxHealth', min: 8, max: 25 }
  ]
};

export const STATS_PER_RARITY = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4
};

export const ENEMY_TYPES = [
  { name: 'Goblin', icon: '👹', hpMultiplier: 1.0, damageMultiplier: 0.8, defenseMultiplier: 0.5, goldReward: 5 },
  { name: 'Wolf', icon: '🐺', hpMultiplier: 0.9, damageMultiplier: 1.0, defenseMultiplier: 0.3, goldReward: 6 },
  { name: 'Orc', icon: '👺', hpMultiplier: 1.3, damageMultiplier: 1.0, defenseMultiplier: 0.8, goldReward: 8 },
  { name: 'Troll', icon: '🧌', hpMultiplier: 1.5, damageMultiplier: 0.9, defenseMultiplier: 1.0, goldReward: 10 },
  { name: 'Skeleton', icon: '💀', hpMultiplier: 0.8, damageMultiplier: 1.1, defenseMultiplier: 0.4, goldReward: 7 },
  { name: 'Ogre', icon: '👹', hpMultiplier: 1.7, damageMultiplier: 1.2, defenseMultiplier: 1.2, goldReward: 12 },
  { name: 'Dragon', icon: '🐉', hpMultiplier: 2.0, damageMultiplier: 1.5, defenseMultiplier: 1.5, goldReward: 20 }
];

export const EQUIPMENT_STATS = {
  // Weapons
  stoneSword: { damage: 5, defense: 0 },
  
  // Tools (no combat stats)
  stonePickaxe: { damage: 0, defense: 0 },
  
  // Armor
  leatherHelmet: { damage: 0, defense: 2 },
  leatherChestplate: { damage: 0, defense: 4 },
  leatherLeggings: { damage: 0, defense: 3 },
  leatherGloves: { damage: 0, defense: 1 },
  leatherBoots: { damage: 0, defense: 2 }
};

export const GATHERING_ACTIVITIES = {
  sticks: {
    id: 'sticks',
    name: 'Gather Sticks',
    skill: 'woodcutting',
    duration: 5,
    icon: '<img src="assets/sticks.png" height="24" width="24">',
    resourceIcon: '<img src="assets/sticks.png" height="24" width="24">',
    resourceName: 'Sticks',
    xpGain: 10,
    sellValue: 1
  },
  minnows: {
    id: 'minnows',
    name: 'Catch Minnows',
    skill: 'fishing',
    duration: 5,
    icon: '🐟',
    resourceIcon: '🐟',
    resourceName: 'Minnows',
    xpGain: 10,
    sellValue: 2
  },
  stones: {
    id: 'stones',
    name: 'Gather Stones',
    skill: 'mining',
    duration: 5,
    icon: '🪨',
    resourceIcon: '🪨',
    resourceName: 'Stones',
    xpGain: 10,
    sellValue: 1
  },
  rabbitSkin: {
    id: 'rabbitSkin',
    name: 'Hunt Rabbit',
    skill: 'hunting',
    duration: 5,
    icon: '🐰',
    resourceIcon: '🐇',
    resourceName: 'Rabbit Skin',
    xpGain: 10,
    sellValue: 3
  }
};

export const PROCESSING_ACTIVITIES = {
  cookedMinnows: {
    id: 'cookedMinnows',
    name: 'Cook Minnows',
    skill: 'cooking',
    duration: 5,
    icon: '🍖',
    resourceIcon: '🍖',
    resourceName: 'Cooked Minnows',
    xpGain: 15,
    requires: { minnows: 1 },
    produces: 1,
    sellValue: 5
  },
  stoneSword: {
    id: 'stoneSword',
    name: 'Forge Stone Sword',
    skill: 'forging',
    duration: 10,
    icon: '<img src="assets/stonesword.png" height="24" width="24">',
    resourceIcon: '<img src="assets/stonesword.png" height="24" width="24">',
    resourceName: 'Stone Sword',
    xpGain: 25,
    requires: { sticks: 1, stones: 2 },
    produces: 1,
    equipmentType: 'weapon',
    sellValue: 10
  },
  stonePickaxe: {
    id: 'stonePickaxe',
    name: 'Forge Stone Pickaxe',
    skill: 'forging',
    duration: 10,
    icon: '⛏️',
    resourceIcon: '⛏️',
    resourceName: 'Stone Pickaxe',
    xpGain: 25,
    requires: { sticks: 1, stones: 2 },
    produces: 1,
    equipmentType: 'tool',
    sellValue: 10
  },
  leather: {
    id: 'leather',
    name: 'Craft Leather',
    skill: 'leatherworking',
    duration: 5,
    icon: '🟤',
    resourceIcon: '🟤',
    resourceName: 'Leather',
    xpGain: 15,
    requires: { rabbitSkin: 2 },
    produces: 1,
    sellValue: 8
  },
  leatherHelmet: {
    id: 'leatherHelmet',
    name: 'Craft Leather Helmet',
    skill: 'leatherworking',
    duration: 8,
    icon: '🪖',
    resourceIcon: '🪖',
    resourceName: 'Leather Helmet',
    xpGain: 20,
    requires: { leather: 2 },
    produces: 1,
    equipmentType: 'head',
    sellValue: 20
  },
  leatherChestplate: {
    id: 'leatherChestplate',
    name: 'Craft Leather Chestplate',
    skill: 'leatherworking',
    duration: 10,
    icon: '🦺',
    resourceIcon: '🦺',
    resourceName: 'Leather Chestplate',
    xpGain: 25,
    requires: { leather: 4 },
    produces: 1,
    equipmentType: 'chest',
    sellValue: 40
  },
  leatherLeggings: {
    id: 'leatherLeggings',
    name: 'Craft Leather Leggings',
    skill: 'leatherworking',
    duration: 8,
    icon: '👖',
    resourceIcon: '👖',
    resourceName: 'Leather Leggings',
    xpGain: 20,
    requires: { leather: 3 },
    produces: 1,
    equipmentType: 'legs',
    sellValue: 30
  },
  leatherGloves: {
    id: 'leatherGloves',
    name: 'Craft Leather Gloves',
    skill: 'leatherworking',
    duration: 6,
    icon: '🧤',
    resourceIcon: '🧤',
    resourceName: 'Leather Gloves',
    xpGain: 15,
    requires: { leather: 1 },
    produces: 1,
    equipmentType: 'gloves',
    sellValue: 15
  },
  leatherBoots: {
    id: 'leatherBoots',
    name: 'Craft Leather Boots',
    skill: 'leatherworking',
    duration: 6,
    icon: '👢',
    resourceIcon: '👢',
    resourceName: 'Leather Boots',
    xpGain: 15,
    requires: { leather: 2 },
    produces: 1,
    equipmentType: 'boots',
    sellValue: 20
  }
};
