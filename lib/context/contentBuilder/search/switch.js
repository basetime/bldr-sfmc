const blueprintInit = require("../../../utils/Blueprint");

module.exports.switch = async (req, argv) => {
  try {
    const blueprint = blueprintInit.set()

    if (argv.f) return blueprint.search.dataFolder('asset', 'Name', argv.f);
    if (argv.a) return blueprint.search.asset('name', argv.a);
    
  } catch (err) {
    console.log(err);
  }
};
