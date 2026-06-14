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

const SHEET_COLUMNS = {
  NonTangibleAssets:  ['ID', 'Name', 'Type', 'Subtype', 'Currency', 'Institution', 'RetirementAccount', 'Notes'],
  AssetHistory:       ['ID', 'AssetID', 'Date', 'Value'],
  CDs:                ['ID', 'Name', 'Currency', 'Institution', 'StartDate', 'APY', 'FaceValue', 'MaturityDate', 'AutoRenew', 'Active', 'Notes'],
  TangibleAssets:     ['ID', 'Category', 'Name', 'Series', 'Author', 'Language', 'Format', 'Condition', 'BuyDate', 'Cost', 'CurrentValue', 'StillHave', 'Notes'],
  DigitalAssets:      ['ID', 'Category', 'Name', 'Series', 'Author', 'Language', 'Format', 'Condition', 'BuyDate', 'Cost', 'CurrentValue', 'StillHave', 'Notes'],
  CryptoAssets:       ['ID', 'Name', 'Ticker', 'Wallet', 'Staked', 'AutoRestake', 'StakingAPY', 'UnlockDate', 'Notes'],
  Budget:             ['ID', 'Name', 'Type', 'Category', 'Amount', 'Frequency', 'Active'],
  Donations:          ['ID', 'Year', 'Organization', 'Amount', 'Date', 'Notes'],
  FinancialGoals:     ['ID', 'Name', 'TargetAmount', 'TargetDate', 'LinkedAssetID', 'Status', 'Notes'],
  RetirementSchedule: ['ID', 'Source', 'AssetID', 'AccessibleYear', 'WithdrawalRate', 'ExpectedYearlyAmount', 'Notes'],
  RetirementHoldings: ['ID', 'AssetID', 'FundName', 'Ticker', 'Percentage', 'Notes'],
  FundAllocation:     ['ID', 'HoldingID', 'AssetClass', 'Percentage'],
  AssetGoals:         ['ID', 'AssetClass', 'Subclass', 'GoalPct'],
  Tasks:              ['ID', 'Name', 'Priority', 'DueDate', 'Notes'],
  ResearchLinks:      ['ID', 'Title', 'Category', 'Link', 'Notes'],
  LifetimeGoals:      ['ID', 'Goal', 'Category', 'Status', 'Progress', 'Notes'],
  EducationGoals:     ['ID', 'Order', 'Name', 'Type', 'Difficulty', 'Renewal', 'TargetDate', 'Done', 'Notes'],
  ReadingLog:         ['ID', 'Name', 'Author', 'ReadDate', 'Genre', 'Format', 'Rating', 'Notes'],
  GamingLog:          ['ID', 'Name', 'Platform', 'Status', 'CompletionDate', 'Genre', 'Rating', 'Notes'],
  FilmLog:            ['ID', 'Name', 'ReleaseYear', 'WatchDate', 'Rating', 'LetterboxdURI', 'Notes'],
  PersonalInfo:       ['ID', 'Name', 'Nickname', 'DateOfBirth', 'Notes'],
  PersonalContacts:  ['ID', 'Type', 'Label', 'Value', 'Primary', 'Notes'],
  Awards:             ['ID', 'Title', 'Category', 'Issuer', 'AwardDate', 'Notes'],
  Milestones:         ['ID', 'Title', 'Category', 'Date', 'Notes'],
  Contacts:              ['ID', 'Name', 'Relationship', 'Phone', 'Email', 'Social', 'Birthday', 'Favorite', 'Notes'],
  ProjectionSettings:    ['ID', 'Label', 'StartValue', 'GrowthRate', 'AnnualAdd', 'Notes'],
  Liabilities:           ['ID', 'Name', 'Type', 'Lender', 'Balance', 'InterestRate', 'MinPayment', 'AssetValue', 'Active', 'Notes'],
  CreditCardRewards:     ['ID', 'CardName', 'RewardProgram', 'Points', 'CentsPerPoint', 'ExpirationDate', 'Notes'],
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
    icon: path.join(__dirname, '../build/icon.ico'),
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

  ipcMain.handle('delete-row', async (_, { sheetName, rowIndex }) => {
    if (!currentFilePath) throw new Error('No Excel file is currently loaded')

    const ExcelJS = require('exceljs')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(currentFilePath)

    const sheet = workbook.getWorksheet(sheetName)
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`)

    sheet.spliceRows(rowIndex, 1)

    await workbook.xlsx.writeFile(currentFilePath)
    return { success: true }
  })

  ipcMain.handle('new-excel-file', async () => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Create New Finance Data File',
      defaultPath: 'finance-data.xlsx',
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
    })
    if (canceled || !filePath) return null

    const ExcelJS = require('exceljs')
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Finance Life Planning'
    workbook.created = new Date()

    for (const [sheetName, columns] of Object.entries(SHEET_COLUMNS)) {
      const sheet = workbook.addWorksheet(sheetName)

      const headerRow = sheet.addRow(columns)
      headerRow.font  = { bold: true, color: { argb: 'FFE2E8F0' } }
      headerRow.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
      headerRow.commit()

      columns.forEach((col, i) => {
        sheet.getColumn(i + 1).width = Math.max(col.length + 4, 14)
      })

      sheet.views = [{ state: 'frozen', ySplit: 1 }]
    }

    await workbook.xlsx.writeFile(filePath)

    currentFilePath = filePath
    const config = loadConfig()
    config.excelPath = filePath
    saveConfig(config)

    return filePath
  })

  ipcMain.handle('save-row', async (_, { sheetName, row, isNew }) => {
    if (!currentFilePath) throw new Error('No Excel file is currently loaded')

    const ExcelJS = require('exceljs')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(currentFilePath)

    let sheet = workbook.getWorksheet(sheetName)
    if (!sheet) {
      // Sheet missing — create it with the known column definitions
      const columns = SHEET_COLUMNS[sheetName]
      if (!columns) throw new Error(`Unknown sheet "${sheetName}"`)
      sheet = workbook.addWorksheet(sheetName)
      const headerRow = sheet.addRow(columns)
      headerRow.font = { bold: true, color: { argb: 'FFE2E8F0' } }
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
      headerRow.commit()
      columns.forEach((col, i) => { sheet.getColumn(i + 1).width = Math.max(col.length + 4, 14) })
      sheet.views = [{ state: 'frozen', ySplit: 1 }]
    }

    // Build column map: header name → column index
    const columnMap = {}
    sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colIndex) => {
      if (cell.value != null) columnMap[String(cell.value)] = colIndex
    })

    const colIndexToHeader = {}
    Object.entries(columnMap).forEach(([h, c]) => { colIndexToHeader[c] = h })

    // Add any columns from SHEET_COLUMNS that are missing from this sheet's header row
    const knownColumns = SHEET_COLUMNS[sheetName] || []
    let nextCol = Object.values(columnMap).length ? Math.max(...Object.values(columnMap)) + 1 : 1
    const headerRow1 = sheet.getRow(1)
    knownColumns.forEach(col => {
      if (!columnMap[col]) {
        headerRow1.getCell(nextCol).value = col
        headerRow1.getCell(nextCol).font = { bold: true }
        columnMap[col] = nextCol
        colIndexToHeader[nextCol] = col
        nextCol++
      }
    })
    headerRow1.commit()

    let maxCol = Object.values(columnMap).length ? Math.max(...Object.values(columnMap)) : 0

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
