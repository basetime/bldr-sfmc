const chalk = require('chalk');
const cliFormat = require('cli-format');
const Column = require('./help/Column');

module.exports.init = () => {
    return {
        styles: {
            header: chalk.bold,
            command: chalk.green,
            dim: chalk.dim,
            detail: chalk.cyan,
            callout: chalk.yellow,
            error: chalk.red,
        },
        width: {
            c0: 10,
            c1: 15,
            c2: 30,
            c3: 80,
            c4: 120,
        },
    };
};

module.exports.render = (headers, displayContent) => {
    const { styles } = this.init();

    let display;
    if (headers) {
        const spacers = [];
        for (const h in headers) {
            spacers.push(new Column(` `, headers[h].width, '', `${styles.dim('-')}`));
        }

        display = [[...headers], [...spacers], ...displayContent];
        for (const d in display) {
            console.log(
                cliFormat.columns.wrap(display[d], {
                    width: 500,
                    paddingMiddle: ' | ',
                })
            );
        }
    } else {
        console.log(displayContent);
    }
};
