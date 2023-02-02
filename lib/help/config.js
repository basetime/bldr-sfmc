const Column = require('../utils/help/Column');
const displayStyles = require('../utils/displayStyles');
const { styles, width } = displayStyles.init();

module.exports = [
    [
        new Column(` `, width.c1, '', `${styles.dim('-')}`),
        new Column(` `, width.c2, '', `${styles.dim('-')}`),
        new Column(` `, width.c3, '', `${styles.dim('-')}`),
    ],
    [new Column(`${styles.command('config')}`, width.c1), new Column(``, width.c2), new Column(``, width.c3)],
    [new Column(``, width.c1), new Column(`-n, --new`, width.c2), new Column(`Create New Configuration`, width.c3)],
    [
        new Column(``, width.c1),
        new Column(`<instance name>`, width.c2),
        new Column(`Show Configuration for an instance`, width.c3),
    ],
    [new Column(``, width.c1), new Column(`-l, --list`, width.c2), new Column(`List All Configurations`, width.c3)],
    [
        new Column(``, width.c1),
        new Column(`-s, --set <instance name>`, width.c2),
        new Column(`Set a Configuration to Use`, width.c3),
    ],
    [
        new Column(``, width.c1),
        new Column(`  ${styles.dim('>>')}  -m, --mid <mid id>`, width.c2),
        new Column(`Set Target MID ${styles.detail('optional')}`, width.c3),
    ],
    [
        new Column(``, width.c1),
        new Column(`-r, --remove <instance name>`, width.c2),
        new Column(`Remove a Stored Configuration`, width.c3),
    ],
];
