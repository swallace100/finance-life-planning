const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = !app.isPackaged

let currentFilePath = null

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

// Convert "YYYY-MM-DD" strings to Date objects so Excel stores them as dates
function prepareValue(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(value + 'T00:00:00')
    return isNaN(d.getTime()) ? value : d
  }
  return value
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
        if (Object.keys(obj).length > 0) {
          obj._rowIndex = rowNumber
          rows.push(obj)
        }
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
    currentFilePath = filePath
    const config = loadConfig()
    config.excelPath = filePath
    saveConfig(config)
    return filePath
  })

  ipcMain.handle('load-excel', async (_, filePath) => {
    try {
      currentFilePath = filePath
      return await loadExcelFile(filePath)
    } catch (err) {
      throw new Error(`Failed to load Excel file: ${err.message}`)
    }
  })

  ipcMain.handle('save-row', async (_, { sheetName, row, isNew }) => {
    if (!currentFilePath) throw new Error('No Excel file is currently loaded')

    const ExcelJS = require('exceljs')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(currentFilePath)

    const sheet = workbook.getWorksheet(sheetName)
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`)

    // Build column map: header name → column index
    const columnMap = {}
    sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colIndex) => {
      if (cell.value != null) columnMap[String(cell.value)] = colIndex
    })

    const colIndexToHeader = {}
    Object.entries(columnMap).forEach(([h, c]) => { colIndexToHeader[c] = h })
    const maxCol = Object.values(columnMap).length ? Math.max(...Object.values(columnMap)) : 0

    // Strip internal tracking fields before writing
    const { _rowIndex, ...cleanRow } = row

    if (isNew) {
      // Auto-assign numeric ID if the sheet has an ID column
      if (columnMap['ID']) {
        let maxId = 0
        sheet.eachRow((r, i) => {
          if (i === 1) return
          const id = r.getCell(columnMap['ID']).value
          if (typeof id === 'number' && id > maxId) maxId = id
        })
        cleanRow.ID = maxId + 1
      }

      const values = []
      for (let c = 1; c <= maxCol; c++) {
        const header = colIndexToHeader[c]
        const value = header && cleanRow[header] !== undefined ? cleanRow[header] : null
        values.push(prepareValue(value))
      }
      sheet.addRow(values)
    } else {
      if (!_rowIndex) throw new Error('No _rowIndex provided for edit operation')
      const targetRow = sheet.getRow(_rowIndex)
      Object.entries(columnMap).forEach(([header, colIndex]) => {
        if (header === 'ID') return
        if (cleanRow[header] !== undefined) {
          targetRow.getCell(colIndex).value = prepareValue(cleanRow[header])
        }
      })
      targetRow.commit()
    }

    await workbook.xlsx.writeFile(currentFilePath)
    return { success: true }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
