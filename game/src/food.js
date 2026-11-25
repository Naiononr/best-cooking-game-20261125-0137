// food.js — every ingredient and dish, drawn as vector art on the canvas.
// One clear job: make the food look worth serving. No image files.

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

export function drawIngredient(ctx, id, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  const u = s / 40; // unit scale: drawings are authored in a 40px box
  ctx.scale(u, u);
  switch (id) {
    case 'bun':
      ctx.fillStyle = '#e8a95c';
      ctx.beginPath();
      ctx.arc(0, 2, 17, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#c98a3e';
      ctx.fillRect(-17, 0, 34, 4);
      ctx.fillStyle = '#fff3d6';
      circle(ctx, -8, -9, 1.6, '#fff3d6');
      circle(ctx, 0, -13, 1.6, '#fff3d6');
      circle(ctx, 8, -9, 1.6, '#fff3d6');
      break;
    case 'patty':
      roundRect(ctx, -18, -7, 36, 14, 7, '#a06a45');
      ctx.fillStyle = '#8a5a3b';
      circle(ctx, -8, 0, 2.5, '#8a5a3b');
      circle(ctx, 6, -2, 2.5, '#8a5a3b');
      break;
    case 'pattyCooked':
      roundRect(ctx, -18, -7, 36, 14, 7, '#7a4a2e');
      ctx.fillStyle = '#5d3620';
      circle(ctx, -9, 0, 2.5, '#5d3620');
      circle(ctx, 5, -2, 2.5, '#5d3620');
      circle(ctx, 10, 2, 2, '#5d3620');
      ctx.strokeStyle = '#3f2413';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-12, -4); ctx.lineTo(12, 3); ctx.stroke();
      break;
    case 'tomato':
      circle(ctx, 0, 0, 16, '#e0483e');
      ctx.fillStyle = '#2f7d32';
      ctx.beginPath();
      ctx.moveTo(0, -16); ctx.lineTo(-5, -21); ctx.lineTo(0, -18); ctx.lineTo(5, -21); ctx.lineTo(0, -16);
      ctx.fill();
      break;
    case 'tomatoChopped':
      circle(ctx, 0, 0, 15, '#ef6a5e');
      circle(ctx, 0, 0, 9, '#f58d80');
      ctx.fillStyle = '#ffd9d2';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        circle(ctx, Math.cos(a) * 5.5, Math.sin(a) * 5.5, 1.8, '#ffd9d2');
      }
      break;
    case 'lettuce': {
      // A leafy head: overlapping circles, darker edge, pale heart.
      ctx.fillStyle = '#4c8a38';
      circle(ctx, -7, 3, 10, '#4c8a38');
      circle(ctx, 7, 3, 10, '#4c8a38');
      ctx.fillStyle = '#5da244';
      circle(ctx, 0, -4, 11, '#5da244');
      ctx.fillStyle = '#8cc46a';
      circle(ctx, -3, -6, 5, '#8cc46a');
      ctx.strokeStyle = '#3f7d2e';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.stroke();
      break;
    }
    case 'lettuceChopped':
      ctx.fillStyle = '#7cc35a';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(-9 + i * 9, (i % 2) * 6 - 3, 8, 5, (i - 1) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'cheese':
      ctx.fillStyle = '#f2c14e';
      ctx.beginPath();
      ctx.moveTo(-17, 10); ctx.lineTo(17, 10); ctx.lineTo(17, -8); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d99a26';
      circle(ctx, -6, 3, 2.5, '#d99a26');
      circle(ctx, 7, 5, 2, '#d99a26');
      circle(ctx, 10, -2, 1.8, '#d99a26');
      break;
    case 'onion':
      circle(ctx, 0, 0, 15, '#b678c2');
      ctx.strokeStyle = '#e3b8ec';
      ctx.lineWidth = 2;
      circle(ctx, 0, 0, 10, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.stroke();
      break;
    case 'onionChopped':
      ctx.strokeStyle = '#c98fd6';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(-8 + i * 8, 0, 7, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke();
      }
      break;
    case 'burnt':
      roundRect(ctx, -16, -7, 32, 14, 6, '#2b2320');
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(-4, 4); ctx.moveTo(2, -5); ctx.lineTo(8, 4); ctx.stroke();
      break;
    default:
      circle(ctx, 0, 0, 12, '#888');
  }
  ctx.restore();
}

// A plate with its stacked items, drawn as a little dish.
export function drawPlate(ctx, items, cx, cy, s) {
  const u = s / 44;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(u, u);
  ctx.fillStyle = '#f5efe2';
  ctx.beginPath();
  ctx.ellipse(0, 12, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9bda6';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 12, 22, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  // Stack the items above the plate, bottom-up.
  const n = items.length;
  items.forEach((id, i) => {
    const y = cy - 4 - (n - 1 - i) * (s * 0.28);
    drawIngredient(ctx, id, cx, y, s * 0.72);
  });
}
