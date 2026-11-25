// render.js — everything the player sees: the kitchen, the order board,
// the timer, the chef, the stations and the title / game-over screens.
// One clear job: draw the current state. No game logic lives here.

import { VIEW_W, VIEW_H, HUD_H, RECIPES, INGREDIENTS } from './config.js';
import { STATIONS, OBSTACLES, distToStation } from './kitchen.js';
import { drawIngredient, drawPlate } from './food.js';

const CREAM = '#f7ead2';
const WALL = '#e8d3ae';
const FLOOR_A = '#c98f5f';
const FLOOR_B = '#bd8252';
const WOOD = '#8a5a33';
const WOOD_DARK = '#6e4525';
const BRASS = '#d9a441';
const INK = '#3a2a1a';

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function text(ctx, str, x, y, size, color, weight = 700, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawOrderTicket(ctx, order, x, y, w, h) {
  const recipe = RECIPES[order.recipe];
  const frac = Math.max(0, order.timeLeft / order.patience);
  const urgent = frac < 0.35;
  roundRect(ctx, x, y, w, h, 10, urgent ? '#ffe3d6' : '#fffaf0');
  ctx.strokeStyle = urgent ? '#d94f2b' : '#d9c49a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.stroke();
  // Price tag, top right.
  roundRect(ctx, x + w - 52, y + 6, 44, 18, 9, BRASS);
  text(ctx, `$${recipe.price}`, x + w - 30, y + 16, 12, '#fff', 800, 'center');
  // Order number + recipe name on one line.
  text(ctx, `#${order.id}  ${recipe.name}`, x + 10, y + 15, 13, INK, 800);
  // Required items as a row of icons.
  let ix = x + 12;
  for (const item of recipe.items) {
    drawIngredient(ctx, item, ix + 10, y + 36, 19);
    ix += 25;
  }
  // Patience bar along the bottom.
  const bw = w - 20;
  roundRect(ctx, x + 10, y + h - 8, bw, 5, 3, '#e5d5b3');
  roundRect(ctx, x + 10, y + h - 8, bw * frac, 5, 3, urgent ? '#d94f2b' : '#5da244');
}

function drawHud(ctx, game) {
  roundRect(ctx, 0, 0, VIEW_W, HUD_H, 0, '#2e2118');
  // Order board label.
  text(ctx, 'ORDER BOARD', 16, 18, 13, BRASS, 800);
  let ox = 16;
  for (const order of game.orders) {
    drawOrderTicket(ctx, order, ox, 26, 218, 56);
    ox += 228;
  }
  if (game.orders.length === 0) {
    text(ctx, 'No orders — breathe, chef.', 24, 56, 14, '#c9bda6', 600);
  }
  // Shift timer (right).
  const timerX = VIEW_W - 300;
  const low = game.timeLeft < 30;
  roundRect(ctx, timerX, 14, 110, 58, 12, low ? '#d94f2b' : '#4a3524');
  text(ctx, 'SHIFT', timerX + 55, 28, 11, '#d9c49a', 800, 'center');
  text(ctx, fmtTime(game.timeLeft), timerX + 55, 52, 26, '#fff', 800, 'center');
  // Coins and combo.
  roundRect(ctx, timerX + 120, 14, 166, 58, 12, '#4a3524');
  text(ctx, 'COINS', timerX + 132, 28, 11, '#d9c49a', 800);
  text(ctx, `$${game.coins}`, timerX + 132, 52, 22, '#ffd76a', 800);
  if (game.combo >= 2) {
    text(ctx, `COMBO x${game.combo}`, timerX + 274, 52, 13, '#ffd76a', 800, 'right');
  }
}

function drawFloor(ctx) {
  ctx.fillStyle = WALL;
  ctx.fillRect(0, HUD_H, VIEW_W, VIEW_H - HUD_H);
  // Checkerboard terracotta floor.
  const ts = 80;
  for (let y = HUD_H; y < VIEW_H; y += ts) {
    for (let x = 0; x < VIEW_W; x += ts) {
      const even = (Math.floor(x / ts) + Math.floor((y - HUD_H) / ts)) % 2 === 0;
      ctx.fillStyle = even ? '#d9a06b' : '#b57a48';
      ctx.fillRect(x, y, ts, ts);
    }
  }
}

function drawPrepTable(ctx) {
  const t = OBSTACLES[0];
  roundRect(ctx, t.x, t.y, t.w, t.h, 12, WOOD);
  roundRect(ctx, t.x + 6, t.y + 6, t.w - 12, t.h - 12, 9, '#a06a45');
  // Bowls and bits waiting on the table: a salad bowl, a spice pot, a jug.
  ctx.fillStyle = '#7cc35a';
  ctx.beginPath();
  ctx.arc(t.x + 60, t.y + 52, 20, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#e0483e';
  circle(ctx, t.x + 52, t.y + 44, 6, '#e0483e');
  circle(ctx, t.x + 68, t.y + 44, 6, '#e0483e');
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath();
  ctx.arc(t.x + 170, t.y + 48, 16, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(t.x + 154, t.y + 48, 32, 6);
  ctx.fillStyle = '#e8d3ae';
  ctx.beginPath();
  ctx.arc(t.x + 280, t.y + 46, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b678c2';
  circle(ctx, t.x + 280, t.y + 46, 7, '#b678c2');
  text(ctx, 'PREP TABLE', t.x + t.w / 2, t.y + 16, 11, '#f7ead2', 800, 'center');
}

function drawStation(ctx, st, kitchen, game, highlight) {
  const { x, y, w, h } = st;
  if (st.kind === 'crate') {
    roundRect(ctx, x, y, w, h, 8, WOOD);
    roundRect(ctx, x + 4, y + 4, w - 8, h - 8, 6, '#a06a45');
    drawIngredient(ctx, st.gives, x + w / 2, y + 26, 34);
    text(ctx, st.label, x + w / 2, y + h - 10, 11, '#fff', 700, 'center');
  } else if (st.kind === 'board') {
    roundRect(ctx, x, y, w, h, 8, WOOD);
    roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 6, '#e8d3ae');
    if (kitchen.board.item) {
      drawIngredient(ctx, kitchen.board.item, x + w / 2, y + h / 2 - 4, 34);
      if (kitchen.board.progress > 0 && kitchen.board.progress < 1) {
        roundRect(ctx, x + 12, y + h - 14, w - 24, 7, 3, '#d9c49a');
        roundRect(ctx, x + 12, y + h - 14, (w - 24) * kitchen.board.progress, 7, 3, '#5da244');
      }
    } else {
      // A little knife, drawn: blade + handle.
      ctx.fillStyle = '#cfd6dd';
      ctx.beginPath();
      ctx.moveTo(x + 34, y + 14); ctx.lineTo(x + 88, y + 30); ctx.lineTo(x + 34, y + 34); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#6e4525';
      ctx.fillRect(x + 88, y + 24, 26, 9);
      text(ctx, 'CHOP', x + w / 2, y + h - 12, 11, '#5d3620', 800, 'center');
    }
  } else if (st.kind === 'grill') {
    roundRect(ctx, x, y, w, h, 8, '#3a3230');
    roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 6, '#57504c');
    ctx.strokeStyle = '#2b2320';
    ctx.lineWidth = 3;
    for (let i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 10 + i * ((w - 20) / 6), y + 10);
      ctx.lineTo(x + 10 + i * ((w - 20) / 6), y + h - 10);
      ctx.stroke();
    }
    kitchen.grill.forEach((slot, i) => {
      const sx = x + 46 + i * 88;
      const sy = y + h / 2 - 2;
      if (slot.item) {
        drawIngredient(ctx, slot.item, sx, sy, 36);
        if (!slot.done && slot.item === 'patty') {
          const frac = Math.min(1, slot.progress / 3.6);
          ctx.strokeStyle = '#ffd76a';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(sx, sy, 24, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
          ctx.stroke();
        }
        if (slot.done) text(ctx, 'READY!', sx, sy - 26, 11, '#ffd76a', 800, 'center');
      }
    });
    text(ctx, 'GRILL', x + w / 2, y + h - 10, 11, '#ffd76a', 800, 'center');
  } else if (st.kind === 'plate') {
    roundRect(ctx, x, y, w, h, 8, WOOD);
    roundRect(ctx, x + 4, y + 4, w - 8, h - 8, 6, '#c98a5f');
    if (kitchen.plate.respawn <= 0) {
      drawPlate(ctx, kitchen.plate.items, x + w / 2, y + h / 2 - 2, 40);
    }
    text(ctx, 'PLATE', x + w / 2, y + h - 10, 11, '#fff', 700, 'center');
  } else if (st.kind === 'pass') {
    roundRect(ctx, x, y, w, h, 8, '#5d3620');
    roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 6, '#fffaf0');
    // A service bell, drawn: dome + button + base.
    ctx.fillStyle = BRASS;
    ctx.beginPath();
    ctx.arc(x + 52, y + 26, 13, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x + 35, y + 26, 34, 4);
    ctx.fillStyle = '#8a5a33';
    ctx.beginPath();
    ctx.arc(x + 52, y + 11, 3, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, 'SERVING PASS', x + w / 2 + 24, y + 24, 17, INK, 800, 'center');
    text(ctx, 'bring finished plates here', x + w / 2, y + h - 14, 12, '#8a6f4d', 600, 'center');
  } else if (st.kind === 'trash') {
    roundRect(ctx, x, y, w, h, 8, '#4a4a4a');
    roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 6, '#666');
    // A bin, drawn: lid + tapered body.
    ctx.fillStyle = '#d9d9d9';
    ctx.fillRect(x + w / 2 - 22, y + 12, 44, 5);
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 18, y + 20); ctx.lineTo(x + w / 2 + 18, y + 20);
    ctx.lineTo(x + w / 2 + 13, y + 46); ctx.lineTo(x + w / 2 - 13, y + 46);
    ctx.closePath();
    ctx.fill();
    text(ctx, 'TRASH', x + w / 2, y + h - 12, 11, '#fff', 800, 'center');
  }
  if (highlight) {
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.roundRect(x - 4, y - 4, w + 8, h + 8, 10);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawChef(ctx, chef, hands) {
  const { x, y, facing } = chef;
  ctx.save();
  ctx.translate(x, y);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body (white chef coat).
  ctx.fillStyle = '#fdfbf6';
  ctx.beginPath();
  ctx.roundRect(-16, -6, 32, 28, 10);
  ctx.fill();
  ctx.strokeStyle = '#d9c49a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-16, -6, 32, 28, 10);
  ctx.stroke();
  // Head + toque.
  ctx.fillStyle = '#f2c79b';
  ctx.beginPath();
  ctx.arc(0, -16, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-6, -26, 7, 0, Math.PI * 2);
  ctx.arc(0, -29, 8, 0, Math.PI * 2);
  ctx.arc(6, -26, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-11, -28, 22, 6);
  // Eyes look where the chef faces.
  ctx.fillStyle = '#2b2320';
  ctx.beginPath();
  ctx.arc(facing * 3 - 4, -16, 1.8, 0, Math.PI * 2);
  ctx.arc(facing * 3 + 4, -16, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Carried item above the head.
  if (hands) {
    if (hands.kind === 'item') {
      drawIngredient(ctx, hands.id, facing * 8, -44, 30);
    } else if (hands.kind === 'plate') {
      drawPlate(ctx, hands.items, facing * 8, -40, 34);
    }
  }
  ctx.restore();
}

function drawControlsHint(ctx) {
  const label = 'WASD move  ·  E use  ·  Q trash  ·  P pause  ·  M mute';
  ctx.save();
  ctx.font = '600 13px "Trebuchet MS", Verdana, sans-serif';
  const w = ctx.measureText(label).width + 28;
  roundRect(ctx, 16, 672, w, 30, 15, 'rgba(46,33,24,0.8)');
  text(ctx, label, 30, 688, 13, '#ffe9b8', 600);
  ctx.restore();
}

function drawToast(ctx, game) {
  if (!game.toast) return;
  const a = Math.min(1, game.toastTimer);
  ctx.save();
  ctx.globalAlpha = a;
  const w = ctx.measureText(game.toast).width + 36;
  roundRect(ctx, VIEW_W / 2 - 220, 172, 440, 34, 17, 'rgba(46,33,24,0.9)');
  text(ctx, game.toast, VIEW_W / 2, 190, 15, '#ffe9b8', 700, 'center');
  ctx.restore();
}

function drawTitle(ctx, game) {
  ctx.fillStyle = 'rgba(30,20,12,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  roundRect(ctx, 290, 130, 700, 420, 20, '#fffaf0');
  ctx.strokeStyle = BRASS;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(290, 130, 700, 420, 20);
  ctx.stroke();
  text(ctx, 'EMBER & THYME', 640, 190, 44, INK, 800, 'center');
  text(ctx, 'a cozy little bistro rush', 640, 232, 18, '#8a6f4d', 600, 'center');
  text(ctx, 'Orders pile up on the board. Chop it, grill it, plate it,', 640, 292, 17, INK, 600, 'center');
  text(ctx, 'serve it at the pass — before the customer walks out.', 640, 318, 17, INK, 600, 'center');
  text(ctx, 'WASD / arrows to move  ·  E or click to use a station', 640, 372, 16, INK, 700, 'center');
  text(ctx, 'Chop tomatoes, lettuce & onions · Grill patties (don\'t burn them!)', 640, 400, 15, '#5d3620', 600, 'center');
  text(ctx, 'Stack the dish on a plate · Serve it at the pass for coins & tips', 640, 426, 15, '#5d3620', 600, 'center');
  roundRect(ctx, 490, 462, 300, 52, 12, '#d94f2b');
  text(ctx, 'START SHIFT  (Enter)', 640, 489, 20, '#fff', 800, 'center');
  text(ctx, '180 seconds · 4 recipes · how fast can you feed the rush?', 640, 532, 13, '#8a6f4d', 600, 'center');
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(30,20,12,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, 'PAUSED', 640, 340, 48, '#fff', 800, 'center');
  text(ctx, 'Press P to keep cooking', 640, 390, 18, '#ffe9b8', 600, 'center');
}

function drawGameOver(ctx, game) {
  ctx.fillStyle = 'rgba(30,20,12,0.65)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  roundRect(ctx, 340, 140, 600, 400, 20, '#fffaf0');
  ctx.strokeStyle = BRASS;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(340, 140, 600, 400, 20);
  ctx.stroke();
  text(ctx, 'SHIFT OVER!', 640, 200, 40, INK, 800, 'center');
  const stars = game.coins >= 120 ? 3 : game.coins >= 80 ? 2 : game.coins >= 45 ? 1 : 0;
  text(ctx, '★'.repeat(stars) + '☆'.repeat(3 - stars), 640, 250, 36, BRASS, 800, 'center');
  text(ctx, `Coins earned:  $${game.coins}`, 640, 310, 22, INK, 800, 'center');
  text(ctx, `Dishes served:  ${game.served}    ·    Orders lost:  ${game.expired}`, 640, 348, 17, '#5d3620', 700, 'center');
  text(ctx, `Best combo:  x${game.bestCombo}`, 640, 380, 17, '#5d3620', 700, 'center');
  text(ctx, stars === 3 ? 'The bistro sings your name, chef!' : stars === 2 ? 'A fine shift — the regulars are happy.' : 'The rush won this time. One more shift?', 640, 420, 16, '#8a6f4d', 600, 'center');
  roundRect(ctx, 490, 452, 300, 52, 12, '#d94f2b');
  text(ctx, 'COOK AGAIN  (R)', 640, 479, 20, '#fff', 800, 'center');
}

export function render(ctx, game, kitchen, input) {
  drawFloor(ctx);
  drawPrepTable(ctx);
  const highlight = game.mode === 'playing' ? nearestStationForHighlight(kitchen) : null;
  for (const st of STATIONS) {
    drawStation(ctx, st, kitchen, game, highlight === st);
  }
  drawChef(ctx, kitchen.chef, game.hands);
  drawHud(ctx, game);
  drawControlsHint(ctx);
  drawToast(ctx, game);
  if (game.flash > 0) {
    ctx.fillStyle = `rgba(217,79,43,${game.flash * 0.25})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  if (game.mode === 'title') drawTitle(ctx, game);
  if (game.mode === 'paused') drawPaused(ctx);
  if (game.mode === 'over') drawGameOver(ctx, game);
}

function nearestStationForHighlight(kitchen) {
  let best = null;
  let bestD = Infinity;
  for (const st of STATIONS) {
    const d = distToStation(kitchen.chef.x, kitchen.chef.y, st);
    if (d < bestD) { bestD = d; best = st; }
  }
  return bestD <= 82 ? best : null;
}
