const { loadWorkbook, parseWorkbook } = require('../shared/excel')

module.exports = async function (context, req) {
  try {
    const workbook = await loadWorkbook()
    const data     = parseWorkbook(workbook)
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  } catch (err) {
    context.log.error('load-excel error:', err.message)
    context.res = {
      status: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
