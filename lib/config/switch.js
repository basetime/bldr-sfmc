const init = require('./init');
const help = require('../help/init')
const state = require('../state/init')

module.exports.switch = (req, argv) => {
  if (argv._[1]) return console.log(init.getConfiguration(argv._[1]));

  if (argv.d || argv.delete) return init.deleteConfiguration(argv);

  if (argv.l || argv.list) return init.listConfigurations(argv);

  if (argv.n || argv.new) return init.init();

  if (argv.s || argv.set) return state.setClient(argv);
 
  help.init();
};
