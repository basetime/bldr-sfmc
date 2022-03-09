const init = require("./init");

module.exports.switch = (req, argv) => {
  try {

    if (argv.f) return init.cloneFolders(argv);
    
  } catch (err) {
    console.log(err);
  }
};
