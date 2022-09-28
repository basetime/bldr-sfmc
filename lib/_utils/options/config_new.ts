module.exports = {
    interactive: { default: true },
    instance: {
        type: 'input',
        describe: 'SFMC Instance Name',
        prompt: 'always',
    },
    configurationType: {
        type: 'list',
        describe: `Installed Package/Authentication Type`,
        choices: ['Server-to-Server', 'Web App'],
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
