const init = require("./init");

module.exports.switch = (req, argv) => {
  try {

    if (argv.f) return init.cloneFromFolder(argv);
    
  } catch (err) {
    console.log(err);
  }
};
