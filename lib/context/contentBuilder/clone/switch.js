module.exports.switch = async (req, argv, blueprint, context) => {
  try {
  
    if (argv.f) return blueprint.clone.cloneFromFolder(argv, context)
    if (argv.a) return blueprint.clone.cloneFromID(argv.a);
    
  } catch (err) {
    console.log(err);
  }
};
