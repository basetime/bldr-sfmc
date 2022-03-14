const help = require('../help/init')

module.exports.switch = (req, argv) => {
  try {

    if(!argv.contentBuilder && !argv.cb && !argv.automationStudio && !argv.as)
      throw new Error('Please include a context flag')

    if(argv.contentBuilder || argv.cb){
      let controller = require(`./contentBuilder/${req}/switch`);
      return controller.switch(req, argv)
    }
   

  } catch (err) {
    help.init()
    help.invalidCommand(err.message)
    help.invalidCommand(req)
  }
};
