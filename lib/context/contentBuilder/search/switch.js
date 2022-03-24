

module.exports.switch = async (req, argv, blueprint) => {
  try {
    
    if (argv.f) return blueprint.search.dataFolder('asset', 'Name', argv.f);
    if (argv.a) return blueprint.search.asset('name', argv.a);
    
  } catch (err) {
    console.log(err);
  }
};
