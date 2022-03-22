const blueprnt = require("../../../utils/Blueprint");

module.exports.switch = async (req, argv) => {
  try {
    if (argv.f) return blueprnt.search.dataFolder('asset', 'Name', argv.f);
    if (argv.a) return blueprnt.search.asset('name', argv.a);
    
  } catch (err) {
    console.log(err);
  }
};
