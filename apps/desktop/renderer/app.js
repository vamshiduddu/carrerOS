// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  token: localStorage.getItem('co_token') || '',
  sessionActive: false,
  sessionStart: null,
  sessionTimer: null,
  qaCount: 0,
  transcript: '',
  interimTranscript: '',
  recognition: null,
  aiLoading: false,
};

const S = {
  get: (k, d) => localStorage.getItem(k) ?? d,
  set: (k, v) => localStorage.setItem(k, v),
};

// ─── Audio capture state ───────────────────────────────────────────────────────
const audio = {
  dgSocket: null,
  mediaRecorder: null,
  micStream: null,
  displayStream: null,
  audioCtx: null,
};

const $ = (id) => document.getElementById(id);
const el = {
  apiUrl: $('apiUrl'), email: $('email'), password: $('password'),
  loginBtn: $('loginBtn'), authState: $('authState'),
  jobDescription: $('jobDescription'), resumeText: $('resumeText'),
  answerStyle: $('answerStyle'),
  overlayOpacity: $('overlayOpacity'), opacityLabel: $('opacityLabel'),
  startBtn: $('startBtn'), stopBtn: $('stopBtn'),
  statusBadge: $('statusBadge'),
  audioSourceLabel: $('audioSourceLabel'),
  toggleOverlayBtn: $('toggleOverlayBtn'), clearHistoryBtn: $('clearHistoryBtn'),
  transcriptText: $('transcriptText'), clearTranscriptBtn: $('clearTranscriptBtn'),
  manualInputBlock: $('manualInputBlock'), manualInput: $('manualInput'),
  manualSubmitBtn: $('manualSubmitBtn'), manualToggleBtn: $('manualToggleBtn'),
  triggerBtn: $('triggerBtn'), qaHistory: $('qaHistory'),
  qaCount: $('qaCount'), sessionTime: $('sessionTime'),
};

// ─── Init ─────────────────────────────────────────────────────────────────────
el.apiUrl.value = window.bridge.apiUrl || S.get('co_apiUrl', 'http://localhost:3001');
el.jobDescription.value = S.get('co_jd', '');
el.resumeText.value = S.get('co_resume', '');
el.answerStyle.value = S.get('co_style', 'concise');
el.overlayOpacity.value = S.get('co_opacity', '90');
el.opacityLabel.textContent = el.overlayOpacity.value + '%';

