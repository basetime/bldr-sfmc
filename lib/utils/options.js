module.exports.init = () => {
    return {
        interactive: { default: true },
        instance: {
            type: 'input',
            describe: 'SFMC Instance Name',
            prompt: 'always',
        },
        parentMID: {
            type: 'input',
            describe: 'Parent MID',
            prompt: 'always',
        },
        apiClientId: {
            type: 'input',
            describe: 'API Client ID',
            prompt: 'always',
        },
        apiClientSecret: {
            type: 'input',
            describe: 'API Client Secret',
            prompt: 'always',
        },
        authURI: {
            type: 'input',
            describe: 'Authentication URI',
            prompt: 'always',
        },
    };
};

module.exports.delete = (instance) => {
    return {
        interactive: { default: true },
        confirmDelete: {
            type: 'confirm',
            describe: `Please confirm deletion of ${instance}`,
            prompt: 'always',
        },
    };
};

module.exports.createNewFile = (assetName) => {
    return {
        interactive: { default: true },
        assetType: {
            type: 'list',
            describe: `What type of asset is ${assetName}`,
            choices: ['htmlemail', 'codesnippetblock', 'htmlblock'],
            prompt: 'always',
        },
    };
};
