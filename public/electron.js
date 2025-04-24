const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const tempDir = path.join(os.tmpdir(), 'src/views');
const fs = require('fs');

let mainWindow;
let memoryStore = {};

function removeLastFolderName(path) {
  if (path.endsWith('build')) {
      return path.slice(0, -'build'.length);
  }
  if (path.endsWith('public')) {
      return path.slice(0, -'public'.length);
  }
  if (path.endsWith('src')) {
    return path.slice(0, -'src'.length);
  }
  if (path.endsWith('assests')) {
    return path.slice(0, -'assests'.length);
  }
  return path;
}

function createWindow() {
  const windowParams = {
    width: 1280,
    height: 720,
    useContentSize: true,
    depthOfField: 150,
    camera_distance: 30,
    camera_height: 150,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    autoHideMenuBar: true,
    fullscreen: false,
    resizable: true,
    webSecurity: false
  };
  // Create the browser window.
  mainWindow = new BrowserWindow(windowParams);
  // and load the index.html of the app.
  console.log(__dirname);
  //mainWindow.loadURL('http://localhost:3000');
  mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
  
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  memoryStore.mainFolder = removeLastFolderName(__dirname);
  createWindow();
});

ipcMain.on('load-data', (event) => {
  event.returnValue = memoryStore; // Szinkron adatküldés
});

/**
 * Checks if the application is running from an asar archive.
 * @return {boolean} True if running from an asar archive, otherwise false.
 */
function isRunningInAsar() {
  return __dirname.includes('app.asar');
}

// /**
//  * Make Temp directores for the game.
//  */
// function extractAsarToTemp() {
//   if (isRunningInAsar() && !fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
//     asar.extractAll(path.join(path.dirname(process.execPath), 'resources', 'app.asar'), tempDir);
//   }
// }

//extractAsarToTemp();