function saveSettings() {
  S.set('co_apiUrl', el.apiUrl.value.trim());
  S.set('co_jd', el.jobDescription.value);
  S.set('co_resume', el.resumeText.value);
  S.set('co_style', el.answerStyle.value);
  S.set('co_opacity', el.overlayOpacity.value);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function setAuthUI(ok, label) {
  el.authState.className = 'auth-status ' + (ok ? 'authenticated' : 'unauthenticated');
  el.authState.innerHTML = '<div class="auth-dot"></div>' + (label || (ok ? 'Authenticated' : 'Not authenticated'));
}

async function login() {
  saveSettings();
  const apiUrl = el.apiUrl.value.trim();
  const email = el.email.value.trim();
  const password = el.password.value;
  if (!email || !password) { setAuthUI(false, 'Enter email and password'); return; }
  el.loginBtn.disabled = true;
  el.loginBtn.textContent = 'Signing in...';
  try {
    const res = await fetch(apiUrl + '/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    state.token = data.accessToken;
    S.set('co_token', state.token);
    let name = email.split('@')[0];
    try {
      const me = await fetch(apiUrl + '/v1/auth/me', { headers: { Authorization: 'Bearer ' + state.token } });
      const md = await me.json();
      name = md.user && md.user.fullName ? md.user.fullName.split(' ')[0] : name;
    } catch (e) { /* ignore */ }
    setAuthUI(true, 'Signed in as ' + name);
    el.email.value = '';
    el.password.value = '';
  } catch (e) {
    setAuthUI(false, e.message);
  } finally {
    el.loginBtn.disabled = false;
    el.loginBtn.textContent = 'Sign In';
  }
}

// ─── Session ──────────────────────────────────────────────────────────────────
function startSession() {
  if (!state.token) { setAuthUI(false, 'Sign in first'); return; }
  state.sessionActive = true;
  state.sessionStart = Date.now();
  state.qaCount = 0;
  el.qaCount.textContent = '0';
  el.startBtn.style.display = 'none';
  el.stopBtn.style.display = '';
  el.triggerBtn.disabled = false;
  setStatus('listening');
  window.bridge.openOverlay();
  window.bridge.sendOverlayStatus({ type: 'session-start' });
  startRecognition();
  state.sessionTimer = setInterval(updateTimer, 1000);
  clearHistory();
}

function stopSession() {
  state.sessionActive = false;
  el.startBtn.style.display = '';
  el.stopBtn.style.display = 'none';
  el.triggerBtn.disabled = true;
  setStatus('idle');
  stopRecognition();
  clearInterval(state.sessionTimer);
  window.bridge.sendOverlayStatus({ type: 'session-end' });
}

function updateTimer() {
  const secs = Math.floor((Date.now() - state.sessionStart) / 1000);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  el.sessionTime.textContent = m + ':' + s;
}

function setStatus(s) {
  el.statusBadge.className = 'status-badge ' + s;
  const labels = { idle: 'Idle', listening: 'Listening', processing: 'Processing...' };
  el.statusBadge.innerHTML = '<span class="status-dot"></span>' + (labels[s] || s);
}

// ─── Audio Capture + Transcription ────────────────────────────────────────────

async function startRecognition() {
  // Try server-side proxy first (key stored securely on server)
  // Fall back to direct Deepgram with user-supplied key, then Web Speech
  var apiUrl = el.apiUrl.value.trim() || 'http://localhost:3001';
  await startServerProxy(apiUrl);
}

// Connect to CareerOS API WebSocket which proxies audio to Deepgram server-side
async function startServerProxy(apiUrl) {
  try {
    // Capture system audio output (interviewer's voice through speakers)
    audio.displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,  // required by spec
      audio: true
    });

    var audioTracks = audio.displayStream.getAudioTracks();
    if (audioTracks.length === 0) {
      throw new Error('No system audio captured — enable "Share system audio".');
    }

    // Create AudioContext source BEFORE stopping video tracks
    audio.audioCtx = new AudioContext({ sampleRate: 16000 });
    var dest = audio.audioCtx.createMediaStreamDestination();
    audio.audioCtx.createMediaStreamSource(audio.displayStream).connect(dest);

    // Now safe to stop video tracks
    audio.displayStream.getVideoTracks().forEach(function(t) { t.stop(); });

    // Connect to server-side proxy (API holds the Deepgram key)
    var wsUrl = apiUrl.replace(/^http/, 'ws') + '/v1/transcribe/stream?token=' + encodeURIComponent(state.token);
    audio.dgSocket = new WebSocket(wsUrl);

    audio.dgSocket.onopen = function() {
      el.audioSourceLabel.textContent = 'System audio (server proxy)';
      el.audioSourceLabel.style.color = '#4caf50';

      audio.mediaRecorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus' });
      audio.mediaRecorder.ondataavailable = function(e) {
        if (audio.dgSocket && audio.dgSocket.readyState === WebSocket.OPEN && e.data.size > 0) {
          audio.dgSocket.send(e.data);
        }
      };
      audio.mediaRecorder.start(250);
    };

    audio.dgSocket.onmessage = function(msg) {
      try {
        var data = JSON.parse(msg.data);
        if (data.type === 'transcript') {
          if (data.isFinal) {
            if (data.transcript) state.transcript += data.transcript + ' ';
            state.interimTranscript = '';
            scheduleAutoTrigger();
          } else {
            state.interimTranscript = data.transcript || '';
            cancelAutoTrigger();
          }
          renderTranscript();
        } else if (data.type === 'error') {
          renderTranscript('Transcription error: ' + data.message + '. Use manual input.');
          el.manualInputBlock.style.display = '';
          el.audioSourceLabel.textContent = 'Error';
          el.audioSourceLabel.style.color = '#e74c3c';
        }
      } catch(e) { /* skip malformed */ }
    };

    audio.dgSocket.onerror = function() {
      // If server proxy fails, fall back to Web Speech
      renderTranscript('Transcription proxy unavailable — falling back to Web Speech.');
      el.audioSourceLabel.textContent = 'Fallback';
      el.audioSourceLabel.style.color = '#f4a63c';
      startWebSpeech();
    };

    audio.dgSocket.onclose = function(ev) {
      if (state.sessionActive && ev.code !== 1000) {
        setTimeout(function() { if (state.sessionActive) startServerProxy(apiUrl); }, 1500);
      }
    };

  } catch(e) {
    console.warn('Server proxy failed:', e.message, '— falling back to Web Speech');
    renderTranscript('System audio capture failed: ' + e.message + '. Falling back to Web Speech (mic).');
    el.manualInputBlock.style.display = '';
    el.audioSourceLabel.textContent = 'Fallback (mic)';
    el.audioSourceLabel.style.color = '#f4a63c';
    startWebSpeech();
  }
}


