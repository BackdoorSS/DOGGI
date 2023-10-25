const socket = io();

const players = {};

socket.on('currentPlayers', (serverPlayers) => {
  for (const id in serverPlayers) {
    const playerData = serverPlayers[id];
    createPlayer(id, playerData.color, playerData.x, playerData.y);
  }
});

socket.on('newPlayer', (newPlayer) => {
  createPlayer(newPlayer.id, newPlayer.color, newPlayer.x, newPlayer.y);
});

socket.on('playerMoved', (data) => {
  movePlayer(data.id, data.movement.x, data.movement.y);
});

socket.on('playerDisconnected', (id) => {
  removePlayer(id);
});

function createPlayer(id, color, x, y) {
  const player = document.createElement('div');
  player.className = 'player';
  player.id = id;
  player.style.left = x + 'px';
  player.style.top = y + 'px';
  player.style.backgroundColor = color; // Set the player's color
  document.body.appendChild(player);
  players[id] = player;
}

function movePlayer(id, x, y) {
  const player = players[id];
  if (player) {
    player.style.left = x + 'px';
    player.style.top = y + 'px';
  }
}

function removePlayer(id) {
  const player = players[id];
  if (player) {
    player.remove();
    delete players[id];
  }
}

document.addEventListener('keydown', (event) => {
  const movement = { x: 0, y: 0 };

  switch (event.key) {
    case 'ArrowLeft':
      movement.x = -playerSpeed;
      break;
    case 'ArrowRight':
      movement.x = playerSpeed;
      break;
    case 'ArrowUp':
      movement.y = -playerSpeed;
      break;
    case 'ArrowDown':
      movement.y = playerSpeed;
      break;
  }

  // Send the player's movement and color to the server
  socket.emit('playerMovement', { color: currentPlayerColor, movement });
});

// Implement logic for selecting different colors or shapes for players
// ...
