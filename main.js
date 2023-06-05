const { log } = require('console');
const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
const fs = require('fs');
// const sharp = require('sharp');
const path = require('path')

let mainWindow;
const configPath = path.join(app.getPath('userData'), 'config.json');
let configData = {};

// Функция сохранения файла конфигурации
function saveConfig() {
  fs.writeFile(configPath, JSON.stringify(configData), (err) => {
    if (err) {
      console.error('Ошибка при сохранении файла конфигурации:', err);
    } else {
      console.log(`Файл конфигурации успешно сохранен. -> ${configPath}`);
    }
  });
}

// Функция сохранения файла конфигурации
function loadConfig() {
  fs.readFile(configPath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Ошибка при загрузке файла конфигурации:', err);
    } else {
      
      try {
        configData = JSON.parse(data);
        console.log('Файл конфигурации успешно загружен.');
      } catch (err) {
        // Обработка ошибки парсинга JSON
        console.error(err);
      }
    }
  });
}

// run this as early in the main process as possible
// if (require('electron-squirrel-startup')) app.quit();

// function pathChecker() {

// }
// // https://sharp.pixelplumbing.com/
// async function loadImage() {
//   if (!pathChecker) console.log('Path not available.')
//   const inputPath = dialog.showOpenDialogSync(mainWindow, options)
//   try {
//     await sharp(inputPath).avif().toFile(outputPath);
//     console.log('Image converted to AVIF successfully!');
//   } catch (error) {
//     console.error('Error converting image to AVIF:', error);
//   }
// }

function chooseNoteFile() {
  // если конфиг пустой, то выбрать файл
  const choosenFile = dialog.showOpenDialogSync(mainWindow, {
    buttonLabel: 'Выбрать файл',
    filters: [
      { name: 'txt', extensions: ['txt'] }
    ],
    properties: ['openFile', 'promptToCreate'],
    title: 'Выберите файл c заметками'
  });
  // если файл выбран, то добавить его в конфиг
  if (choosenFile) {
    configData["pathToNotes"] = choosenFile[0];
  } else {
    // если файл не был выбран, то открыть сообщение о том, что приложение закрывается
    dialog.showMessageBoxSync({
      type: 'info',
      title: 'Alert',
      message: 'Путь к заметкам не был предоставлен. Приложение будет закрыто.',
      buttons: ['OK']
    });
    app.quit();
  }
};

function loadNotesAndSend() {
  if (!configData["pathToNotes"]) {
    chooseNoteFile()
  } else {
    fs.access(configData["pathToNotes"], fs.constants.F_OK, (err) => {
      if (err) {
        console.error('Файл не существует');
        configData["pathToNotes"] = undefined;
        chooseNoteFile()
      } else {
        console.log('Файл существует');
      }
    });
  }
  
  if (configData["pathToNotes"]) {
    console.log(configData["pathToNotes"]);
    mainWindow.webContents.send('get-path-to-notes', configData["pathToNotes"]);

    // в случае улспешной записи пути до файла в конфиг, загрузить этот файл
    fs.readFile(configData["pathToNotes"], 'utf-8', (err, data) => {
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
};

function saveNotes(event, content) {
  if (content.request != "save") return;

  const notes = content.data;
  
  if (configData.pathToNotes) {
      fs.writeFile(configData.pathToNotes, JSON.stringify(notes), (err) => {
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
    height: 5000,
    width: 5000,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
    }
  });

  loadConfig();
  mainWindow.loadFile('index.html');
  mainWindow.webContents.on('did-finish-load', loadNotesAndSend);

  mainWindow.on('close', function () {
    saveConfig();
  })

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });

});

ipcMain.on('show-form', (event, position) => {
  event.reply('form-show-request', position);
});

ipcMain.on('notes-data', saveNotes);

ipcMain.on('send-path-to-notes', (event, newPathToNotes) => {
  configData["pathToNotes"] = newPathToNotes;
  loadNotesAndSend()
  new Notification({
    title: 'Файл был загружен',
    body: `Файл ${newPathToNotes} был загружен.`
  }).show();
  
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});