const init = require("./init");
const auth = require("../../../../lib/utils/sfmc/auth");

module.exports.switch = async (req, argv) => {
  try {
    const sfmc = await auth.setAuth();
    if (argv.f) return init.cloneFromFolder(argv, sfmc);
    if (argv.a) return init.cloneFromID(argv, sfmc);
    
  } catch (err) {
    console.log(err);
  }
};
