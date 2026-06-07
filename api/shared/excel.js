const { BlobServiceClient } = require('@azure/storage-blob')
const ExcelJS = require('exceljs')

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
  PersonalInfo:       ['ID', 'Name', 'Nickname', 'DateOfBirth', 'Phone', 'Email', 'Website', 'LinkedIn', 'GitHub', 'Address', 'City', 'State', 'Country', 'Notes'],
  Awards:             ['ID', 'Title', 'Category', 'Issuer', 'AwardDate', 'Notes'],
  Milestones:         ['ID', 'Title', 'Category', 'Date', 'Notes'],
  Contacts:              ['ID', 'Name', 'Relationship', 'Phone', 'Email', 'Social', 'Birthday', 'Favorite', 'Notes'],
  ProjectionSettings:    ['ID', 'Label', 'StartValue', 'GrowthRate', 'AnnualAdd', 'Notes'],
}

function getBlobClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  const containerName    = process.env.AZURE_STORAGE_CONTAINER_NAME || 'finance-data'
  const blobName         = process.env.AZURE_STORAGE_BLOB_NAME      || 'finance-data.xlsx'
  const serviceClient    = BlobServiceClient.fromConnectionString(connectionString)
  return serviceClient.getContainerClient(containerName).getBlockBlobClient(blobName)
}

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    readableStream.on('data', d => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)))
    readableStream.on('end',  () => resolve(Buffer.concat(chunks)))
    readableStream.on('error', reject)
  })
}

async function loadWorkbook() {
  const client   = getBlobClient()
  const download = await client.download()
  const buffer   = await streamToBuffer(download.readableStreamBody)
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  return workbook
}

async function saveWorkbook(workbook) {
  const client = getBlobClient()
  const buffer = await workbook.xlsx.writeBuffer()
  await client.upload(buffer, buffer.length, { overwrite: true })
}

function parseWorkbook(workbook) {
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

function prepareValue(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(value + 'T00:00:00')
    return isNaN(d.getTime()) ? value : d
  }
  return value
}

// Ensures a sheet exists and has all expected columns; returns { sheet, columnMap, colIndexToHeader, maxCol }
function ensureSheet(workbook, sheetName) {
  let sheet = workbook.getWorksheet(sheetName)
  const columns = SHEET_COLUMNS[sheetName]
  if (!columns) throw new Error(`Unknown sheet "${sheetName}"`)

  if (!sheet) {
    sheet = workbook.addWorksheet(sheetName)
    const headerRow = sheet.addRow(columns)
    headerRow.font = { bold: true, color: { argb: 'FFE2E8F0' } }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
    headerRow.commit()
    columns.forEach((col, i) => { sheet.getColumn(i + 1).width = Math.max(col.length + 4, 14) })
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
  }

  // Build column map from existing header row
  const columnMap = {}
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colIndex) => {
    if (cell.value != null) columnMap[String(cell.value)] = colIndex
  })
  const colIndexToHeader = Object.fromEntries(Object.entries(columnMap).map(([h, c]) => [c, h]))

  // Add any missing columns
  let nextCol = Object.values(columnMap).length ? Math.max(...Object.values(columnMap)) + 1 : 1
  const headerRow1 = sheet.getRow(1)
  columns.forEach(col => {
    if (!columnMap[col]) {
      headerRow1.getCell(nextCol).value = col
      headerRow1.getCell(nextCol).font  = { bold: true }
      columnMap[col]         = nextCol
      colIndexToHeader[nextCol] = col
      nextCol++
    }
  })
  headerRow1.commit()

  const maxCol = Object.values(columnMap).length ? Math.max(...Object.values(columnMap)) : 0
  return { sheet, columnMap, colIndexToHeader, maxCol }
}

module.exports = { loadWorkbook, saveWorkbook, parseWorkbook, prepareValue, ensureSheet, SHEET_COLUMNS }