// Fallback: Web Speech API (mic only, no system audio)
function startWebSpeech() {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    el.manualInputBlock.style.display = '';
    renderTranscript('No Deepgram key set and Speech API unavailable. Use manual input.');
    return;
  }
  el.audioSourceLabel.textContent = 'Web Speech (add Deepgram key for system audio)';
  el.audioSourceLabel.style.color = '#f4a63c';

  state.recognition = new SR();
  state.recognition.continuous = true;
  state.recognition.interimResults = true;
  state.recognition.lang = 'en-US';

  state.recognition.onresult = function(event) {
    var interim = '';
    var final = '';
    for (var i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) final += event.results[i][0].transcript + ' ';
      else interim += event.results[i][0].transcript;
    }
    if (final) { state.transcript += final; scheduleAutoTrigger(); }
    else { cancelAutoTrigger(); }
    state.interimTranscript = interim;
    renderTranscript();
  };

  state.recognition.onerror = function(e) {
    if (e.error === 'not-allowed') {
      el.manualInputBlock.style.display = '';
      renderTranscript('Microphone access denied. Use manual input.');
    }
  };

  state.recognition.onend = function() {
    if (state.sessionActive) {
      try { state.recognition.start(); } catch(e) {}
    }
  };

  try { state.recognition.start(); } catch(e) {}
}

function stopRecognition() {
  // Stop Deepgram / server proxy
  try { if (audio.mediaRecorder) audio.mediaRecorder.stop(); } catch(e) {}
  audio.mediaRecorder = null;
  try { if (audio.dgSocket) audio.dgSocket.close(1000, 'session-end'); } catch(e) {}
  audio.dgSocket = null;
  try { if (audio.audioCtx) audio.audioCtx.close(); } catch(e) {}
  audio.audioCtx = null;
  audio._dest = null;
  if (audio.displayStream) { audio.displayStream.getTracks().forEach(function(t) { t.stop(); }); audio.displayStream = null; }

  // Stop Web Speech fallback
  try { if (state.recognition) state.recognition.stop(); } catch(e) {}
  state.recognition = null;

  el.audioSourceLabel.textContent = '—';
  el.audioSourceLabel.style.color = '';
}

function renderTranscript(override) {
  if (override) {
    el.transcriptText.innerHTML = '<span class="transcript-placeholder">' + esc(override) + '</span>';
    return;
  }
  if (!state.transcript && !state.interimTranscript) {
    el.transcriptText.innerHTML = '<span class="transcript-placeholder">Listening... speak to capture the question.</span>';
    return;
  }
  var final = state.transcript ? '<span>' + esc(state.transcript) + '</span>' : '';
  var interim = state.interimTranscript ? '<span class="transcript-interim"> ' + esc(state.interimTranscript) + '</span>' : '';
  el.transcriptText.innerHTML = final + interim;
}

