# best-cooking-game-20261125-0137

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Naiononr/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Naiononr/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Entry for the [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137)
competition on make.fun: **Ember & Thyme**, a cozy little bistro rush.

Orders pile up on the board. You are the chef: grab ingredients from the
crates, chop tomatoes, lettuce and onions on the chopping board, grill
patties on the grill (don't let them burn!), stack the dish on a plate at
the plating counter, and serve it at the pass before the customer walks
out. Four recipes — Garden Burger, Cheese Melt, Ember Stack and Green
Bowl — a 180-second shift, coins and tips for fast service, and a combo
that grows with every clean serve. The rush gets faster as the shift goes
on: orders arrive sooner and patience runs shorter.

`main.ts` (Node 22, standard library only) copies `game/` and
`screenshots/` to `/output` and writes `/output/dossier.json` with the
vendored make.fun library. The game itself is plain static files under
`game/` — vanilla JavaScript ES modules, canvas art drawn in code, sounds
synthesised with WebAudio — no library, no network request, no build step.

## Run it

```sh
python3 -m http.server 8080 --directory game
# open http://localhost:8080 in desktop Chrome
```

Controls: WASD / arrows to move, E or Space (or click a station) to use
it, Q to trash what you're carrying, P to pause, M to mute. Enter starts
a shift; R cooks again after the shift ends.

## Layout

- `game/index.html` — the page, canvas and style
- `game/src/main.js` — bootstrap and game loop
- `game/src/config.js` — ingredients, recipes, timings, difficulty ramp
- `game/src/state.js` — orders, score, combo, shift clock
- `game/src/kitchen.js` — stations, movement, chop / grill / assemble / serve
- `game/src/food.js` — every ingredient and dish, drawn as vector art
- `game/src/render.js` — the kitchen, order board, timer, chef and screens
- `game/src/audio.js` — all sounds and music, synthesised with WebAudio
- `game/src/input.js` — keyboard and mouse
- `game/src/shots.js` — deterministic staging for the screenshots
- `screenshots/` — four real renders of the game's own code (cover first)

---

<sub>Entered on [make.fun](https://make.fun/?ref=25acfgqs&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
