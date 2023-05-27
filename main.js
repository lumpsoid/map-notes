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
  if (content.request != "save") return;
  const notes = content.data;
  const notesFile = path.join(__dirname, 'notes.json')
  if (notesFile) {
      fs.writeFile(notesFile, JSON.stringify(notes), (err) => {
          if (err) console.log(err);
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

  mainWindow.webContents.on('did-finish-load', loadNotesAndSend); // проверено триггерится

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

ipcMain.on('notes-data', (event, content) => {
  if (content.request == "data") {
    notes = content.data;
  } else {
    console.log('Something wrong with notes-data get.');
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})