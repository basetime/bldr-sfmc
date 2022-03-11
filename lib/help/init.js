const cliFormat = require('cli-format')
const chalk = require('chalk')
const Column = require('../utils/help/Column')

const headers = require('./headers')
const contextHelp = require('./context')
const configHelp = require('./config')
const searchHelp = require('./search')
const cloneHelp = require('./clone')

module.exports.init = () => {
  
  const rows = [
    ...headers.rows(),
    ...configHelp.rows(),
    ...contextHelp.rows(),
    ...searchHelp.rows(),
    ...cloneHelp.rows()
  ]

  for (const r in rows) {
    console.log(cliFormat.columns.wrap(rows[r], { width: 500, paddingMiddle: ' | ' }))
  }

}

module.exports.invalidCommand = (req) => console.log(cliFormat.wrap(`${chalk.redBright(`\n\nError: Invalid Command: ${req} \n\n`)}`, { width: 500}))
