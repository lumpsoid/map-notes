const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path')

let mainWindow;

function saveNote (event, note) {
    const filePath = dialog.showSaveDialogSync(mainWindow, {
        defaultPath: 'notes.json',
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ]
      });

    if (filePath) {
        fs.writeFile(filePath, JSON.stringify(note), (err) => {
            if (err) {
                console.error(err);
                event.reply('save-note-reply', { success: false, error: err });
            } else {
                event.reply('save-note-reply', { success: true });
            }
        });
    }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

ipcMain.on('save-note', saveNote);

ipcMain.on('show-form', (event, position) => {
  event.reply('form-show-request', position);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

