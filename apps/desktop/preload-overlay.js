const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlay', {
	onAiResponse: (cb) => ipcRenderer.on('ai-response', (_, data) => cb(data)),
	onStatusUpdate: (cb) => ipcRenderer.on('status-update', (_, data) => cb(data)),
	close: () => ipcRenderer.send('close-overlay'),
	move: (dx, dy) => ipcRenderer.send('overlay-move', { dx, dy }),
});
