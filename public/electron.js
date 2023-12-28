const electron = require("electron");
const path = require("path");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

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
      resizable: false,
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
app.on("ready", createWindow);