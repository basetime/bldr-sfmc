const help = require('../help/init')

module.exports.switch = async (req, argv, blueprint, store) => {
  console.log(store)
  if(argv._[1] && argv._[1] === '.') return blueprint.add.addAll(store)
  if(argv._[1] && argv._[1] !== '.') return blueprint.add.addFiles(argv, store)
  if(argv.status) return blueprint.add.status()
 
  help.init();
};


