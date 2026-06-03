const { loadWorkbook, saveWorkbook, prepareValue, ensureSheet } = require('../shared/excel')

module.exports = async function (context, req) {
  const { sheetName, row, isNew } = req.body || {}

  if (!sheetName || !row) {
    context.res = { status: 400, body: JSON.stringify({ error: 'sheetName and row are required' }) }
    return
  }

  try {
    const workbook = await loadWorkbook()
    const { sheet, columnMap, colIndexToHeader, maxCol } = ensureSheet(workbook, sheetName)

    const { _rowIndex, ...cleanRow } = row

    if (isNew) {
      // Auto-assign numeric ID
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
        context.res = { status: 400, body: JSON.stringify({ error: 'No _rowIndex provided for edit' }) }
        return
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
    context.res = { status: 200, body: JSON.stringify({ success: true }) }
  } catch (err) {
    context.log.error('save-row error:', err.message)
    context.res = { status: 500, body: JSON.stringify({ error: err.message }) }
  }
}
