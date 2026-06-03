const { loadWorkbook, saveWorkbook } = require('../shared/excel')

module.exports = async function (context, req) {
  const { sheetName, rowIndex } = req.body || {}

  if (!sheetName || !rowIndex) {
    context.res = { status: 400, body: JSON.stringify({ error: 'sheetName and rowIndex are required' }) }
    return
  }

  try {
    const workbook = await loadWorkbook()
    const sheet    = workbook.getWorksheet(sheetName)

    if (!sheet) {
      context.res = { status: 404, body: JSON.stringify({ error: `Sheet "${sheetName}" not found` }) }
      return
    }

    sheet.spliceRows(rowIndex, 1)
    await saveWorkbook(workbook)
    context.res = { status: 200, body: JSON.stringify({ success: true }) }
  } catch (err) {
    context.log.error('delete-row error:', err.message)
    context.res = { status: 500, body: JSON.stringify({ error: err.message }) }
  }
}
