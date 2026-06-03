const { app } = require('@azure/functions')
const { loadWorkbook, saveWorkbook, parseWorkbook, prepareValue, ensureSheet } = require('./shared/excel')

app.http('ping', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'ping',
  handler: async (req, context) => {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        hasConnectionString: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
        hasContainerName:    !!process.env.AZURE_STORAGE_CONTAINER_NAME,
        hasBlobName:         !!process.env.AZURE_STORAGE_BLOB_NAME,
      }),
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
      return { status: 500, body: JSON.stringify({ error: err.message }) }
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
      return { status: 500, body: JSON.stringify({ error: err.message }) }
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
      return { status: 500, body: JSON.stringify({ error: err.message }) }
    }
  },
})
