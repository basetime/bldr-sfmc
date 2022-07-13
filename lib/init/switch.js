/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 */
module.exports.switch = async (req, argv, blueprint) => {
    if (argv['update-config-keys']) {
        return blueprint.initiate.updateKeys();
    }

    if (argv['config-only']) {
        return blueprint.initiate.configOnly();
    }

    if (argv.cb) {
        return blueprint.cb_clone.init();
    }
};
