// config.js — every tunable number, ingredient and recipe for Ember & Thyme.
// One clear job: the game's data. No logic lives here.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const HUD_H = 88;
export const CHEF_SPEED = 265;
export const CHEF_RADIUS = 21;
export const INTERACT_DIST = 82;
export const SHIFT_SECONDS = 180;
export const MAX_ORDERS = 4;

// Ingredients. `prep` says what a raw ingredient needs before it can be plated.
export const INGREDIENTS = {
  bun:            { name: 'Bun',        prep: 'ready',  color: '#e8a95c', price: 0 },
  patty:          { name: 'Patty',      prep: 'grill',  color: '#8a5a3b', price: 0 },
  pattyCooked:    { name: 'Patty',      prep: 'ready',  color: '#7a4a2e', price: 0 },
  tomato:         { name: 'Tomato',     prep: 'chop',   color: '#e0483e', price: 0 },
  tomatoChopped:  { name: 'Tomato',     prep: 'ready',  color: '#ef6a5e', price: 0 },
  lettuce:        { name: 'Lettuce',    prep: 'chop',   color: '#5da244', price: 0 },
  lettuceChopped: { name: 'Lettuce',    prep: 'ready',  color: '#7cc35a', price: 0 },
  cheese:         { name: 'Cheese',     prep: 'ready',  color: '#f2c14e', price: 0 },
  onion:          { name: 'Onion',      prep: 'chop',   color: '#b678c2', price: 0 },
  onionChopped:   { name: 'Onion',      prep: 'ready',  color: '#c98fd6', price: 0 },
  burnt:          { name: 'Burnt',      prep: 'trash',  color: '#2b2320', price: 0 },
};

// What chopping / grilling turns an ingredient into, and how long it takes.
export const PREP = {
  chop: {
    tomato:  { into: 'tomatoChopped',  seconds: 1.4 },
    lettuce: { into: 'lettuceChopped', seconds: 1.4 },
    onion:   { into: 'onionChopped',  seconds: 1.4 },
  },
  grill: {
    patty: { into: 'pattyCooked', seconds: 3.6, burnAfter: 8.0 },
  },
};

// Recipes: the exact set of plated items an order asks for.
export const RECIPES = {
  garden: {
    name: 'Garden Burger', price: 12,
    items: ['bun', 'pattyCooked', 'lettuceChopped', 'tomatoChopped'],
    blurb: 'The house classic',
  },
  cheese: {
    name: 'Cheese Melt', price: 10,
    items: ['bun', 'pattyCooked', 'cheese'],
    blurb: 'Golden and gooey',
  },
  ember: {
    name: 'Ember Stack', price: 16,
    items: ['bun', 'pattyCooked', 'cheese', 'onionChopped', 'tomatoChopped'],
    blurb: 'Five layers high',
  },
  green: {
    name: 'Green Bowl', price: 9,
    items: ['lettuceChopped', 'tomatoChopped', 'onionChopped'],
    blurb: 'No bun, all crunch',
  },
};
export const RECIPE_ORDER = ['garden', 'cheese', 'ember', 'green'];

// Difficulty ramp over the 3-minute shift.
export function spawnIntervalAt(elapsed) {
  return Math.max(7, 14 - elapsed * 0.045);
}
export function patienceAt(elapsed) {
  return Math.max(30, 46 - elapsed * 0.09);
}
export function tipFor(order, combo) {
  const frac = Math.max(0, order.timeLeft / order.patience);
  return Math.round(5 * frac) + Math.min(combo, 5);
}
