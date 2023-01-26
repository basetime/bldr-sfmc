module.exports = {
    interactive: { default: true },
    dataExtensionName: {
        type: 'input',
        describe: 'Data Extension Name',
        prompt: 'always',
    },
    sharedDataExtension: {
        type: 'confirm',
        describe: 'Shared Data extension?',
        prompt: 'always',
    },
    dataExtensionPath: {
        type: 'input',
        describe: `Data Extension Path. Root Folder is 'Data Extensions', input project folder and subfolder nesting if needed.`,
        default: '',
        prompt: 'always',
    },
    sendableDataExtension: {
        type: 'confirm',
        describe: 'Sendable Data extension?',
        prompt: 'always',
    },
    retentionPeriod: {
        type: 'list',
        describe: `Retention Period?`,
        choices: ['None', 'Individual Records', 'All Records and Data Extension', 'All Records'],
        prompt: 'always',
    },
};
