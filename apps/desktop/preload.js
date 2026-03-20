const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bridge', {
	appName: 'CareerOS Interview Copilot',
	version: '0.2.0',
	deepgramKey: process.env.DEEPGRAM_API_KEY || '',
	apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',

	openOverlay: () => ipcRenderer.send('open-overlay'),
	closeOverlay: () => ipcRenderer.send('close-overlay'),
	setOverlayOpacity: (opacity) => ipcRenderer.send('set-overlay-opacity', opacity),
	sendToOverlay: (data) => ipcRenderer.send('send-to-overlay', data),
	sendOverlayStatus: (data) => ipcRenderer.send('overlay-status', data),

	captureScreen: () => ipcRenderer.invoke('capture-screen'),
	onGlobalTrigger: (cb) => ipcRenderer.on('global-trigger', () => cb()),
	onGlobalClear: (cb) => ipcRenderer.on('global-clear', () => cb()),
	onGlobalSolveScreen: (cb) => ipcRenderer.on('global-solve-screen', () => cb()),
});
