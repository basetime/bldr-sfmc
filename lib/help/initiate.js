const Column = require('../utils/help/Column');
const displayStyles = require('../utils/displayStyles');
const { styles, width } = displayStyles.init();

module.exports = [
    [
        new Column(` `, width.c1, '', `${styles.dim('-')}`),
        new Column(` `, width.c2, '', `${styles.dim('-')}`),
        new Column(` `, width.c3, '', `${styles.dim('-')}`),
    ],
    [new Column(`${styles.command('init')}`, width.c1), new Column(``, width.c2), new Column(``, width.c3)],
    [
        new Column(``, width.c1),
        new Column(`--cb`, width.c2),
        new Column(`Initiate project folder for Content Builder`, width.c3),
    ],
    [
        new Column(``, width.c1),
        new Column(`--config-only`, width.c2),
        new Column(`Setup configuration file for project`, width.c3),
    ],
    [
        new Column(``, width.c1),
        new Column(`--update-config-keys`, width.c2),
        new Column(`Update ${styles.detail('.sfmc.config.json')} keys found in content`, width.c3),
    ],
];
