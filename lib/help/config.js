const Column = require('../utils/help/Column')
const displayStyles = require('../utils/displayStyles')
const { styles, width } = displayStyles.init();

module.exports.rows = () => {
  return [
    [
      new Column(` `, width.c1, '', `${styles.dim('-')}`),
      new Column(` `, width.c2, '', `${styles.dim('-')}`),
      new Column(` `,width.c3, '', `${styles.dim('-')}`),
    ],
    [
      new Column(`${styles.command('Config')}`, width.c1),
      new Column(``, width.c2),
      new Column(``,width.c3),
    ],
    [
      new Column(``, width.c1),
      new Column(`-n, --new`, width.c2),
      new Column(`Create New Configuration`,width.c3),
    ],
    [
      new Column(``, width.c1),
      new Column(`<instance name>`, width.c2),
      new Column(`Get Configuration for an instance`,width.c3),
    ],
    [
      new Column(``, width.c1),
      new Column(`-l, --list`, width.c2),
      new Column(`List All Configurations`,width.c3),
    ],
    [
      new Column(``, width.c1),
      new Column(`  ${styles.dim('>>')}  -a`, width.c2),
      new Column(`Show Configuration Details ${styles.detail('optional')}`,width.c3),
    ],
    [
      new Column(``, width.c1),
      new Column(`-s, --set <instance name>`, width.c2),
      new Column(`Set a Configuration to Use`,width.c3),
    ],
    [
      new Column(``, width.c1),
      new Column(`-d, --delete <instance name>`, width.c2),
      new Column(`Delete a Stored Configuration`,width.c3),
    ]
  ]
}