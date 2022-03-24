const help = require('../help/init')
//const state = require('../state/init')

module.exports.switch = async (req, argv, blueprint) => {
  
  if(argv._[1] && argv._[1] === '.') return blueprint.add.addAll()
  if(argv._[1] && argv._[1] !== '.') return blueprint.add.addFiles(argv)

 
  help.init();
};


