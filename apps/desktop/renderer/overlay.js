var root = document.getElementById('root');
var statusChip = document.getElementById('statusChip');
var questionSection = document.getElementById('questionSection');
var questionText = document.getElementById('questionText');
var processingState = document.getElementById('processingState');
var answerSection = document.getElementById('answerSection');
var answerText = document.getElementById('answerText');
var idleState = document.getElementById('idleState');
var closeBtn = document.getElementById('closeBtn');
var dragBar = document.getElementById('dragBar');

// ─── Status ───────────────────────────────────────────────────────────────────
function setChip(type, label) {
  statusChip.className = 'chip chip-' + type;
  statusChip.textContent = label;
}

function showIdle(message) {
  questionSection.style.display = 'none';
  processingState.style.display = 'none';
  answerSection.style.display = 'none';
  idleState.style.display = '';
  if (message) {
    idleState.querySelector('.idle-text').textContent = message;
  }
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────
window.overlay.onStatusUpdate(function(data) {
  if (data.type === 'session-start') {
    setChip('listening', 'Listening');
    idleState.style.display = 'none';
    idleState.querySelector('.idle-text').textContent = 'Listening for questions...';
    questionSection.style.display = 'none';
    processingState.style.display = 'none';
    answerSection.style.display = 'none';
    idleState.style.display = '';
    idleState.querySelector('.idle-icon').textContent = '🎙';
    idleState.querySelector('.idle-text').textContent = 'Listening for questions...';
  } else if (data.type === 'processing') {
    setChip('processing', 'Processing');
    idleState.style.display = 'none';
    answerSection.style.display = 'none';
    if (data.question) {
      questionText.textContent = data.question;
      questionSection.style.display = '';
    }
    processingState.style.display = '';
  } else if (data.type === 'session-end') {
    setChip('idle', 'Idle');
    showIdle('Session ended');
  } else if (data.type === 'error') {
    setChip('error', 'Error');
    processingState.style.display = 'none';
    idleState.querySelector('.idle-icon').textContent = '⚠';
    idleState.querySelector('.idle-text').textContent = data.message || 'Error occurred';
    idleState.style.display = '';
  } else if (data.type === 'idle') {
    setChip('listening', 'Listening');
  }
});

window.overlay.onAiResponse(function(data) {
  setChip('listening', 'Listening');
  processingState.style.display = 'none';
  idleState.style.display = 'none';

  questionText.textContent = data.question;
  questionSection.style.display = '';

  answerText.textContent = data.answer;
  answerSection.style.display = '';
});

// ─── Close ────────────────────────────────────────────────────────────────────
closeBtn.addEventListener('click', function() {
  window.overlay.close();
});

// ─── Dragging (fallback for non-app-region drag) ──────────────────────────────
var dragging = false;
var lastX = 0;
var lastY = 0;

dragBar.addEventListener('mousedown', function(e) {
  dragging = true;
  lastX = e.screenX;
  lastY = e.screenY;
});

window.addEventListener('mousemove', function(e) {
  if (!dragging) return;
  var dx = e.screenX - lastX;
  var dy = e.screenY - lastY;
  lastX = e.screenX;
  lastY = e.screenY;
  window.overlay.move(dx, dy);
});

window.addEventListener('mouseup', function() { dragging = false; });
