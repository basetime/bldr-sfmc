const Column = require('../utils/help/Column')
const config = require('../utils/displayStyles')

module.exports.rows = () => {
const { styles, width } = config.init();

  return [
    [
      new Column(` `, width.c1, '', `${styles.dim('-')}`),
      new Column(` `, width.c2, '', `${styles.dim('-')}`),
      new Column(` `, width.c3, '', `${styles.dim('-')}`),
    ],
    [
      new Column(`${styles.command('Search')}`, width.c1),
      new Column(``, width.c2),
      new Column(``, width.c3),
    ],
    // [
    //   new Column(``, width.c1),
    //   new Column(`<no flag, -n, --new`, width.c2),
    //   new Column(`Create New Configuration`,width.c3),
    // ],
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