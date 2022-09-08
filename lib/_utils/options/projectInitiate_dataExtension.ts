module.exports = {
    interactive: { default: true },
    dataExtensionName: {
        type: 'input',
        describe: 'Data Extension Name',
        prompt: 'always',
    },
    dataExtensionPath: {
        type: 'input',
        describe: 'Data Extension Path',
        default: 'Data Extensions',
        prompt: 'always',
    },
    sendableDataExtension: {
        type: 'confirm',
        describe: 'Sendable Data extension?',
        prompt: 'always',
    },
    retentionPeriod: {
        type: 'confirm',
        describe: 'Retention Period?',
        prompt: 'always',
    },
};
