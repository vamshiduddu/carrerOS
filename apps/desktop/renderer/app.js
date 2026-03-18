const state = {
    token: localStorage.getItem('careeros_token') || '',
    messages: [],
    thinking: false
};

const el = {
    apiUrl: document.getElementById('apiUrl'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    loginBtn: document.getElementById('loginBtn'),
    authState: document.getElementById('authState'),
    provider: document.getElementById('provider'),
    model: document.getElementById('model'),
    providerKey: document.getElementById('providerKey'),
    baseUrl: document.getElementById('baseUrl'),
    systemPrompt: document.getElementById('systemPrompt'),
    messages: document.getElementById('messages'),
    composer: document.getElementById('composer'),
    prompt: document.getElementById('prompt'),
    clearBtn: document.getElementById('clearBtn'),
    clearBtn2: document.getElementById('clearBtn2'),
    modelBadge: document.getElementById('modelBadge')
};

const persisted = {
    apiUrl: localStorage.getItem('careeros_api_url') || 'http://localhost:3001',
    provider: localStorage.getItem('careeros_provider') || 'anthropic',
    model: localStorage.getItem('careeros_model') || 'claude-sonnet-4-6',
    baseUrl: localStorage.getItem('careeros_base_url') || '',
    systemPrompt: localStorage.getItem('careeros_system_prompt') || 'You are a focused career copilot. Help with resume writing, interview preparation, and job search strategy. Be concise, practical, and encouraging.'
};

el.apiUrl.value = persisted.apiUrl;
el.provider.value = persisted.provider;
el.model.value = persisted.model;
el.baseUrl.value = persisted.baseUrl;
el.systemPrompt.value = persisted.systemPrompt;

function saveSettings() {
    localStorage.setItem('careeros_api_url', el.apiUrl.value.trim());
    localStorage.setItem('careeros_provider', el.provider.value);
    localStorage.setItem('careeros_model', el.model.value.trim());
    localStorage.setItem('careeros_base_url', el.baseUrl.value.trim());
    localStorage.setItem('careeros_system_prompt', el.systemPrompt.value);
    updateModelBadge();
}

function updateModelBadge() {
    const model = el.model.value.trim() || el.provider.value;
    const shortModel = model.length > 20 ? model.slice(0, 18) + '…' : model;
    el.modelBadge.textContent = shortModel;
}

function setAuthState(authenticated, label) {
    el.authState.className = `auth-status ${authenticated ? 'authenticated' : 'unauthenticated'}`;
    el.authState.innerHTML = `<div class="auth-dot"></div>${label || (authenticated ? 'Authenticated' : 'Not authenticated')}`;
}

function addMessage(role, content) {
    if (role === 'user' || role === 'assistant') {
        state.messages.push({ role, content });
    }
    const node = document.createElement('div');
    node.className = `message ${role === 'system-msg' ? 'system-msg' : role}`;

    if (role === 'assistant' || role === 'user') {
        const roleLabel = document.createElement('div');
        roleLabel.className = 'message-role';
        roleLabel.textContent = role === 'user' ? 'You' : 'CareerOS AI';
        node.appendChild(roleLabel);
    }

    const text = document.createElement('div');
    text.textContent = content;
    node.appendChild(text);

    el.messages.appendChild(node);
    el.messages.scrollTop = el.messages.scrollHeight;
    return node;
}

function showThinking() {
    const node = document.createElement('div');
    node.className = 'thinking';
    node.id = 'thinking-indicator';
    node.innerHTML = '<span></span><span></span><span></span>';
    el.messages.appendChild(node);
    el.messages.scrollTop = el.messages.scrollHeight;
}

function hideThinking() {
    const node = document.getElementById('thinking-indicator');
    if (node) node.remove();
}

function clearChat() {
    state.messages = [];
    el.messages.innerHTML = '';
    addMessage('system-msg', 'Conversation cleared');
}

async function login() {
    saveSettings();
    const apiUrl = el.apiUrl.value.trim();
    const email = el.email.value.trim();
    const password = el.password.value;

    if (!email || !password) {
        addMessage('system-msg', 'Please enter your email and password.');
        return;
    }

    el.loginBtn.disabled = true;
    el.loginBtn.textContent = 'Signing in...';

    try {
        const response = await fetch(`${apiUrl}/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');

        state.token = data.accessToken;
        localStorage.setItem('careeros_token', state.token);

        // Get user name
        let userName = email.split('@')[0];
        try {
            const meRes = await fetch(`${apiUrl}/v1/auth/me`, {
                headers: { Authorization: `Bearer ${state.token}` }
            });
            const meData = await meRes.json();
            userName = meData.user?.fullName?.split(' ')[0] || userName;
        } catch { /* ignore */ }

        setAuthState(true, `Signed in as ${userName}`);
        addMessage('system-msg', `Welcome back, ${userName}! You can now chat with the AI model via your CareerOS backend.`);
        el.email.value = '';
        el.password.value = '';
    } catch (error) {
        setAuthState(false);
        addMessage('system-msg', `Sign in failed: ${error.message}`);
    } finally {
        el.loginBtn.disabled = false;
        el.loginBtn.textContent = 'Sign In';
    }
}

async function sendPrompt(event) {
    if (event) event.preventDefault();
    saveSettings();

    if (!state.token) {
        addMessage('system-msg', 'Please sign in first to use the AI copilot.');
        return;
    }

    const prompt = el.prompt.value.trim();
    if (!prompt || state.thinking) return;

    addMessage('user', prompt);
    el.prompt.value = '';
    el.prompt.style.height = 'auto';

    state.thinking = true;
    showThinking();

    const provider = el.provider.value;
    const model = el.model.value.trim();
    const apiKey = el.providerKey.value.trim();
    const baseUrl = el.baseUrl.value.trim();
    const systemPrompt = el.systemPrompt.value.trim();

    const payloadMessages = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...state.messages.filter(m => m.role === 'user' || m.role === 'assistant')
    ];

    try {
        const response = await fetch(`${el.apiUrl.value.trim()}/v1/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${state.token}`
            },
            body: JSON.stringify({
                provider,
                model: model || undefined,
                ...(apiKey ? { apiKey } : {}),
                ...(baseUrl ? { baseUrl } : {}),
                messages: payloadMessages,
                temperature: 0.5
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'AI request failed');

        hideThinking();
        addMessage('assistant', data.text || data.content || '[No response]');
    } catch (error) {
        hideThinking();
        addMessage('system-msg', `Error: ${error.message}`);
    } finally {
        state.thinking = false;
    }
}

// Auto-resize textarea
el.prompt.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
});

// Submit on Enter (not Shift+Enter)
el.prompt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendPrompt(null);
    }
});

// Event Listeners
el.loginBtn.addEventListener('click', login);
el.composer.addEventListener('submit', sendPrompt);
el.clearBtn.addEventListener('click', clearChat);
el.clearBtn2.addEventListener('click', clearChat);

['change', 'input'].forEach(eventName => {
    el.apiUrl.addEventListener(eventName, saveSettings);
    el.provider.addEventListener(eventName, saveSettings);
    el.model.addEventListener(eventName, saveSettings);
    el.baseUrl.addEventListener(eventName, saveSettings);
    el.systemPrompt.addEventListener(eventName, saveSettings);
});

// Init
updateModelBadge();
if (state.token) {
    setAuthState(true);
}

const appInfo = typeof window.desktopInfo !== 'undefined' ? window.desktopInfo : { appName: 'CareerOS Desktop' };
addMessage('system-msg', `${appInfo.appName || 'CareerOS Desktop'} ready. Sign in to start your AI-powered job search.`);
