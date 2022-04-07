const cliFormat = require('cli-format');
const chalk = require('chalk');

const headers = require('./headers');
const contextHelp = require('./context');
const configHelp = require('./config');
const searchHelp = require('./search');
const cloneHelp = require('./clone');
const addHelp = require('./add');
const pushHelp = require('./push');

module.exports.init = () => {
    const rows = [
        ...headers,
        ...configHelp,
        ...contextHelp,
        ...searchHelp,
        ...cloneHelp,
        ...addHelp,
        ...pushHelp,
    ];

    for (const r in rows) {
        console.log(
            cliFormat.columns.wrap(rows[r], {
                width: 500,
                paddingMiddle: ' | ',
            })
        );
    }
};

module.exports.invalidCommand = (req) =>
    console.log(
        cliFormat.wrap(
            `${chalk.redBright(`\n\nError: Invalid Command: ${req} \n`)}`,
            { width: 500 }
        )
    );
