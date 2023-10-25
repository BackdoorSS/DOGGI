const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

const players = {};
const bullets = {};
let playerIdCounter = 0;
let bulletIdCounter = 0;
const bulletSpeed = 5;

io.on('connection', (socket) => {
  console.log('A user connected');

  const playerId = playerIdCounter++;
  players[playerId] = {
    id: playerId,
    x: Math.random() * 800,
    y: Math.random() * 600,
    radius: 10,
    color: 'red',
  };

  socket.emit('currentPlayers', players);

  socket.broadcast.emit('newPlayer', players[playerId]);

  socket.on('playerMovement', (movement) => {
    players[playerId] = { ...players[playerId], ...movement };
    io.emit('playerMoved', { id: playerId, ...players[playerId] });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    delete players[playerId];
    io.emit('playerDisconnected', playerId);
  });

  socket.on('shoot', (bullet) => {
    const bulletId = bulletIdCounter++;
    bullet.id = bulletId;
    bullet.direction = {
      x: bullet.direction.x * bulletSpeed,
      y: bullet.direction.y * bulletSpeed,
    };
    bullets[bulletId] = bullet;
    io.emit('bulletShot', bullet);
  });
});

setInterval(() => {
  // Update bullet positions
  for (const bulletId in bullets) {
    const bullet = bullets[bulletId];
    bullet.x += bullet.direction.x;
    bullet.y += bullet.direction.y;

    // Check if the bullet is out of bounds
    if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
      delete bullets[bulletId];
      io.emit('bulletHit', bulletId);
    }
  }
}, 1000 / 60);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
