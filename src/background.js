/* global __static */

"use strict";

import { autoUpdater } from "electron-updater";
import { app, protocol, dialog, Menu, BrowserWindow, shell } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import Store from "electron-store";
import path from "path";

const isDevelopment = process.env.NODE_ENV !== "production";
const store = new Store();
const appName = "TarDrop";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let win;

const aboutMenu = [
  {
    label: "About",
    accelerator: "CommandOrControl+I",
    click: () => {
      dialog
        .showMessageBox(win, {
          type: "info",
          title: `About ${appName}`,
          message: appName,
          detail: `Version: ${app.getVersion()}-${process.platform}`,
          icon: path.join(__static, "img/icons/android-chrome-192x192.png"),
          buttons: ["GitHub page", "Close"],
        })
        .then((box) => {
          if (box.response === 0) {
            // Open GitHub page
            shell.openExternal(process.env.VUE_APP_GITHUB_PAGE);
          }
        })
        .catch((err) => {
          if (isDevelopment) console.error(err);
        });
    },
  },
];

let menuTemplate = [
  {
    label: "Window",
    submenu: [
      {
        label: "Reload",
        role: "reload",
      },
      {
        label: "Force reload",
        role: "forceReload",
      },
      {
        type: "separator",
      },
      {
        label: `Quit ${appName}`,
        role: "quit",
      },
    ],
  },
  {
    label: "Help",
    submenu: aboutMenu,
  },
];

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: store.get("app_width") || 1050,
    height: store.get("app_height") || 760,
    title: appName,
    icon: path.join(__static, "icon.png"),
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      nodeIntegrationInWorker: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      nativeWindowOpen: true,
    },
  });

  // Use the custom title
  win.on("page-title-updated", (event) => event.preventDefault());

  // Catch window resizing for storing the information
  win.on("resize", () => {
    const size = win.getSize();

    // Save to local storage
    store.set("app_width", size[0]);
    store.set("app_height", size[1]);
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");

    // Verify if the app can be updated.
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
