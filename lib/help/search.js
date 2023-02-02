const Column = require('../utils/help/Column');
const config = require('../utils/displayStyles');
const { styles, width } = config.init();

module.exports = [
    [
        new Column(` `, width.c1, '', `${styles.dim('-')}`),
        new Column(` `, width.c2, '', `${styles.dim('-')}`),
        new Column(` `, width.c3, '', `${styles.dim('-')}`),
    ],
    [new Column(`${styles.command('search')}`, width.c1), new Column(``, width.c2), new Column(``, width.c3)],
    [new Column(``, width.c1), new Column(`${styles.detail('--cb, --as')}`, width.c2), new Column(``, width.c3)],
    [
        new Column(``, width.c1),
        new Column(`  -f, --folder`, width.c2),
        new Column(`Search for a Folder by Name`, width.c3),
    ],
    [
        new Column(``, width.c1),
        new Column(`  -a, --asset`, width.c2),
        new Column(`Search for an Asset by Name`, width.c3),
    ],
    [new Column(``, width.c1), new Column(`${styles.detail('--as')}`, width.c2), new Column(``, width.c3)],
    [
        new Column(``, width.c1),
        new Column(`  --sql, --query`, width.c2),
        new Column(`Search for a SQL Query by Name`, width.c3),
    ],
    [
        new Column(``, width.c1),
        new Column(`  --ssjs, --script`, width.c2),
        new Column(`Search for a Script Activity by Name`, width.c3),
    ],
];
