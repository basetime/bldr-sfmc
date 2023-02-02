const Column = require('../utils/help/Column');
const displayStyles = require('../utils/displayStyles');
const { styles, width } = displayStyles.init();
const twoCols = width.c2 + width.c3 + 3;

module.exports = [
    [
        new Column(` `, width.c1, '', `${styles.dim('-')}`),
        new Column(` `, width.c2, '', `${styles.dim('-')}`),
        new Column(` `, width.c3, '', `${styles.dim('-')}`),
    ],
    [new Column(` `, width.c1), new Column(` `, twoCols)],
    [
        new Column(` `, width.c1),
        new Column(`${styles.callout('The following commands require one of the following context flags.')}`, twoCols),
    ],
    [new Column(` `, width.c1), new Column(` `, twoCols)],
    [new Column(` `, width.c1), new Column(`--cb, --content-builder`, width.c2), new Column(` `, width.c3)],
    [new Column(` `, width.c1), new Column(`--as, --automation-studio`, width.c2), new Column(` `, width.c3)],
];