function clearTranscript() {
  state.transcript = '';
  state.interimTranscript = '';
  renderTranscript();
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Auto-trigger after silence ───────────────────────────────────────────────
var autoTriggerTimer = null;
var AUTO_TRIGGER_DELAY = 2500; // 2.5s of silence → auto-send

function scheduleAutoTrigger() {
  cancelAutoTrigger();
  if (!state.sessionActive || state.aiLoading) return;
  var text = state.transcript.trim();
  if (!text || text.split(/\s+/).length < 4) return; // need at least 4 words
  autoTriggerTimer = setTimeout(function() {
    if (state.sessionActive && !state.aiLoading && state.transcript.trim()) {
      triggerAi();
    }
  }, AUTO_TRIGGER_DELAY);
}

function cancelAutoTrigger() {
  if (autoTriggerTimer) { clearTimeout(autoTriggerTimer); autoTriggerTimer = null; }
}

// ─── Screen Solver ────────────────────────────────────────────────────────────
async function solveScreen() {
  if (!state.token || state.aiLoading) return;
  state.aiLoading = true;
  var solveBtn = document.getElementById('solveScreenBtn');
  if (solveBtn) { solveBtn.disabled = true; solveBtn.textContent = '📸 Capturing...'; }
  setStatus('processing');
  window.bridge.sendOverlayStatus({ type: 'processing', question: 'Analyzing screen...' });

  try {
    var imageBase64 = await window.bridge.captureScreen();
    if (!imageBase64) throw new Error('Screen capture failed');
    if (solveBtn) solveBtn.textContent = '🧠 Solving...';

    var res = await fetch(el.apiUrl.value.trim() + '/v1/ai/solve-screen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + state.token },
      body: JSON.stringify({ imageBase64: imageBase64, context: el.jobDescription.value }),
    });
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Solve failed');

    window.bridge.sendToOverlay({ question: '📸 Screen capture', answer: data.solution, type: 'code', timestamp: Date.now() });
    window.bridge.sendOverlayStatus({ type: 'idle' });
    addToHistory('📸 Screen capture', data.solution);
    state.qaCount++;
    el.qaCount.textContent = state.qaCount;
  } catch (e) {
    window.bridge.sendOverlayStatus({ type: 'error', message: e.message });
  } finally {
    state.aiLoading = false;
    if (solveBtn) { solveBtn.disabled = false; solveBtn.textContent = '📸 Solve Screen'; }
    setStatus(state.sessionActive ? 'listening' : 'idle');
  }
}

// ─── AI Answer ────────────────────────────────────────────────────────────────
async function triggerAi(questionOverride) {
  if (!state.token || state.aiLoading) return;
  var question = (questionOverride || state.transcript).trim();
  if (!question) { renderTranscript('No transcript yet — speak or type a question first.'); return; }

  state.aiLoading = true;
  el.triggerBtn.disabled = true;
  el.triggerBtn.textContent = 'Thinking...';
  setStatus('processing');
  window.bridge.sendOverlayStatus({ type: 'processing', question: question });

  try {
    var systemPrompt = buildSystemPrompt();
    var res = await fetch(el.apiUrl.value.trim() + '/v1/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + state.token },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Interview question: "' + question + '"\n\nProvide the best answer based on the candidate\'s background.' },
        ],
        temperature: 0.4,
      }),
    });

    var data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI request failed');
    var answer = data.text || data.content || '[No response]';

    window.bridge.sendToOverlay({ question: question, answer: answer, timestamp: Date.now() });
    window.bridge.sendOverlayStatus({ type: 'idle' });

    addToHistory(question, answer);
    state.qaCount++;
    el.qaCount.textContent = state.qaCount;
    clearTranscript();
  } catch (e) {
    window.bridge.sendOverlayStatus({ type: 'error', message: e.message });
  } finally {
    state.aiLoading = false;
    el.triggerBtn.disabled = !state.sessionActive;
    el.triggerBtn.textContent = 'Get AI Answer';
    setStatus(state.sessionActive ? 'listening' : 'idle');
  }
}

