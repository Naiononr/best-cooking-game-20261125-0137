// kitchen.js — the kitchen itself: stations, their slots, and every
// interaction (pick up, chop, grill, assemble, serve, trash). The chef's
// movement and collision live here too.

import { CHEF_SPEED, CHEF_RADIUS, INTERACT_DIST, PREP, INGREDIENTS } from './config.js';
import { setToast, servePlate } from './state.js';

export const STATIONS = [
  { id: 'bun',     kind: 'crate', label: 'Buns',     gives: 'bun',     x: 24,   y: 100, w: 110, h: 64 },
  { id: 'patty',   kind: 'crate', label: 'Patties',  gives: 'patty',   x: 146,  y: 100, w: 110, h: 64 },
  { id: 'tomato',  kind: 'crate', label: 'Tomatoes', gives: 'tomato',  x: 268,  y: 100, w: 110, h: 64 },
  { id: 'lettuce', kind: 'crate', label: 'Lettuce',  gives: 'lettuce', x: 390,  y: 100, w: 110, h: 64 },
  { id: 'cheese',  kind: 'crate', label: 'Cheese',   gives: 'cheese',  x: 512,  y: 100, w: 110, h: 64 },
  { id: 'onion',   kind: 'crate', label: 'Onions',   gives: 'onion',   x: 634,  y: 100, w: 110, h: 64 },
  { id: 'board',   kind: 'board', label: 'Chopping Board', x: 756, y: 100, w: 130, h: 64 },
  { id: 'grill',   kind: 'grill', label: 'Grill',     x: 898,  y: 100, w: 180, h: 64 },
  { id: 'plate',   kind: 'plate', label: 'Plating Counter', x: 1090, y: 100, w: 166, h: 64 },
  { id: 'pass',    kind: 'pass',  label: 'Serving Pass',    x: 470,  y: 648, w: 340, h: 64 },
  { id: 'trash',   kind: 'trash', label: 'Trash',     x: 1080, y: 648, w: 176, h: 64 },
];

// Solid furniture the chef walks around: the central prep table.
export const OBSTACLES = [
  { x: 470, y: 330, w: 340, h: 96 },
];

export function createKitchen() {
  return {
    chef: { x: 640, y: 470, facing: 1 },
    board: { item: null, progress: 0, chopSfx: 0 },
    grill: [
      { item: null, progress: 0, done: false },
      { item: null, progress: 0, done: false },
    ],
    plate: { items: [], respawn: 0 },
    walkTarget: null,
  };
}

function stationById(id) {
  return STATIONS.find((s) => s.id === id);
}

function clampChef(chef) {
  chef.x = Math.max(24 + CHEF_RADIUS, Math.min(1280 - 24 - CHEF_RADIUS, chef.x));
  chef.y = Math.max(88 + 64 + CHEF_RADIUS + 8, Math.min(720 - 24 - CHEF_RADIUS, chef.y));
  // Keep the chef out of every counter's rectangle (plus a margin),
  // and out of the central prep table.
  for (const s of [...STATIONS, ...OBSTACLES]) {
    const nx = Math.max(s.x, Math.min(chef.x, s.x + s.w));
    const ny = Math.max(s.y, Math.min(chef.y, s.y + s.h));
    const dx = chef.x - nx;
    const dy = chef.y - ny;
    const d2 = dx * dx + dy * dy;
    if (d2 < CHEF_RADIUS * CHEF_RADIUS) {
      const d = Math.sqrt(d2) || 0.001;
      chef.x = nx + (dx / d) * CHEF_RADIUS;
      chef.y = ny + (dy / d) * CHEF_RADIUS;
    }
  }
}

export function moveChef(kitchen, input, dt) {
  const chef = kitchen.chef;
  const v = input.moveVector();
  if (v.x !== 0 || v.y !== 0) {
    kitchen.walkTarget = null;
    chef.x += v.x * CHEF_SPEED * dt;
    chef.y += v.y * CHEF_SPEED * dt;
    if (v.x !== 0) chef.facing = v.x > 0 ? 1 : -1;
    clampChef(chef);
    return;
  }
  if (kitchen.walkTarget) {
    const dx = kitchen.walkTarget.x - chef.x;
    const dy = kitchen.walkTarget.y - chef.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) {
      kitchen.walkTarget = null;
    } else {
      chef.x += (dx / d) * CHEF_SPEED * dt;
      chef.y += (dy / d) * CHEF_SPEED * dt;
      if (Math.abs(dx) > 4) chef.facing = dx > 0 ? 1 : -1;
      clampChef(chef);
    }
  }
}

// Distance from a point to a station's rectangle.
export function distToStation(px, py, st) {
  const nx = Math.max(st.x, Math.min(px, st.x + st.w));
  const ny = Math.max(st.y, Math.min(py, st.y + st.h));
  return Math.hypot(px - nx, py - ny);
}

export function nearestStation(kitchen) {
  let best = null;
  let bestD = Infinity;
  for (const st of STATIONS) {
    const d = distToStation(kitchen.chef.x, kitchen.chef.y, st);
    if (d < bestD) { bestD = d; best = st; }
  }
  return bestD <= INTERACT_DIST ? best : null;
}

