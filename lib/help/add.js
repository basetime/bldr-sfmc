const Column = require('../utils/help/Column')
const displayStyles = require('../utils/displayStyles')
const { styles, width } = displayStyles.init();

module.exports = [
    [
      new Column(` `, width.c1, '', `${styles.dim('-')}`),
      new Column(` `, width.c2, '', `${styles.dim('-')}`),
      new Column(` `, width.c3, '', `${styles.dim('-')}`),
    ],
    [
      new Column(`${styles.command('Add')}`, width.c1),
      new Column(``, width.c2),
      new Column(``, width.c3),
    ],
    [
      new Column(``, width.c1),
      new Column(`.`, width.c2),
      new Column(`Add All Assets to the Stash to be Pushed into SFMC`,width.c3),
    ],
    [
      new Column(``, width.c1),
      new Column(`<folder path>`, width.c2),
      new Column(`Add One or Multiple Assets to the Stash to be Pushed into SFMC`,width.c3),
    ],
    [
      new Column(``, width.c1),
      new Column(`--status`, width.c2),
      new Column(`Show All Assets that Have Been Added to the Stash`,width.c3),
    ],
  ]