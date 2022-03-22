const blueprnt = require("../../../utils/Blueprint");

module.exports.switch = async (req, argv) => {
  try {
    if (argv.f) return blueprnt.clone.cloneFromFolder(argv)
    if (argv.a) return blueprnt.clone.cloneFromID(argv.a);
    
  } catch (err) {
    console.log(err);
  }
};
