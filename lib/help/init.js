const cliFormat = require('cli-format');
const chalk = require('chalk');

const headers = require('./headers');
const contextHelp = require('./context');
const initiateHelp = require('./initiate');
const installHelp = require('./install');
const packageHelp = require('./package');
const deployHelp = require('./deploy');
const configHelp = require('./config');
const statusHelp = require('./status');
const stashHelp = require('./stash');
const searchHelp = require('./search');
const cloneHelp = require('./clone');
const addHelp = require('./add');
const pushHelp = require('./push');

/**
 * Handles all content for -h help command
 * Sections are separated into separate folders and iterated through in the rows Array
 * Rows Array passed into a single display loop to be formatted accordingly
 */
module.exports.init = () => {
    const rows = [
        ...headers,
        ...configHelp,
        ...statusHelp,
        ...stashHelp,
        ...initiateHelp,
        ...addHelp,
        ...pushHelp,
        ...packageHelp,
        ...installHelp,
        ...deployHelp,
        ...contextHelp,
        ...searchHelp,
        ...cloneHelp,
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
    console.log(cliFormat.wrap(`${chalk.redBright(`\n\nError: Invalid Command: ${req} \n`)}`, { width: 500 }));
