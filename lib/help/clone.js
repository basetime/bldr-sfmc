const Column = require('../utils/help/Column');
const displayStyles = require('../utils/displayStyles');
const { styles, width } = displayStyles.init();

module.exports = [
    [
        new Column(` `, width.c1, '', `${styles.dim('-')}`),
        new Column(` `, width.c2, '', `${styles.dim('-')}`),
        new Column(` `, width.c3, '', `${styles.dim('-')}`),
    ],
    [
        new Column(`${styles.command('Clone')}`, width.c1),
        new Column(``, width.c2),
        new Column(``, width.c3),
    ],
    [
        new Column(``, width.c1),
        new Column(`-f, --folder <folder id>`, width.c2),
        new Column(
            `Clone All Folders/Subfolders and Assets Starting at Identified Folder`,
            width.c3
        ),
    ],
    [
        new Column(``, width.c1),
        new Column(`-a, --asset <asset id>`, width.c2),
        new Column(
            `Clone a Single Asset Along With Its Full Folder Path`,
            width.c3
        ),
    ],
];
