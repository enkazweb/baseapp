import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';

// Farcaster SDK başlat
sdk.actions.ready();

// Oyun sabitleri
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = Math.min(Math.floor((window.innerHeight - 280) / ROWS), 28);

// Canvas ayarları
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const nextCanvas = document.getElementById('next-piece');
const nextCtx = nextCanvas.getContext('2d');
nextCanvas.width = 4 * 20;
nextCanvas.height = 4 * 20;

// Renkler
const COLORS = [
  null,
  '#00f5ff', // I - Cyan
  '#ffe66d', // O - Sarı
  '#9b59b6', // T - Mor
  '#2ecc71', // S - Yeşil
  '#e74c3c', // Z - Kırmızı
  '#3498db', // J - Mavi
  '#e67e22'  // L - Turuncu
];

// Tetris parçaları
const PIECES = [
  [[1,1,1,1]],                          // I
  [[2,2],[2,2]],                        // O
  [[0,3,0],[3,3,3]],                    // T
  [[0,4,4],[4,4,0]],                    // S
  [[5,5,0],[0,5,5]],                    // Z
  [[6,0,0],[6,6,6]],                    // J
  [[0,0,7],[7,7,7]]                     // L
];

// Oyun durumu
let board = createBoard();
let currentPiece = null;
let currentPos = { x: 0, y: 0 };
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let gameStarted = false;
let dropInterval = 1000;
let lastDrop = 0;

// Start ekranı animasyonu
function createFallingBlocks() {
  const container = document.getElementById('start-blocks');
  const colors = COLORS.filter(c => c !== null);
  
  for (let i = 0; i < 15; i++) {
    const block = document.createElement('div');
    block.className = 'falling-block';
    block.style.left = Math.random() * 100 + '%';
    block.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    block.style.animationDuration = (3 + Math.random() * 4) + 's';
    block.style.animationDelay = Math.random() * 3 + 's';
    container.appendChild(block);
  }
}

createFallingBlocks();

function createBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
}

function getRandomPiece() {
  const idx = Math.floor(Math.random() * PIECES.length);
  return PIECES[idx].map(row => [...row]);
}

function resetPiece() {
  currentPiece = nextPiece || getRandomPiece();
  nextPiece = getRandomPiece();
  currentPos = {
    x: Math.floor(COLS / 2) - Math.floor(currentPiece[0].length / 2),
    y: 0
  };
  
  if (collision()) {
    gameOver = true;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').classList.remove('hidden');
  }
  
  drawNextPiece();
}

function collision(px = currentPos.x, py = currentPos.y, piece = currentPiece) {
  for (let y = 0; y < piece.length; y++) {
    for (let x = 0; x < piece[y].length; x++) {
      if (piece[y][x]) {
        const newX = px + x;
        const newY = py + y;
        if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
        if (newY >= 0 && board[newY][newX]) return true;
      }
    }
  }
  return false;
}

function merge() {
  for (let y = 0; y < currentPiece.length; y++) {
    for (let x = 0; x < currentPiece[y].length; x++) {
      if (currentPiece[y][x]) {
        const boardY = currentPos.y + y;
        if (boardY >= 0) {
          board[boardY][currentPos.x + x] = currentPiece[y][x];
        }
      }
    }
  }
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      y++;
    }
  }
  
  if (cleared > 0) {
    const points = [0, 100, 300, 500, 800];
    score += points[cleared] * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
  }
}

function rotate(piece) {
  const rotated = piece[0].map((_, i) => piece.map(row => row[i]).reverse());
  return rotated;
}

function moveLeft() {
  if (!collision(currentPos.x - 1, currentPos.y)) {
    currentPos.x--;
  }
}

function moveRight() {
  if (!collision(currentPos.x + 1, currentPos.y)) {
    currentPos.x++;
  }
}

function moveDown() {
  if (!collision(currentPos.x, currentPos.y + 1)) {
    currentPos.y++;
    return true;
  }
  return false;
}

function rotatePiece() {
  const rotated = rotate(currentPiece);
  let kick = 0;
  
  if (collision(currentPos.x, currentPos.y, rotated)) {
    kick = currentPos.x > COLS / 2 ? -1 : 1;
  }
  
  if (!collision(currentPos.x + kick, currentPos.y, rotated)) {
    currentPiece = rotated;
    currentPos.x += kick;
  }
}

