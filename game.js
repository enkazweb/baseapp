import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';

// Farcaster SDK başlat
sdk.actions.ready();

// ==================== SES SİSTEMİ ====================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let musicPlaying = false;
let musicTimeout = null;
let audioInitialized = false;
let musicLoopCount = 0;
const MAX_MUSIC_LOOPS = 2;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  if (!audioInitialized) {
    audioInitialized = true;
    startMusic();
  }
}

// İlk etkileşimde müziği başlat
function setupAudioOnInteraction() {
  const startAudio = () => {
    initAudio();
    document.removeEventListener('click', startAudio);
    document.removeEventListener('touchstart', startAudio);
    document.removeEventListener('keydown', startAudio);
  };
  
  document.addEventListener('click', startAudio);
  document.addEventListener('touchstart', startAudio);
  document.addEventListener('keydown', startAudio);
}

setupAudioOnInteraction();

// Ses efekti oluşturucu
function playSound(frequency, duration, type = 'square', volume = 0.3) {
  if (!audioCtx) return;
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration);
}

// Döndürme sesi
function playRotateSound() {
  if (!audioCtx) return;
  playSound(600, 0.08, 'square', 0.2);
  setTimeout(() => playSound(800, 0.08, 'square', 0.15), 30);
}

// Yerleştirme sesi
function playDropSound() {
  if (!audioCtx) return;
  playSound(150, 0.15, 'square', 0.3);
  setTimeout(() => playSound(100, 0.1, 'square', 0.2), 50);
}

// Satır silme sesi - Yeni epik ses!
function playClearSound(lines) {
  if (!audioCtx) return;
  
  // Sweep efekti
  const sweepOsc = audioCtx.createOscillator();
  const sweepGain = audioCtx.createGain();
  sweepOsc.connect(sweepGain);
  sweepGain.connect(audioCtx.destination);
  sweepOsc.type = 'sawtooth';
  sweepOsc.frequency.setValueAtTime(200, audioCtx.currentTime);
  sweepOsc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.2);
  sweepGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  sweepGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  sweepOsc.start(audioCtx.currentTime);
  sweepOsc.stop(audioCtx.currentTime + 0.3);
  
  // Çoklu satır için ekstra sesler
  if (lines >= 2) {
    setTimeout(() => {
      playSound(523, 0.1, 'square', 0.2); // C5
      setTimeout(() => playSound(659, 0.1, 'square', 0.2), 50); // E5
      setTimeout(() => playSound(784, 0.15, 'square', 0.25), 100); // G5
    }, 150);
  }
  
  if (lines >= 4) {
    // TETRIS! - Özel fanfare
    setTimeout(() => {
      const tetrisNotes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      tetrisNotes.forEach((note, i) => {
        setTimeout(() => playSound(note, 0.2, 'square', 0.3), i * 80);
      });
    }, 250);
  }
}

// Game over sesi
function playGameOverSound() {
  if (!audioCtx) return;
  const notes = [400, 350, 300, 250, 200];
  notes.forEach((freq, i) => {
    setTimeout(() => playSound(freq, 0.3, 'sawtooth', 0.2), i * 150);
  });
}

