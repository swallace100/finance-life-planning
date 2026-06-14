const { app } = require('@azure/functions')
const ExcelJS = require('exceljs')
const { loadWorkbook, saveWorkbook, uploadBuffer, parseWorkbook, prepareValue, ensureSheet } = require('./shared/excel')

app.http('download-excel', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'download-excel',
  handler: async (req, context) => {
    try {
      const workbook = await loadWorkbook()
      const buffer   = await workbook.xlsx.writeBuffer()
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="finance-data.xlsx"',
        },
        body: buffer,
      }
    } catch (err) {
      context.error('download-excel:', err.message)
      return { status: 500, body: JSON.stringify({ error: 'Failed to download file' }) }
    }
  },
})

app.http('upload-excel', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'upload-excel',
  handler: async (req, context) => {
    try {
      const buffer = Buffer.from(await req.arrayBuffer())
      if (!buffer.length) {
        return { status: 400, body: JSON.stringify({ error: 'Empty file' }) }
      }
      // Validate it parses as a workbook before overwriting the blob
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)
      await uploadBuffer(buffer)
      const data = parseWorkbook(workbook)
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    } catch (err) {
      context.error('upload-excel:', err.message)
      return { status: 400, body: JSON.stringify({ error: 'Invalid file — upload a valid .xlsx workbook' }) }
    }
  },
})

app.http('ping', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'ping',
  handler: async (req, context) => {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    }
  },
})

app.http('load-excel', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'load-excel',
  handler: async (req, context) => {
    try {
      const workbook = await loadWorkbook()
      const data     = parseWorkbook(workbook)
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    } catch (err) {
      context.error('load-excel:', err.message)
      return { status: 500, body: JSON.stringify({ error: 'Failed to load data' }) }
    }
  },
})

app.http('save-row', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'save-row',
  handler: async (req, context) => {
    const { sheetName, row, isNew } = await req.json()

    if (!sheetName || !row) {
      return { status: 400, body: JSON.stringify({ error: 'sheetName and row are required' }) }
    }

    try {
      const workbook = await loadWorkbook()
      const { sheet, columnMap, colIndexToHeader, maxCol } = ensureSheet(workbook, sheetName)
      const { _rowIndex, ...cleanRow } = row

      if (isNew) {
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
          values.push(header && cleanRow[header] !== undefined ? prepareValue(cleanRow[header]) : null)
        }
        sheet.addRow(values)
      } else {
        if (!_rowIndex) {
          return { status: 400, body: JSON.stringify({ error: 'No _rowIndex provided for edit' }) }
        }
        const targetRow = sheet.getRow(_rowIndex)
        Object.entries(columnMap).forEach(([header, colIndex]) => {
          if (header === 'ID') return
          if (cleanRow[header] !== undefined) {
            targetRow.getCell(colIndex).value = prepareValue(cleanRow[header])
          }
        })
        targetRow.commit()
      }

      await saveWorkbook(workbook)
      return { status: 200, body: JSON.stringify({ success: true }) }
    } catch (err) {
      context.error('save-row:', err.message)
      return { status: 500, body: JSON.stringify({ error: 'Failed to save row' }) }
    }
  },
})

app.http('delete-row', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'delete-row',
  handler: async (req, context) => {
    const { sheetName, rowIndex } = await req.json()

    if (!sheetName || !rowIndex) {
      return { status: 400, body: JSON.stringify({ error: 'sheetName and rowIndex are required' }) }
    }

    try {
      const workbook = await loadWorkbook()
      const sheet    = workbook.getWorksheet(sheetName)
      if (!sheet) {
        return { status: 404, body: JSON.stringify({ error: `Sheet "${sheetName}" not found` }) }
      }
      sheet.spliceRows(rowIndex, 1)
      await saveWorkbook(workbook)
      return { status: 200, body: JSON.stringify({ success: true }) }
    } catch (err) {
      context.error('delete-row:', err.message)
      return { status: 500, body: JSON.stringify({ error: 'Failed to delete row' }) }
    }
  },
})
