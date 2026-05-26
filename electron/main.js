const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = !app.isPackaged

function getConfigPath() {
  return path.join(app.getPath('userData'), 'config.json')
}

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(getConfigPath(), 'utf8'))
  } catch {
    return {}
  }
}

function saveConfig(config) {
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf8')
}

async function loadExcelFile(filePath) {
  const ExcelJS = require('exceljs')
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)

  const result = {}
  workbook.worksheets.forEach(sheet => {
    const rows = []
    let headers = []
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        headers = []
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          headers[colNumber - 1] = cell.value != null ? String(cell.value) : ''
        })
      } else {
        const obj = {}
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber - 1]
          if (header) obj[header] = cell.value
        })
        if (Object.keys(obj).length > 0) rows.push(obj)
      }
    })
    result[sheet.name] = rows
  })
  return result
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle('get-config', () => loadConfig())

  ipcMain.handle('save-config', (_, config) => {
    saveConfig(config)
    return true
  })

  ipcMain.handle('pick-excel-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select Excel Data File',
      filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
      properties: ['openFile'],
    })
    if (canceled) return null
    const filePath = filePaths[0]
    const config = loadConfig()
    config.excelPath = filePath
    saveConfig(config)
    return filePath
  })

  ipcMain.handle('load-excel', async (_, filePath) => {
    try {
      return await loadExcelFile(filePath)
    } catch (err) {
      throw new Error(`Failed to load Excel file: ${err.message}`)
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