// Tetris müziği (Korobeiniki benzeri basit melodi)
const musicNotes = [
  // Ana tema
  { note: 659, dur: 0.4 },  // E5
  { note: 494, dur: 0.2 },  // B4
  { note: 523, dur: 0.2 },  // C5
  { note: 587, dur: 0.4 },  // D5
  { note: 523, dur: 0.2 },  // C5
  { note: 494, dur: 0.2 },  // B4
  { note: 440, dur: 0.4 },  // A4
  { note: 440, dur: 0.2 },  // A4
  { note: 523, dur: 0.2 },  // C5
  { note: 659, dur: 0.4 },  // E5
  { note: 587, dur: 0.2 },  // D5
  { note: 523, dur: 0.2 },  // C5
  { note: 494, dur: 0.6 },  // B4
  { note: 523, dur: 0.2 },  // C5
  { note: 587, dur: 0.4 },  // D5
  { note: 659, dur: 0.4 },  // E5
  { note: 523, dur: 0.4 },  // C5
  { note: 440, dur: 0.4 },  // A4
  { note: 440, dur: 0.4 },  // A4
  { note: 0, dur: 0.4 },    // Pause
  // İkinci kısım
  { note: 587, dur: 0.6 },  // D5
  { note: 698, dur: 0.2 },  // F5
  { note: 880, dur: 0.4 },  // A5
  { note: 784, dur: 0.2 },  // G5
  { note: 698, dur: 0.2 },  // F5
  { note: 659, dur: 0.6 },  // E5
  { note: 523, dur: 0.2 },  // C5
  { note: 659, dur: 0.4 },  // E5
  { note: 587, dur: 0.2 },  // D5
  { note: 523, dur: 0.2 },  // C5
  { note: 494, dur: 0.4 },  // B4
  { note: 494, dur: 0.2 },  // B4
  { note: 523, dur: 0.2 },  // C5
  { note: 587, dur: 0.4 },  // D5
  { note: 659, dur: 0.4 },  // E5
  { note: 523, dur: 0.4 },  // C5
  { note: 440, dur: 0.4 },  // A4
  { note: 440, dur: 0.4 },  // A4
  { note: 0, dur: 0.4 },    // Pause
];

let currentNoteIndex = 0;

function playMusic() {
  if (!audioCtx || !musicPlaying) return;
  
  const { note, dur } = musicNotes[currentNoteIndex];
  
  if (note > 0) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.value = note;
    oscillator.type = 'square';
    
    const volume = 0.12;
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime + dur * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur * 0.9);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + dur);
  }
  
  currentNoteIndex++;
  
  // Döngü kontrolü
  if (currentNoteIndex >= musicNotes.length) {
    currentNoteIndex = 0;
    musicLoopCount++;
    
    // 3 tur sonra dur
    if (musicLoopCount >= MAX_MUSIC_LOOPS) {
      stopMusic();
      return;
    }
  }
  
  musicTimeout = setTimeout(playMusic, dur * 1000);
}

function startMusic() {
  if (musicPlaying) return;
  musicPlaying = true;
  currentNoteIndex = 0;
  musicLoopCount = 0;
  playMusic();
}

function stopMusic() {
  musicPlaying = false;
  if (musicTimeout) {
    clearTimeout(musicTimeout);
    musicTimeout = null;
  }
}

// ==================== OYUN SABİTLERİ ====================
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
nextCanvas.width = 4 * 15;
nextCanvas.height = 2 * 15;

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

// Satır silme efekti için
let clearingLines = [];
let clearAnimationFrame = 0;
let isClearing = false;

// Soft drop (basılı tutunca hızlı inme)
let softDropping = false;
const SOFT_DROP_INTERVAL = 50; // Hızlı düşme aralığı (ms)

// Sağ/sol basılı tutma
let movingLeft = false;
let movingRight = false;
let lastMoveTime = 0;
const MOVE_INTERVAL = 80; // Hareket aralığı (ms)

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
    stopMusic();
    playGameOverSound();
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

function findFullLines() {
  const fullLines = [];
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      fullLines.push(y);
    }
  }
  return fullLines;
}

function clearLinesWithAnimation() {
  const fullLines = findFullLines();
  
  if (fullLines.length > 0) {
    isClearing = true;
    clearingLines = fullLines;
    clearAnimationFrame = 0;
    playClearSound(fullLines.length);
    
    // Animasyon
    const animateClear = () => {
      clearAnimationFrame++;
      
      if (clearAnimationFrame <= 10) {
        draw();
        requestAnimationFrame(animateClear);
      } else {
        // Satırları sil
        fullLines.sort((a, b) => b - a).forEach(y => {
          board.splice(y, 1);
          board.unshift(Array(COLS).fill(0));
        });
        
        const points = [0, 100, 300, 500, 800];
        score += points[fullLines.length] * level;
        lines += fullLines.length;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        
        document.getElementById('score').textContent = score;
        document.getElementById('level').textContent = level;
        document.getElementById('lines').textContent = lines;
        
        isClearing = false;
        clearingLines = [];
        resetPiece();
      }
    };
    
    animateClear();
    return true;
  }
  
  return false;
}

