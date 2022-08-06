import { displayLine } from './display';

const handleError = (err: any) => {
    if (
        Object.prototype.hasOwnProperty.call(err, 'JSON') &&
        Object.prototype.hasOwnProperty.call(err.JSON, 'Results') &&
        err.JSON.Results.length > 0 &&
        Object.prototype.hasOwnProperty.call(err.JSON.Results[0], 'StatusMessage')
    ) {
        displayLine(err.JSON.Results[0].StatusMessage, 'error');
        return;
    }

    if (
        Object.prototype.hasOwnProperty.call(err, 'response') &&
        Object.prototype.hasOwnProperty.call(err, 'data') &&
        Object.prototype.hasOwnProperty.call(err, 'error_description')
    ) {
        displayLine(err.response.data.error_description, 'error');
        return;
    }

    if (typeof err === 'object') {
        displayLine(JSON.stringify(err));
        return;
    }

    if (err && err.message) {
        displayLine(err.message, 'error');
        return;
    }

    displayLine(err, 'error');
    return;
};

export { handleError };
