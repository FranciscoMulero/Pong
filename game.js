const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const $ = id => document.getElementById(id);

const W = canvas.width;
const H = canvas.height;
const paddleH = 100;
const paddleW = 12;
const ballR = 9;

let difficulty = "normal";
let running = false;
let paused = false;

let p1 = H / 2 - paddleH / 2;
let p2 = H / 2 - paddleH / 2;

let ball = {
  x: W / 2,
  y: H / 2,
  vx: 5,
  vy: 2.5
};

let score1 = 0;
let score2 = 0;
let last = 0;
const keys = {};

const settings = {
  easy: { speed: 3.1, error: 65 },
  normal: { speed: 4.3, error: 30 },
  hard: { speed: 5.8, error: 8 }
};

function resetBall(dir = Math.random() < 0.5 ? -1 : 1) {
  ball = {
    x: W / 2,
    y: H / 2,
    vx: dir * 5,
    vy: (Math.random() - 0.5) * 5
  };
}

function centerPaddles() {
  p1 = H / 2 - paddleH / 2;
  p2 = H / 2 - paddleH / 2;
}

function updateScore() {
  $("score1").textContent = String(score1).padStart(2, "0");
  $("score2").textContent = String(score2).padStart(2, "0");
}

function showOverlay(title, subtitle) {
  $("overlay").classList.remove("hidden");
  $("overlay").querySelector("h2").textContent = title;
  $("overlay").querySelector("p").textContent = subtitle;
}

function hideOverlay() {
  $("overlay").classList.add("hidden");
}

function start() {
  if (running && !paused) return;

  if (!running) {
    score1 = 0;
    score2 = 0;
    updateScore();
    centerPaddles();
    resetBall();
  }

  running = true;
  paused = false;
  hideOverlay();
  $("gameStatus").textContent = "PLAYING";
}

function finish(winner) {
  running = false;
  paused = false;

  showOverlay(
    winner === 1 ? "PLAYER 1 WINS" : "CPU WINS",
    "Pulsa empezar para otra partida"
  );

  $("gameStatus").textContent = "GAME OVER";
}

function clampPaddle(y) {
  return Math.max(0, Math.min(H - paddleH, y));
}

function cpuUpdate(dt) {
  const s = settings[difficulty];
  const target = ball.y - paddleH / 2;
  const desired = target + (Math.random() - 0.5) * s.error;
  const diff = desired - p2;

  p2 += Math.sign(diff) * Math.min(
    Math.abs(diff),
    s.speed * dt * 60
  );

  p2 = clampPaddle(p2);
}

function collidePaddle(x, y, py, dir) {
  if (
    dir < 0 &&
    ball.vx < 0 &&
    x - ballR <= paddleW + 18 &&
    x - ballR >= paddleW - 10 &&
    y >= py &&
    y <= py + paddleH
  ) {
    ball.x = paddleW + 18 + ballR;

    const rel = (y - (py + paddleH / 2)) / (paddleH / 2);
    ball.vx = Math.abs(ball.vx) * 1.06;
    ball.vy = rel * 6.2;
    return true;
  }

  if (
    dir > 0 &&
    ball.vx > 0 &&
    x + ballR >= W - paddleW - 18 &&
    x + ballR <= W - paddleW + 10 &&
    y >= py &&
    y <= py + paddleH
  ) {
    ball.x = W - paddleW - 18 - ballR;

    const rel = (y - (py + paddleH / 2)) / (paddleH / 2);
    ball.vx = -Math.abs(ball.vx) * 1.06;
    ball.vy = rel * 6.2;
    return true;
  }

  return false;
}

function update(dt) {
  if (!running || paused) return;

  const speed = 6.5 * dt * 60;

  if (keys.KeyW || keys.ArrowUp) p1 -= speed;
  if (keys.KeyS || keys.ArrowDown) p1 += speed;

  p1 = clampPaddle(p1);
  cpuUpdate(dt);

  ball.x += ball.vx * dt * 60;
  ball.y += ball.vy * dt * 60;

  if (ball.y - ballR < 0) {
    ball.y = ballR;
    ball.vy *= -1;
  }

  if (ball.y + ballR > H) {
    ball.y = H - ballR;
    ball.vy *= -1;
  }

  collidePaddle(ball.x, ball.y, p1, -1);
  collidePaddle(ball.x, ball.y, p2, 1);

  if (ball.x < 0) {
    score2++;
    updateScore();

    if (score2 >= 7) finish(2);
    else resetBall(1);
  }

  if (ball.x > W) {
    score1++;
    updateScore();

    if (score1 >= 7) finish(1);
    else resetBall(-1);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#080e1c";
  ctx.fillRect(0, 0, W, H);

  ctx.setLineDash([9, 13]);
  ctx.strokeStyle = "#26334d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.shadowBlur = 18;
  ctx.shadowColor = "#42f5e9";
  ctx.fillStyle = "#42f5e9";
  ctx.fillRect(18, p1, paddleW, paddleH);

  ctx.shadowColor = "#ff4d9d";
  ctx.fillStyle = "#ff4d9d";
  ctx.fillRect(W - 18 - paddleW, p2, paddleW, paddleH);

  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballR, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}

function loop(t) {
  const dt = Math.min((t - last) / 1000 || 0, 0.033);
  last = t;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

document.addEventListener("keydown", e => {
  keys[e.code] = true;

  if (["ArrowUp", "ArrowDown", "Space"].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === "Space") {
    if (!running) {
      start();
    } else {
      paused = !paused;
      $("gameStatus").textContent = paused ? "PAUSED" : "PLAYING";

      if (paused) {
        showOverlay("PAUSED", "Pulsa espacio para continuar");
      } else {
        hideOverlay();
      }
    }
  }
});

document.addEventListener("keyup", e => {
  keys[e.code] = false;
});

canvas.addEventListener("pointermove", e => {
  if (!running || paused) return;

  const rect = canvas.getBoundingClientRect();
  const y = (e.clientY - rect.top) / rect.height * H - paddleH / 2;

  p1 = clampPaddle(y);
});

$("startBtn").onclick = start;

document.querySelectorAll("[data-difficulty]").forEach(button => {
  button.onclick = () => {
    difficulty = button.dataset.difficulty;

    document.querySelectorAll("[data-difficulty]").forEach(b => {
      b.classList.toggle("selected", b === button);
    });
  };
});

centerPaddles();
resetBall();
updateScore();
draw();