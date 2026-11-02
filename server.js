// esto más adelante para hacerlo online



// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: "*" }
// });

// app.get("/", (_, res) => {
//   res.send("Neon Pong server online");
// });

// const rooms = new Map();

// const W = 900;
// const H = 520;
// const PH = 100;
// const PW = 12;
// const R = 9;

// function code() {
//   return Math.random().toString(36).slice(2, 6).toUpperCase();
// }

// function fresh() {
//   return {
//     p1: H / 2 - PH / 2,
//     p2: H / 2 - PH / 2,
//     ball: {
//       x: W / 2,
//       y: H / 2,
//       vx: 5,
//       vy: (Math.random() - 0.5) * 5
//     },
//     score1: 0,
//     score2: 0,
//     started: false
//   };
// }

// function resetBall(room, dir) {
//   room.ball = {
//     x: W / 2,
//     y: H / 2,
//     vx: dir * 5,
//     vy: (Math.random() - 0.5) * 5
//   };
// }

// io.on("connection", socket => {
//   socket.on("create-room", () => {
//     let c = code();

//     while (rooms.has(c)) c = code();

//     const room = {
//       ...fresh(),
//       players: [socket.id]
//     };

//     rooms.set(c, room);
//     socket.join(c);
//     socket.data.room = c;
//     socket.data.side = 1;

//     socket.emit("room-created", { code: c });
//   });

//   socket.on("join-room", codeInput => {
//     const c = String(codeInput || "").toUpperCase();
//     const room = rooms.get(c);

//     if (!room || room.players.length >= 2) {
//       socket.emit(
//         "room-error",
//         "Sala no disponible. Comprueba el código."
//       );
//       return;
//     }

//     room.players.push(socket.id);
//     socket.join(c);
//     socket.data.room = c;
//     socket.data.side = 2;
//     room.started = true;

//     io.to(c).emit("joined", {
//       code: c,
//       side: 2
//     });

//     io.to(c).emit("ready");
//   });

//   socket.on("paddle", data => {
//     const room = rooms.get(socket.data.room);

//     if (!room || !room.started) return;

//     const y = Math.max(
//       0,
//       Math.min(H - PH, Number(data.y) || 0)
//     );

//     if (socket.data.side === 1) room.p1 = y;
//     else room.p2 = y;
//   });

//   socket.on("disconnect", () => {
//     const c = socket.data.room;
//     const room = rooms.get(c);

//     if (room) {
//       io.to(c).emit(
//         "room-error",
//         "El otro jugador se ha desconectado."
//       );

//       rooms.delete(c);
//     }
//   });
// });

// setInterval(() => {
//   for (const [c, room] of rooms) {
//     if (!room.started || room.players.length < 2) continue;

//     const ball = room.ball;

//     ball.x += ball.vx;
//     ball.y += ball.vy;

//     if (ball.y < R || ball.y > H - R) {
//       ball.vy *= -1;
//     }

//     if (
//       ball.vx < 0 &&
//       ball.x - R <= PW + 18 &&
//       ball.x >= PW &&
//       ball.y >= room.p1 &&
//       ball.y <= room.p1 + PH
//     ) {
//       ball.x = PW + 18 + R;
//       ball.vx = Math.abs(ball.vx) * 1.04;
//       ball.vy =
//         ((ball.y - (room.p1 + PH / 2)) / (PH / 2)) * 6;
//     }

//     if (
//       ball.vx > 0 &&
//       ball.x + R >= W - PW - 18 &&
//       ball.x <= W - PW &&
//       ball.y >= room.p2 &&
//       ball.y <= room.p2 + PH
//     ) {
//       ball.x = W - PW - 18 - R;
//       ball.vx = -Math.abs(ball.vx) * 1.04;
//       ball.vy =
//         ((ball.y - (room.p2 + PH / 2)) / (PH / 2)) * 6;
//     }

//     if (ball.x < 0) {
//       room.score2++;
//       resetBall(room, 1);

//       io.to(c).emit("point", {
//         score1: room.score1,
//         score2: room.score2
//       });
//     }

//     if (ball.x > W) {
//       room.score1++;
//       resetBall(room, -1);

//       io.to(c).emit("point", {
//         score1: room.score1,
//         score2: room.score2
//       });
//     }

//     if (room.score1 >= 7 || room.score2 >= 7) {
//       room.started = false;

//       io.to(c).emit(
//         "room-error",
//         `Partida terminada: ${room.score1}-${room.score2}. Crea otra sala para jugar de nuevo.`
//       );
//     }

//     io.to(c).emit("state", {
//       p1: room.p1,
//       p2: room.p2,
//       ball: room.ball,
//       score1: room.score1,
//       score2: room.score2
//     });
//   }
// }, 1000 / 60);

// const port = process.env.PORT || 3000;

// server.listen(port, () => {
//   console.log(`Pong server listening on ${port}`);
// });