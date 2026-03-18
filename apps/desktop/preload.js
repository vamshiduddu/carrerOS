const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktopInfo', {
    appName: 'CareerOS Desktop Copilot',
    version: '0.1.0'
});
