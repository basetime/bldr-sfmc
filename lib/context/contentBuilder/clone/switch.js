const blueprintInit = require("../../../utils/Blueprint");

module.exports.switch = async (req, argv) => {
  try {
    const blueprint = blueprintInit.set();
    
    if (argv.f) return blueprint.clone.cloneFromFolder(argv)
    if (argv.a) return blueprint.clone.cloneFromID(argv.a);
    
  } catch (err) {
    console.log(err);
  }
};
