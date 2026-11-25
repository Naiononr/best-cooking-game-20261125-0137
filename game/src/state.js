// state.js — the game's state: orders, score, combo, shift clock, the chef's
// hands, and the toasts. Pure state transitions; rendering lives in render.js.

import { RECIPES, RECIPE_ORDER, spawnIntervalAt, patienceAt, tipFor } from './config.js';

let nextOrderId = 1;

export function createGame() {
  return {
    mode: 'title', // title | playing | paused | over
    elapsed: 0,
    timeLeft: 180,
    coins: 0,
    served: 0,
    expired: 0,
    combo: 0,
    bestCombo: 0,
    orders: [],
    spawnTimer: 6,
    hands: null, // null | { kind: 'item', id } | { kind: 'plate', items: [] }
    toast: null,
    toastTimer: 0,
    flash: 0, // red flash on a failed serve
    frozen: false, // screenshot staging freezes the clock
  };
}

export function resetGame(game) {
  const fresh = createGame();
  Object.assign(game, fresh, { mode: 'playing' });
  spawnOrder(game, 0);
  spawnOrder(game, 0);
}

export function spawnOrder(game, elapsed) {
  if (game.orders.length >= 4) return;
  const recipeId = RECIPE_ORDER[Math.floor(Math.random() * RECIPE_ORDER.length)];
  const patience = patienceAt(elapsed);
  game.orders.push({
    id: nextOrderId++,
    recipe: recipeId,
    patience,
    timeLeft: patience,
    born: elapsed,
  });
}

export function setToast(game, text, seconds = 2.2) {
  game.toast = text;
  game.toastTimer = seconds;
}

export function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

// Try to serve the plate the chef carries at the pass. Returns 'served',
// 'wrong' or 'empty'.
export function servePlate(game) {
  if (!game.hands || game.hands.kind !== 'plate') return 'empty';
  const items = game.hands.items;
  if (items.length === 0) return 'empty';
  const match = game.orders.find((o) => sameSet(items, RECIPES[o.recipe].items));
  if (!match) return 'wrong';
  const recipe = RECIPES[match.recipe];
  const tip = tipFor(match, game.combo);
  game.coins += recipe.price + tip;
  game.served += 1;
  game.combo += 1;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  game.orders = game.orders.filter((o) => o.id !== match.id);
  game.hands = null;
  setToast(game, `${recipe.name} served! +$${recipe.price} + $${tip} tip`);
  return 'served';
}

export function updateOrders(game, dt) {
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    spawnOrder(game, game.elapsed);
    game.spawnTimer = spawnIntervalAt(game.elapsed);
  }
  for (const order of game.orders) order.timeLeft -= dt;
  const dead = game.orders.filter((o) => o.timeLeft <= 0);
  if (dead.length > 0) {
    game.orders = game.orders.filter((o) => o.timeLeft > 0);
    game.expired += dead.length;
    game.combo = 0;
    setToast(game, dead.length === 1 ? 'An order walked out…' : `${dead.length} orders walked out…`);
    return 'expired';
  }
  return null;
}

export function updateShift(game, dt) {
  game.elapsed += dt;
  game.timeLeft = Math.max(0, 180 - game.elapsed);
  if (game.timeLeft <= 0) {
    game.mode = 'over';
    return 'over';
  }
  return null;
}

export function tickToast(game, dt) {
  if (game.toastTimer > 0) {
    game.toastTimer -= dt;
    if (game.toastTimer <= 0) game.toast = null;
  }
  if (game.flash > 0) game.flash = Math.max(0, game.flash - dt * 3);
}