function rotate(piece) {
  const rotated = piece[0].map((_, i) => piece.map(row => row[i]).reverse());
  return rotated;
}

function moveLeft() {
  if (isClearing) return;
  if (!collision(currentPos.x - 1, currentPos.y)) {
    currentPos.x--;
  }
}

function moveRight() {
  if (isClearing) return;
  if (!collision(currentPos.x + 1, currentPos.y)) {
    currentPos.x++;
  }
}

function moveDown() {
  if (isClearing) return false;
  if (!collision(currentPos.x, currentPos.y + 1)) {
    currentPos.y++;
    return true;
  }
  return false;
}

function rotatePiece() {
  if (isClearing) return;
  const rotated = rotate(currentPiece);
  let kick = 0;
  
  if (collision(currentPos.x, currentPos.y, rotated)) {
    kick = currentPos.x > COLS / 2 ? -1 : 1;
  }
  
  if (!collision(currentPos.x + kick, currentPos.y, rotated)) {
    currentPiece = rotated;
    currentPos.x += kick;
    playRotateSound();
  }
}

function drop() {
  if (isClearing) return;
  if (!moveDown()) {
    playDropSound();
    merge();
    if (!clearLinesWithAnimation()) {
      resetPiece();
    }
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
        // Satır silme animasyonu
        if (isClearing && clearingLines.includes(y)) {
          const flash = Math.sin(clearAnimationFrame * 0.8) > 0;
          if (flash) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
          } else {
            ctx.fillStyle = '#e94560';
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
          }
        } else {
          drawBlock(ctx, x, y, COLORS[board[y][x]]);
        }
      }
    }
  }
  
  // Satır silme efekti - parlama çizgisi
  if (isClearing) {
    const progress = clearAnimationFrame / 10;
    clearingLines.forEach(lineY => {
      const gradient = ctx.createLinearGradient(0, lineY * BLOCK_SIZE, canvas.width, lineY * BLOCK_SIZE);
      gradient.addColorStop(0, 'rgba(255,255,255,0)');
      gradient.addColorStop(Math.max(0, progress - 0.2), 'rgba(255,255,255,0)');
      gradient.addColorStop(progress, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(Math.min(1, progress + 0.2), 'rgba(255,255,255,0)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, lineY * BLOCK_SIZE, canvas.width, BLOCK_SIZE);
    });
  }
  
  // Mevcut parça
  if (currentPiece && !isClearing) {
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
  const size = 15;
  nextCtx.fillStyle = '#0a0a14';
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  
  if (nextPiece) {
    const pieceWidth = nextPiece[0].length;
    const pieceHeight = nextPiece.length;
    const offsetX = (nextCanvas.width - pieceWidth * size) / 2 / size;
    const offsetY = (nextCanvas.height - pieceHeight * size) / 2 / size;
    
    for (let y = 0; y < nextPiece.length; y++) {
      for (let x = 0; x < nextPiece[y].length; x++) {
        if (nextPiece[y][x]) {
          nextCtx.fillStyle = COLORS[nextPiece[y][x]];
          const px = (offsetX + x) * size;
          const py = (offsetY + y) * size;
          nextCtx.fillRect(px, py, size - 1, size - 1);
        }
      }
    }
  }
}

function gameLoop(time) {
  if (!gameOver && gameStarted) {
    // Sağ/sol hareket
    if (!isClearing && (movingLeft || movingRight) && time - lastMoveTime > MOVE_INTERVAL) {
      if (movingLeft) moveLeft();
      if (movingRight) moveRight();
      lastMoveTime = time;
    }
    
    // Aşağı düşme
    const currentInterval = softDropping ? SOFT_DROP_INTERVAL : dropInterval;
    if (!isClearing && time - lastDrop > currentInterval) {
      if (softDropping) {
        // Soft drop - aşağı gidemiyorsa hemen yerleştir
        if (!moveDown()) {
          playDropSound();
          merge();
          if (!clearLinesWithAnimation()) {
            resetPiece();
          }
        }
      } else {
        drop();
      }
      lastDrop = time;
    }
    draw();
    requestAnimationFrame(gameLoop);
  }
}

function startGame() {
  initAudio();
  document.getElementById('start-screen').classList.add('hidden');
  gameStarted = true;
  if (!musicPlaying) {
    startMusic();
  }
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
  isClearing = false;
  clearingLines = [];
  
  document.getElementById('score').textContent = '0';
  document.getElementById('level').textContent = '1';
  document.getElementById('lines').textContent = '0';
  document.getElementById('game-over').classList.add('hidden');
  
  startMusic();
  nextPiece = getRandomPiece();
  resetPiece();
  requestAnimationFrame(gameLoop);
}

// Başlangıç ekranını göster
draw();
drawNextPiece();

// Event listeners
document.getElementById('start-btn').addEventListener('click', startGame);
// Sol butonu - basılı tutunca sürekli hareket
const btnLeft = document.getElementById('btn-left');
btnLeft.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (gameStarted && !gameOver) {
    moveLeft();
    movingLeft = true;
    lastMoveTime = performance.now();
  }
});
btnLeft.addEventListener('touchend', () => { movingLeft = false; });
btnLeft.addEventListener('mousedown', () => {
  if (gameStarted && !gameOver) {
    moveLeft();
    movingLeft = true;
    lastMoveTime = performance.now();
  }
});
btnLeft.addEventListener('mouseup', () => { movingLeft = false; });
btnLeft.addEventListener('mouseleave', () => { movingLeft = false; });

