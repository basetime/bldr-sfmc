import chalk from 'chalk';

/**
 * Display a single line in the command-line
 * @param message
 * @param status success | error | info
 */
const displayLine = (message: string, status?: string) => {
    let statusOutput;
    switch (status) {
        case 'success':
            statusOutput = chalk.green;
            break;
        case 'error':
            statusOutput = chalk.red;
            break;
        case 'info':
            statusOutput = chalk.cyan;
            break;
        case 'progress':
            statusOutput = chalk.yellow;
            break;
        case 'warn':
            statusOutput = chalk.magenta;
            break;
        default:
            statusOutput = chalk.white;
    }
    console.log(statusOutput(message));
};

/**
 * Iterate through an object displaying `key: value`
 * @param object
 * @param status
 */
const displayObject = (object: any, status?: string) => {
    displayLine('---');
    for (const o in object) {
        if (typeof object[o] !== 'object') {
            displayLine(`${o} ${object[o]}`, status);
        }
    }
    displayLine(' ');
};

const displayArrayOfStrings = (array: string[], status?: string) => {
    displayLine('---');
    array.forEach((item) => displayLine(item, status));
    displayLine(' ');
};

export { displayLine, displayObject, displayArrayOfStrings };
