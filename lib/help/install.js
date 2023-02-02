const Column = require('../utils/help/Column');
const displayStyles = require('../utils/displayStyles');
const { styles, width } = displayStyles.init();

module.exports = [
    [
        new Column(` `, width.c1, '', `${styles.dim('-')}`),
        new Column(` `, width.c2, '', `${styles.dim('-')}`),
        new Column(` `, width.c3, '', `${styles.dim('-')}`),
    ],
    [new Column(`${styles.command('install')}`, width.c1), new Column(``, width.c2), new Column(``, width.c3)],
    [
        new Column(``, width.c1),
        new Column(`<GitHub Repository URL>`, width.c2),
        new Column(`Check for and download .package.manifest.json file`, width.c3),
    ],
];
