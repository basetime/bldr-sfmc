const init = require('./init');
const help = require('../help/init')
//const state = require('../state/init')

module.exports.switch = (req, argv) => {
  
  if(argv._[1] && argv._[1] === '.') return init.addAll()
 
  help.init();
};
