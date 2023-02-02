const Column = require('../utils/help/Column');
const displayStyles = require('../utils/displayStyles');
const { styles, width } = displayStyles.init();

module.exports = [
    [
        new Column(`${styles.header('Command')}`, width.c1),
        new Column(`${styles.header('Flag')}`, width.c2),
        new Column(`${styles.header('Description')}`, width.c3),
    ],
];