export function stationAtPoint(x, y) {
  for (const st of STATIONS) {
    if (x >= st.x - 6 && x <= st.x + st.w + 6 && y >= st.y - 6 && y <= st.y + st.h + 6) return st;
  }
  return null;
}

function handsItem(game) {
  return game.hands && game.hands.kind === 'item' ? game.hands.id : null;
}

export function interact(game, kitchen, sfx) {
  const st = nearestStation(kitchen);
  if (!st) return;
  const held = handsItem(game);

  if (st.kind === 'crate') {
    if (game.hands) { sfx.error(); setToast(game, 'Hands full — serve or trash it first'); return; }
    game.hands = { kind: 'item', id: st.gives };
    sfx.pickup();
    return;
  }

  if (st.kind === 'board') {
    if (kitchen.board.item) {
      if (game.hands) { sfx.error(); return; }
      game.hands = { kind: 'item', id: kitchen.board.item };
      kitchen.board.item = null;
      kitchen.board.progress = 0;
      sfx.pickup();
      return;
    }
    if (held && PREP.chop[held]) {
      kitchen.board.item = held;
      kitchen.board.progress = 0;
      game.hands = null;
      sfx.place();
      return;
    }
    if (held) { sfx.error(); setToast(game, `${INGREDIENTS[held].name} does not need chopping`); }
    return;
  }

  if (st.kind === 'grill') {
    const readySlot = kitchen.grill.find((g) => g.item && (g.done || g.item === 'burnt'));
    if (readySlot && !game.hands) {
      game.hands = { kind: 'item', id: readySlot.item };
      readySlot.item = null;
      readySlot.progress = 0;
      readySlot.done = false;
      sfx.pickup();
      return;
    }
    const emptySlot = kitchen.grill.find((g) => g.item === null);
    if (emptySlot && held === 'patty') {
      emptySlot.item = 'patty';
      emptySlot.progress = 0;
      emptySlot.done = false;
      game.hands = null;
      sfx.place();
      return;
    }
    if (held) { sfx.error(); setToast(game, 'Only raw patties go on the grill'); }
    return;
  }

  if (st.kind === 'plate') {
    // Pick up the plated dish (or the empty plate).
    if (!game.hands) {
      game.hands = { kind: 'plate', items: [...kitchen.plate.items] };
      kitchen.plate.items = [];
      kitchen.plate.respawn = 0.8;
      sfx.pickup();
      return;
    }
    // Add a carried ingredient to the plate on the counter.
    if (held) {
      if (kitchen.plate.items.includes(held)) { sfx.error(); setToast(game, 'Already on the plate'); return; }
      kitchen.plate.items.push(held);
      game.hands = null;
      sfx.place();
      return;
    }
    // Carrying a plate: swap it with the one on the counter.
    if (game.hands.kind === 'plate') {
      const tmp = kitchen.plate.items;
      kitchen.plate.items = [...game.hands.items];
      game.hands.items = tmp;
      sfx.place();
    }
    return;
  }

  if (st.kind === 'pass') {
    const result = servePlate(game);
    if (result === 'served') { sfx.serve(); setTimeout(() => sfx.coin(), 180); }
    else if (result === 'wrong') {
      sfx.error();
      game.flash = 0.5;
      game.combo = 0;
      setToast(game, 'No order needs that dish — check the board');
    } else if (result === 'empty') {
      sfx.error();
      setToast(game, 'Bring a finished plate to the pass');
    }
    return;
  }

  if (st.kind === 'trash') {
    if (!game.hands) return;
    game.hands = null;
    sfx.place();
    setToast(game, 'Tossed it');
  }
}

// Advance chopping and grilling. Returns 'chopDone' | 'grillDone' | 'burnt' | null.
export function updateStations(kitchen, dt, sfx) {
  if (kitchen.plate.respawn > 0) kitchen.plate.respawn -= dt;

  const b = kitchen.board;
  if (b.item) {
    const rule = PREP.chop[b.item];
    b.progress += dt / rule.seconds;
    b.chopSfx -= dt;
    if (b.chopSfx <= 0) { sfx.chop(); b.chopSfx = 0.28; }
    if (b.progress >= 1) {
      b.item = rule.into;
      b.progress = 0;
      sfx.chopDone();
      return 'chopDone';
    }
  }

  let anyCooking = false;
  for (const slot of kitchen.grill) {
    if (!slot.item || slot.item === 'burnt') continue; // burnt stays burnt until trashed
    const rule = PREP.grill.patty;
    slot.progress += dt;
    if (!slot.done && slot.progress >= rule.seconds) {
      slot.item = 'pattyCooked';
      slot.done = true;
      sfx.grillDone();
      return 'grillDone';
    }
    if (slot.done && slot.progress >= rule.burnAfter) {
      slot.item = 'burnt';
      slot.done = false;
      slot.progress = 0;
      sfx.error();
      return 'burnt';
    }
    anyCooking = true;
  }
  sfx.setSizzle(anyCooking);
  return null;
}
