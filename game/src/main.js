// main.js — bootstrap and the game loop for Ember & Thyme.
// One clear job: own the frame, the mode transitions and the wiring
// between input, state, kitchen and render.

import { VIEW_W, VIEW_H, SHIFT_SECONDS } from './config.js';
import { Input } from './input.js';
import { SoundFX } from './audio.js';
import { createGame, resetGame, updateOrders, updateShift, tickToast } from './state.js';
import { createKitchen, moveChef, interact, updateStations, nearestStation, stationAtPoint, STATIONS } from './kitchen.js';
import { render } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const input = new Input(canvas);
const sfx = new SoundFX();
const game = createGame();
const kitchen = createKitchen();

const shot = applyShot(game, kitchen);

function startShift() {
  sfx.unlock();
  resetGame(game);
  sfx.startShift();
}

function update(dt) {
  if (game.mode === 'title') {
    if (input.wasPressed('enter') || input.mouse.clicked) startShift();
    return;
  }
  if (game.mode === 'over') {
    if (input.wasPressed('r') || input.wasPressed('enter') || input.mouse.clicked) startShift();
    return;
  }
  if (input.wasPressed('p')) {
    game.mode = game.mode === 'paused' ? 'playing' : 'paused';
    sfx.click();
  }
  if (input.wasPressed('m')) {
    sfx.setMuted(!sfx.muted);
    sfx.click();
  }
  if (game.mode === 'paused') return;

  // Mouse: click a station to walk to it and use it, or click the floor to walk.
  if (input.mouse.clicked) {
    sfx.unlock();
    const st = stationAtPoint(input.mouse.x, input.mouse.y);
    if (st) {
      const cx = st.x + st.w / 2;
      const cy = st.y + st.h / 2;
      const dx = kitchen.chef.x - cx;
      const dy = kitchen.chef.y - cy;
      const d = Math.hypot(dx, dy);
      kitchen.walkTarget = {
        x: cx + (dx / d) * 95,
        y: cy + (dy / d) * 95,
      };
      kitchen.pendingStation = st.id;
    } else {
      kitchen.walkTarget = { x: input.mouse.x, y: input.mouse.y };
      kitchen.pendingStation = null;
    }
  }
  if (kitchen.pendingStation) {
    const st = STATIONS_BY_ID[kitchen.pendingStation];
    if (st && nearestStation(kitchen) === st) {
      kitchen.pendingStation = null;
      interact(game, kitchen, sfx);
    }
  }
  if (input.interactPressed()) {
    sfx.unlock();
    interact(game, kitchen, sfx);
  }
  if (input.wasPressed('q') && game.hands) {
    game.hands = null;
    sfx.place();
  }

  moveChef(kitchen, input, dt);
  updateStations(kitchen, dt, sfx);
  if (updateOrders(game, dt) === 'expired') sfx.expired();
  if (updateShift(game, dt) === 'over') sfx.shiftEnd();
  tickToast(game, dt);
}

// Station lookup for the click-to-walk flow.
const STATIONS_BY_ID = Object.fromEntries(STATIONS.map((s) => [s.id, s]));

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!game.frozen) update(dt);
  render(ctx, game, kitchen, input);
  input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
