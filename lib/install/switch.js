/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 */
module.exports.switch = async (req, argv, blueprint) => {
    return blueprint.install.init(argv);
};
