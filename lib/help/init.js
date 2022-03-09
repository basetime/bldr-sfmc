const cliFormat = require('cli-format')
const chalk = require('chalk')
const Column = require('../utils/help/Column')

const headers = require('./headers')
const configHelp = require('./config')
const searchHelp = require('./search')
const cloneHelp = require('./clone')

module.exports.init = () => {

  const rows = [
    ...headers.rows(),
    ...configHelp.rows(),
    ...searchHelp.rows(),
    ...cloneHelp.rows()
  ]

  for (const r in rows) {
    console.log(cliFormat.columns.wrap(rows[r], { width: 500, paddingMiddle: ' | ' }))
  }

}


module.exports.invalidCommand = () => console.log(cliFormat.wrap(`${chalk.redBright('\n\nError: Invalid Command\n\n')}`, { width: 500}))
