const contentBuilder = require("./init");
const help = require('../../../help/init')

module.exports.switch = (req, argv) => {
  try {

    if (argv.a) return contentBuilder.searchAssets(argv);
    if (argv.f) return contentBuilder.searchFolders(argv);

    return help.init();

  } catch (err) {
    console.log(err);
  }
};
