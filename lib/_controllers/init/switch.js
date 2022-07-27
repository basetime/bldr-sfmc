/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 */
const InitSwitch = async (req, argv, sdk) => {
    if (argv['update-config-keys']) {
        return sdk.initiate.updateKeys();
    }

    if (argv['config-only']) {
        return sdk.initiate.configOnly();
    }

    if (argv.cb) {
        return sdk.cb_clone.init();
    }
};

export {
    InitSwitch
}
