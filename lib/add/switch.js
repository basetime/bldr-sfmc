const help = require('../help/init')

module.exports.switch = async (req, argv, blueprint, store) => {
  console.log(store)
  if(argv._[1] && argv._[1] === '.') return blueprint.add.addAll()
  if(argv._[1] && argv._[1] !== '.') return blueprint.add.addFiles(argv)
  if(argv.status) return blueprint.add.status()
 
  return help.init();
};


