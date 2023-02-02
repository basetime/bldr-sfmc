const Column = require('../utils/help/Column');
const displayStyles = require('../utils/displayStyles');
const { styles, width } = displayStyles.init();

module.exports = [
    [
        new Column(` `, width.c1, '', `${styles.dim('-')}`),
        new Column(` `, width.c2, '', `${styles.dim('-')}`),
        new Column(` `, width.c3, '', `${styles.dim('-')}`),
    ],
    [new Column(`${styles.command('push')}`, width.c1), new Column(``, width.c2), new Column(``, width.c3)],
    [new Column(``, width.c1), new Column(``, width.c2), new Column(`Update or Create files in SFMC`, width.c3)],
    [
        new Column(``, width.c1),
        new Column(` `, width.c2),
        new Column(
            ` ${styles.dim(
                '>>'
            )} Files that are created locally will prompt the selection of Asset Type before being created in SFMC`,
            width.c3
        ),
    ],
];
