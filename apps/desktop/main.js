const { app, BrowserWindow, ipcMain, globalShortcut, session, screen, desktopCapturer } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

// Load .env.local from monorepo root
const envFile = path.join(__dirname, '../../.env.local');
if (fs.existsSync(envFile)) {
	fs.readFileSync(envFile, 'utf8').split('\n').forEach((line) => {
		const [key, ...rest] = line.trim().split('=');
		if (key && !key.startsWith('#') && !(key in process.env)) {
			process.env[key] = rest.join('=').trim();
		}
	});
}

let mainWindow = null;
let overlayWindow = null;

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 820,
		minWidth: 920,
		minHeight: 640,
		backgroundColor: '#0f1117',
		title: 'CareerOS Interview Copilot',
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false
		}
	});
	mainWindow.setContentProtection(true);
	mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
	mainWindow.on('closed', () => {
		mainWindow = null;
		overlayWindow?.close();
	});
}

function createOverlayWindow() {
	if (overlayWindow) { overlayWindow.show(); return; }
	const { width } = screen.getPrimaryDisplay().workAreaSize;
	overlayWindow = new BrowserWindow({
		width: 460,
		height: 600,
		x: width - 480,
		y: 40,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		skipTaskbar: true,
		resizable: true,
		minWidth: 340,
		minHeight: 200,
		hasShadow: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload-overlay.js'),
			contextIsolation: true,
			nodeIntegration: false
		}
	});
	// Makes window invisible to screen share / OBS / Zoom
	overlayWindow.setContentProtection(true);
	overlayWindow.loadFile(path.join(__dirname, 'renderer', 'overlay.html'));
	overlayWindow.on('closed', () => { overlayWindow = null; });
}

// ── IPC handlers ─────────────────────────────────────────────────────────────

ipcMain.on('open-overlay', () => createOverlayWindow());

ipcMain.on('close-overlay', () => {
	overlayWindow?.close();
	overlayWindow = null;
});

ipcMain.on('send-to-overlay', (_, data) => {
	overlayWindow?.webContents.send('ai-response', data);
});

// Screen capture — returns base64 JPEG of primary screen
ipcMain.handle('capture-screen', async () => {
	const sources = await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: { width: 1920, height: 1080 }
	});
	if (!sources.length) return null;
	return sources[0].thumbnail.toJPEG(85).toString('base64');
});

ipcMain.on('overlay-status', (_, data) => {
	overlayWindow?.webContents.send('status-update', data);
});

ipcMain.on('set-overlay-opacity', (_, opacity) => {
	overlayWindow?.setOpacity(Math.max(0.2, Math.min(1, opacity)));
});

ipcMain.on('overlay-move', (_, { dx, dy }) => {
	if (!overlayWindow) return;
	const [x, y] = overlayWindow.getPosition();
	overlayWindow.setPosition(x + dx, y + dy);
});

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
	session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
		callback(['media', 'microphone', 'audioCapture', 'display-capture'].includes(permission));
	});

	// Auto-select the primary screen for getDisplayMedia — no OS picker shown
	session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
		desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
			callback({ video: sources[0], audio: 'loopback' });
		}).catch(() => callback({}));
	});

	createMainWindow();

	// Ctrl+Shift+P → solve coding problem from screen
	globalShortcut.register('CommandOrControl+Shift+P', () => {
		mainWindow?.webContents.send('global-solve-screen');
	});

	// Ctrl+Shift+Space → trigger AI suggestion
	globalShortcut.register('CommandOrControl+Shift+Space', () => {
		mainWindow?.webContents.send('global-trigger');
	});

	// Ctrl+Shift+H → toggle overlay
	globalShortcut.register('CommandOrControl+Shift+H', () => {
		if (!overlayWindow) { createOverlayWindow(); return; }
		if (overlayWindow.isVisible()) overlayWindow.hide();
		else overlayWindow.show();
	});

	// Ctrl+Shift+C → clear transcript
	globalShortcut.register('CommandOrControl+Shift+C', () => {
		mainWindow?.webContents.send('global-clear');
	});

	app.on('activate', () => { if (!mainWindow) createMainWindow(); });
});

app.on('window-all-closed', () => {
	globalShortcut.unregisterAll();
	if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => globalShortcut.unregisterAll());
