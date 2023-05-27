const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["save-note", 'show-form'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, data) => {
            let validChannels = ["save-note-reply", 'form-show-request'];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, data);
            }
        }
    }
);
