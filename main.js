const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path')

// run this as early in the main process as possible
// if (require('electron-squirrel-startup')) app.quit();

let mainWindow;

function pathChecker() {

}


// https://sharp.pixelplumbing.com/
async function loadImage() {
  if (!pathChecker) console.log('Path not available.')
  const inputPath = dialog.showOpenDialogSync(mainWindow, options)
  try {
    await sharp(inputPath).avif().toFile(outputPath);
    console.log('Image converted to AVIF successfully!');
  } catch (error) {
    console.error('Error converting image to AVIF:', error);
  }
}

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
    height: 1080,
    width: 1920,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('did-finish-load', loadNotesAndSend);

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