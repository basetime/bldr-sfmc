const Column = require('../utils/help/Column')
const displayStyles = require('../utils/displayStyles')
const { styles, width } = displayStyles.init();

module.exports.rows = () => {
const twoCols = width.c2 + width.c3 + 3;

  return [
    [
      new Column(` `, width.c1, '', `${styles.dim('-')}`),
      new Column(` `, width.c2, '', `${styles.dim('-')}`),
      new Column(` `, width.c3, '', `${styles.dim('-')}`),
    ],
    [
      new Column(` `, width.c1),
      new Column(` `, twoCols),
    ],
    [
      new Column(` `, width.c1),
      new Column(`${styles.callout('The following commands require one of the following context flags.')}`, twoCols),
    ],
    [
      new Column(` `, width.c1),
      new Column(` `, twoCols),
    ],
    [
      new Column(` `, width.c1),
      new Column(`--cb, --content-builder`, width.c2),
      new Column(` `, width.c3),
    ],
    [
      new Column(` `, width.c1),
      new Column(`--as, --automation-studio`, width.c2),
      new Column(` `, width.c3),
    ],
    // [
    //   new Column(``, width.c1),
    //   new Column(`-s, --set <instance name>`, width.c2),
    //   new Column(`Set a configuration to use`,width.c3),
    // ],
    // [
    //   new Column(``, width.c1),
    //   new Column(`-l, --list`, width.c2),
    //   new Column(`List All Configurations`,width.c3),
    // ],
    // [
    //   new Column(``, width.c1),
    //   new Column(`  ${styles.dim('>>')}  -a`, width.c2),
    //   new Column(`Show Configuration Details ${styles.detail('optional')}`,width.c3),
    // ],
    // [
    //   new Column(``, width.c1),
    //   new Column(`  ${styles.dim('>>')}  <instance name>`, width.c2),
    //   new Column(`Narrow configuration list to an instance ${styles.detail('optional')}`,width.c3),
    // ],
    // [
    //   new Column(``, width.c1),
    //   new Column(`-d, --delete <instance name>`, width.c2),
    //   new Column(`Delete a Stored Configuration`,width.c3),
    // ]
  ]
}