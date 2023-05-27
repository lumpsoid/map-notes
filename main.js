const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path')

let mainWindow;

function loadNotesAndSend() {
  const notesFile = path.join(__dirname, 'notes.json')
  
  fs.readFile(notesFile, 'utf-8', (err, data) => {
    if (err) {
      // Обработка ошибки чтения файла
      console.error(err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      
      // Отправляем данные в Renderer процесс
      mainWindow.webContents.send('load-file', jsonData);
    } catch (err) {
      // Обработка ошибки парсинга JSON
      console.error(err);
    }
  });
};

function saveNotes(event, content) {
  console.log('here')
  if (content.request != "save") return;
  console.log('or here')
  const notes = content.data;
  const notesFile = path.join(__dirname, 'notes.json')
  if (notesFile) {
      fs.writeFile(notesFile, JSON.stringify(notes), (err) => {
          if (err) {
            console.log(err);
            event.reply('notes-data-reply', { success: false, error: err });
          } else {
              event.reply('notes-data-reply', { success: true });
          }
      });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('did-finish-load', loadNotesAndSend);

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

ipcMain.on('show-form', (event, position) => {
  event.reply('form-show-request', position);
});

ipcMain.on('notes-data', saveNotes);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})