// Sağ butonu - basılı tutunca sürekli hareket
const btnRight = document.getElementById('btn-right');
btnRight.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (gameStarted && !gameOver) {
    moveRight();
    movingRight = true;
    lastMoveTime = performance.now();
  }
});
btnRight.addEventListener('touchend', () => { movingRight = false; });
btnRight.addEventListener('mousedown', () => {
  if (gameStarted && !gameOver) {
    moveRight();
    movingRight = true;
    lastMoveTime = performance.now();
  }
});
btnRight.addEventListener('mouseup', () => { movingRight = false; });
btnRight.addEventListener('mouseleave', () => { movingRight = false; });
// Aşağı butonu - basılı tutunca hızlı düşme
const btnDown = document.getElementById('btn-down');
btnDown.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (gameStarted && !gameOver) {
    softDropping = true;
    lastDrop = 0;
  }
});
btnDown.addEventListener('touchend', () => {
  softDropping = false;
});
btnDown.addEventListener('mousedown', () => {
  if (gameStarted && !gameOver) {
    softDropping = true;
    lastDrop = 0;
  }
});
btnDown.addEventListener('mouseup', () => {
  softDropping = false;
});
btnDown.addEventListener('mouseleave', () => {
  softDropping = false;
});
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
      if (!movingLeft) {
        moveLeft(); // İlk basışta hemen hareket et
        movingLeft = true;
        lastMoveTime = performance.now();
      }
      e.preventDefault();
      break;
    case 'ArrowRight':
      if (!movingRight) {
        moveRight(); // İlk basışta hemen hareket et
        movingRight = true;
        lastMoveTime = performance.now();
      }
      e.preventDefault();
      break;
    case 'ArrowDown':
      if (!softDropping) {
        softDropping = true;
        lastDrop = 0; // Hemen başlasın
      }
      e.preventDefault();
      break;
    case 'ArrowUp':
      rotatePiece();
      e.preventDefault();
      break;
  }
});

document.addEventListener('keyup', (e) => {
  switch(e.key) {
    case 'ArrowLeft':
      movingLeft = false;
      break;
    case 'ArrowRight':
      movingRight = false;
      break;
    case 'ArrowDown':
      softDropping = false;
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