function drop() {
  if (!moveDown()) {
    merge();
    clearLines();
    resetPiece();
  }
}

function drawBlock(ctx, x, y, color, size = BLOCK_SIZE) {
  ctx.fillStyle = color;
  ctx.fillRect(x * size, y * size, size - 1, size - 1);
  
  // Parlak kenar
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x * size, y * size, size - 1, 3);
  ctx.fillRect(x * size, y * size, 3, size - 1);
  
  // Koyu kenar
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x * size, (y + 1) * size - 4, size - 1, 3);
  ctx.fillRect((x + 1) * size - 4, y * size, 3, size - 1);
}

function draw() {
  // Arka plan
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Grid çizgileri
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * BLOCK_SIZE, 0);
    ctx.lineTo(x * BLOCK_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * BLOCK_SIZE);
    ctx.lineTo(canvas.width, y * BLOCK_SIZE);
    ctx.stroke();
  }
  
  // Board
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        drawBlock(ctx, x, y, COLORS[board[y][x]]);
      }
    }
  }
  
  // Mevcut parça
  if (currentPiece) {
    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[y].length; x++) {
        if (currentPiece[y][x]) {
          drawBlock(ctx, currentPos.x + x, currentPos.y + y, COLORS[currentPiece[y][x]]);
        }
      }
    }
  }
}

function drawNextPiece() {
  nextCtx.fillStyle = '#0a0a14';
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  
  if (nextPiece) {
    const offsetX = (4 - nextPiece[0].length) / 2;
    const offsetY = (4 - nextPiece.length) / 2;
    
    for (let y = 0; y < nextPiece.length; y++) {
      for (let x = 0; x < nextPiece[y].length; x++) {
        if (nextPiece[y][x]) {
          nextCtx.fillStyle = COLORS[nextPiece[y][x]];
          nextCtx.fillRect((offsetX + x) * 20, (offsetY + y) * 20, 18, 18);
        }
      }
    }
  }
}

function gameLoop(time) {
  if (!gameOver && gameStarted) {
    if (time - lastDrop > dropInterval) {
      drop();
      lastDrop = time;
    }
    draw();
    requestAnimationFrame(gameLoop);
  }
}

function startGame() {
  document.getElementById('start-screen').classList.add('hidden');
  gameStarted = true;
  nextPiece = getRandomPiece();
  resetPiece();
  requestAnimationFrame(gameLoop);
}

function restart() {
  board = createBoard();
  score = 0;
  level = 1;
  lines = 0;
  gameOver = false;
  gameStarted = true;
  dropInterval = 1000;
  lastDrop = 0;
  
  document.getElementById('score').textContent = '0';
  document.getElementById('level').textContent = '1';
  document.getElementById('lines').textContent = '0';
  document.getElementById('game-over').classList.add('hidden');
  
  nextPiece = getRandomPiece();
  resetPiece();
  requestAnimationFrame(gameLoop);
}

// Başlangıç ekranını göster
draw();

// Event listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('btn-left').addEventListener('click', () => gameStarted && !gameOver && moveLeft());
document.getElementById('btn-right').addEventListener('click', () => gameStarted && !gameOver && moveRight());
document.getElementById('btn-down').addEventListener('click', () => gameStarted && !gameOver && drop());
document.getElementById('btn-rotate').addEventListener('click', () => gameStarted && !gameOver && rotatePiece());
document.getElementById('restart-btn').addEventListener('click', restart);

// Klavye kontrolleri
document.addEventListener('keydown', (e) => {
  if (!gameStarted) {
    if (e.key === 'Enter' || e.key === ' ') {
      startGame();
    }
    return;
  }
  
  if (gameOver) return;
  
  switch(e.key) {
    case 'ArrowLeft':
      moveLeft();
      break;
    case 'ArrowRight':
      moveRight();
      break;
    case 'ArrowDown':
      drop();
      break;
    case 'ArrowUp':
      rotatePiece();
      break;
  }
});

// Touch swipe kontrolleri
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
  if (!gameStarted || gameOver) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  
  const minSwipe = 30;
  
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > minSwipe) moveRight();
    else if (diffX < -minSwipe) moveLeft();
  } else {
    if (diffY > minSwipe) drop();
    else if (diffY < -minSwipe) rotatePiece();
  }
});
