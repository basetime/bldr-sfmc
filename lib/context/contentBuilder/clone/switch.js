module.exports.switch = async (req, argv, blueprint, context) => {
  try {
  
    if (argv.f) return blueprint.cb_clone.cloneFromFolder(argv, context)
    if (argv.a) return blueprint.cb_clone.cloneFromID(argv.a);
    
  } catch (err) {
    console.log(err);
  }
};
