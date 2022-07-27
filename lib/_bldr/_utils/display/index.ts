import chalk from "chalk";

/**
 *
 * @param message
 * @param status success | error | info
 */
const displayLine = (message: string, status?: string) => {

    let statusOutput
    switch(status){
        case 'success':
            statusOutput = chalk.green;
        break;
        case 'error':
            statusOutput = chalk.red;
        break;
        case 'info':
            statusOutput = chalk.cyan;
        break;
        default:
            statusOutput = chalk.white
    }

    console.log(
        statusOutput(message)
    )
}


export {
    displayLine
}