function buildSystemPrompt() {
  var style = el.answerStyle.value;
  var instructions = {
    concise: 'Give 2-3 key talking points the candidate can elaborate on. Be brief and direct.',
    detailed: 'Give a full, well-structured paragraph answer. Be thorough but natural-sounding.',
    bullets: 'Give the answer as 3-5 bullet points. Each bullet should be one clear idea.',
    star: 'Structure the answer in STAR format — Situation, Task, Action, Result. Label each part.',
  };

  var resume = el.resumeText.value.trim();
  var jd = el.jobDescription.value.trim();

  var prompt = 'You are a real-time interview coach. You know this candidate inside out from their resume below.\n' +
    'When answering questions about the candidate, speak AS the candidate in first person.\n' +
    'Reference specific projects, skills, companies, and achievements from the resume.\n' +
    'Sound natural and confident — like someone who actually did these things.\n' +
    (instructions[style] || instructions.concise) +
    '\n\nMax 150 words. No filler. No generic advice. Every answer must be grounded in the resume.';

  if (resume) prompt += '\n\n=== CANDIDATE RESUME (read carefully) ===\n' + resume;
  if (jd) prompt += '\n\n=== JOB DESCRIPTION ===\n' + jd;
  return prompt;
}

// ─── Q&A History ──────────────────────────────────────────────────────────────
function addToHistory(question, answer) {
  var empty = el.qaHistory.querySelector('.empty-state');
  if (empty) empty.remove();
  var item = document.createElement('div');
  item.className = 'qa-item';
  item.innerHTML = '<div class="qa-question">Q: ' + esc(question) + '</div><div class="qa-answer">' + esc(answer) + '</div>';
  el.qaHistory.insertBefore(item, el.qaHistory.firstChild);
}

function clearHistory() {
  el.qaHistory.innerHTML = '';
  state.qaCount = 0;
  el.qaCount.textContent = '0';
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
el.loginBtn.addEventListener('click', login);
el.startBtn.addEventListener('click', startSession);
el.stopBtn.addEventListener('click', stopSession);
el.triggerBtn.addEventListener('click', function() { triggerAi(); });
el.manualSubmitBtn.addEventListener('click', function() {
  var q = el.manualInput.value.trim();
  if (q) { state.transcript = q; triggerAi(q); el.manualInput.value = ''; }
});
el.manualToggleBtn.addEventListener('click', function() {
  var hidden = el.manualInputBlock.style.display === 'none';
  el.manualInputBlock.style.display = hidden ? '' : 'none';
});
el.clearTranscriptBtn.addEventListener('click', clearTranscript);
el.clearHistoryBtn.addEventListener('click', clearHistory);
el.toggleOverlayBtn.addEventListener('click', function() { window.bridge.openOverlay(); });

el.overlayOpacity.addEventListener('input', function() {
  el.opacityLabel.textContent = this.value + '%';
  window.bridge.setOverlayOpacity(parseInt(this.value) / 100);
  saveSettings();
});

['apiUrl', 'jobDescription', 'resumeText', 'answerStyle'].forEach(function(id) {
  $(id).addEventListener('change', saveSettings);
});

document.getElementById('solveScreenBtn') && document.getElementById('solveScreenBtn').addEventListener('click', solveScreen);

window.bridge.onGlobalTrigger(function() { if (state.sessionActive) triggerAi(); });
window.bridge.onGlobalClear(function() { clearTranscript(); });
window.bridge.onGlobalSolveScreen(function() { solveScreen(); });
el.password.addEventListener('keydown', function(e) { if (e.key === 'Enter') login(); });

if (state.token) setAuthUI(true, 'Session restored — click Start Session');

