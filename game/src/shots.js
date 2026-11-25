// shots.js — deterministic staging for screenshots.
// ?shot=start  title screen over a stocked kitchen
// ?shot=play   mid-shift: orders on the board, a dish mid-assembly, the
//              grill and chopping board busy, the chef carrying tomatoes
// ?shot=serve  a finished Garden Burger carried to the serving pass
// ?shot=rush   late shift: four orders, the clock nearly out, combo x3
// The staged clock is frozen so every screenshot is repeatable.

import { RECIPES } from './config.js';
import { spawnOrder, setToast } from './state.js';

function makeOrder(game, id, recipe, patience, timeLeft) {
  game.orders.push({ id, recipe, patience, timeLeft, born: 0 });
}

export function applyShot(game, kitchen) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return null;
  game.frozen = true;

  if (shot === 'start') {
    game.mode = 'title';
    game.timeLeft = 180;
    game.coins = 0;
    makeOrder(game, 1, 'garden', 46, 44);
    makeOrder(game, 2, 'cheese', 46, 38);
    kitchen.chef.x = 640;
    kitchen.chef.y = 470;
  } else if (shot === 'play') {
    game.mode = 'playing';
    game.elapsed = 46;
    game.timeLeft = 134;
    game.coins = 27;
    game.combo = 2;
    makeOrder(game, 3, 'garden', 42, 31);
    makeOrder(game, 4, 'ember', 40, 24);
    makeOrder(game, 5, 'green', 38, 18);
    kitchen.board.item = 'tomato';
    kitchen.board.progress = 0.55;
    kitchen.grill[0] = { item: 'patty', progress: 2.2, done: false };
    kitchen.grill[1] = { item: 'pattyCooked', progress: 5.0, done: true };
    kitchen.plate.items = ['bun', 'pattyCooked'];
    kitchen.chef.x = 700;
    kitchen.chef.y = 300;
    kitchen.chef.facing = 1;
    game.hands = { kind: 'item', id: 'tomatoChopped' };
    setToast(game, 'Chop the tomato, then stack it on the plate', 60);
  } else if (shot === 'serve') {
    game.mode = 'playing';
    game.elapsed = 68;
    game.timeLeft = 112;
    game.coins = 41;
    game.combo = 3;
    makeOrder(game, 6, 'garden', 42, 36);
    makeOrder(game, 7, 'cheese', 40, 21);
    kitchen.grill[0] = { item: 'patty', progress: 1.1, done: false };
    kitchen.board.item = 'lettuce';
    kitchen.board.progress = 0.3;
    kitchen.chef.x = 640;
    kitchen.chef.y = 590;
    kitchen.chef.facing = 1;
    game.hands = { kind: 'plate', items: [...RECIPES.garden.items] };
    setToast(game, 'Garden Burger ready — serve it at the pass!', 60);
  } else if (shot === 'rush') {
    game.mode = 'playing';
    game.elapsed = 133;
    game.timeLeft = 47;
    game.coins = 96;
    game.combo = 3;
    makeOrder(game, 8, 'ember', 34, 19);
    makeOrder(game, 9, 'garden', 32, 12);
    makeOrder(game, 10, 'cheese', 30, 8);
    makeOrder(game, 11, 'green', 30, 26);
    kitchen.board.item = 'onion';
    kitchen.board.progress = 0.7;
    kitchen.grill[0] = { item: 'patty', progress: 3.0, done: false };
    kitchen.grill[1] = { item: 'pattyCooked', progress: 6.5, done: true };
    kitchen.plate.items = ['bun', 'pattyCooked', 'cheese'];
    kitchen.chef.x = 560;
    kitchen.chef.y = 480;
    kitchen.chef.facing = -1;
    game.hands = { kind: 'item', id: 'tomatoChopped' };
    setToast(game, 'Rush hour! Four orders, one chef', 60);
  } else {
    return null;
  }
  return shot;
}
