/**
 * Flag routing for Add command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 * @param {object} store
 */
module.exports.switch = async (req, argv, blueprint, store) => {
    /**
     * Add files in bulk based on folder path
     */
    if (argv._[1] && argv._[1] === '.') return blueprint.add.addAll();

    /**
     * Add specific list of files based on folder paths
     */
    if (argv._[1] && argv._[1] !== '.') return blueprint.add.addFiles(argv);

    /**
     * Handle unrecognized flags
     */
    if (!argv._[1] && argv._[1] !== '.') return store.help.init();
};
