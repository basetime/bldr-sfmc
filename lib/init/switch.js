/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 * @param {object} store
 */
module.exports.switch = async (req, argv, blueprint, store) => {
    return blueprint.cb_clone.init();
};
