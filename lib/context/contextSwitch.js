const help = require('../help/init')

module.exports.switch = (req, argv) => {
  try {

    let controller = require(`./contentBuilder/${req}/switch`);
    return controller.switch(req, argv)

  } catch (err) {
    help.invalidCommand(req)
    help.init()
    console.log(err)
  }
};
