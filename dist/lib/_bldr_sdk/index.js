"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateBldrSDK = void 0;
// import BLDR from '@basetime/bldr-sfmc-sdk';
const BLDR = require('@basetime/bldr-sfmc-sdk');
const axios = require('axios').default;
const redirectURL = 'https://bldr.io/cli/sfmc/authenticate/';
const redirect = encodeURIComponent(redirectURL);
const open = require('open');
const keytar_sync_1 = require("keytar-sync");
const config_1 = require("../_bldr/_processes/config");
const state_1 = require("../_bldr/_processes/state");
const _utils_1 = require("../_utils");
const display_1 = require("../_utils/display");
const { getState, debug } = new state_1.State();
const { getInstanceConfiguration } = new config_1.Config();
/**
 *
 * @param accessToken
 */
const getAuthenticatedUserPermissions = (authObject) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRequest = yield axios.get(`${authObject.auth_url}v2/userinfo`, {
            headers: {
                Authorization: `Bearer ${authObject.access_token}`,
            },
        });
        debug('Retrieve Authenticated User Permissions', 'info', userRequest);
        return (_a = userRequest === null || userRequest === void 0 ? void 0 : userRequest.data) === null || _a === void 0 ? void 0 : _a.permissions;
    }
    catch (err) {
        debug('Retrieve Authenticated User Permissions Err', 'error', err);
        return err;
    }
});
/**
 *
 *
 * @param authObject
 * @param code
 * @returns
 */
const verifyChallengeCode = (authObject, code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!code) {
            (0, display_1.displayLine)('Challenge Code Not Received', 'error');
            return;
        }
        (0, display_1.displayLine)('Verify Challenge Code Request', 'info');
        const challengePayload = {
            grant_type: 'authorization_code',
            client_id: authObject.client_id,
            client_secret: authObject.client_secret,
            redirect_uri: redirectURL,
            account_id: authObject.account_id,
            code: code,
        };
        debug('Challenge Code Request', 'info', { authObject, challengePayload });
        const tokenRequest = yield axios.post(`${authObject.auth_url}v2/token`, challengePayload);
        if (tokenRequest && new RegExp(/^2/).test(tokenRequest.status)) {
            (0, display_1.displayLine)('Challenge Code verified', 'success');
            let authObjectResponse = tokenRequest.data;
            authObjectResponse.scope = authObjectResponse.scope.split(' ');
            authObjectResponse.expiration = process.hrtime()[0] + authObjectResponse.expires_in;
            authObjectResponse.account_id = authObject.account_id;
            authObjectResponse.auth_url = authObject.auth_url;
            return authObjectResponse;
        }
        else {
            debug('No Token Request', 'error', tokenRequest);
            return tokenRequest;
        }
        return false;
    }
    catch (err) {
        debug('Verify Challenge Code Err', 'error', err);
        return err;
    }
});
/**
 *
 * @param authObject
 * @returns
 */
const oAuthInitiator = (authObject) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const express = require('express');
        const cors = require('cors');
        const app = express();
        const port = 3000;
        (0, display_1.displayLine)('Initiating Authentication', 'info');
        (0, display_1.displayLine)('Opening Browser for Authentication, action may be required', 'info');
        yield open(`${authObject.auth_url}v2/authorize?client_id=${authObject.client_id}&redirect_uri=${redirect}&response_type=code`);
        const bodyParser = require('body-parser');
        let httpServer = require('http').createServer(app);
        app.use(bodyParser.json());
        app.use(cors({ origin: '*' }));
        app.post('/oauth', function (req, res) {
            return __awaiter(this, void 0, void 0, function* () {
                //const code = req.query.code
                const code = req.body.code;
                code && (0, display_1.displayLine)('BLDR Received Challenge Code', 'info');
                debug('Challenge Code', 'info', code);
                const verified = code && (yield verifyChallengeCode(authObject, code));
                debug('Verify Challenge Code Response', 'info', verified);
                const userPermissions = verified && (yield getAuthenticatedUserPermissions(verified));
                verified.user = {
                    permissions: verified && userPermissions,
                };
                verified && (0, display_1.displayLine)('Finishing oAuthentication', 'info');
                verified && (0, display_1.displayLine)('Open browser window can be closed', 'info');
                setTimeout(() => {
                    !verified && (0, display_1.displayLine)('Authentication Failed', 'info');
                    res.end();
                    httpServer.close();
                }, 6000);
                res.send('BLDR -> SFMC authentication complete. You can close this window now!');
                res.end();
                httpServer.close();
                resolve(verified);
            });
        });
        httpServer.listen(port, () => { });
    }));
});
/**
 *
 * @param authObject.client_id
 * @param authObject.client_secret
 * @param authObject.account_id
 * @param authObject.auth_url
 */
const initiateBldrSDK = (authObject, instance, configurationType, account_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('Initiating bldr sdk: initial request', 'info', '');
        // If authObject is passed use those credentials to initiate SDK
        if (authObject && configurationType && configurationType === 'Server-to-Server') {
            debug('Initiate sdk Server-To-Server', 'info', {
                authObject,
                instance,
                configurationType,
                account_id,
            });
            return new BLDR(authObject);
        }
        else if (authObject && configurationType && configurationType === 'Web App') {
            debug('Initiate sdk Web-App', 'info', '');
            const verified = Object.assign({}, yield oAuthInitiator(authObject));
            debug('Initiate sdk Web-App: Received Verification', 'info', verified);
            if (verified) {
                const oAuthJSON = Object.assign(Object.assign({}, verified), authObject);
                yield (0, keytar_sync_1.setPassword)('bldr', 'currentSession', JSON.stringify({
                    instance,
                    authObject: oAuthJSON,
                }));
                debug('Check Session Saved', 'info', yield (0, keytar_sync_1.getPassword)('bldr', 'currentSession'));
                return oAuthJSON && new BLDR(oAuthJSON);
            }
        }
        debug('Initiating bldr sdk from current state', 'info', '');
        // If authObject is not passed use the current set credentials to initiate SDK
        const currentState = yield getState();
        const stateInstance = currentState.instance;
        const activeMID = currentState.activeMID;
        debug('Current bldr state', 'info', {
            instance: stateInstance,
            mid: activeMID,
        });
        let stateConfiguration = yield getInstanceConfiguration(stateInstance);
        debug('Current Configuration', 'info', Object.assign(Object.assign({}, stateConfiguration), { apiClientId: stateConfiguration.apiClientId.substring(0, 5), apiClientSecret: stateConfiguration.apiClientSecret.substring(0, 5) }));
        stateConfiguration.configurationType = stateConfiguration.configurationType || 'Server-to-Server';
        const currentSession = yield (0, keytar_sync_1.getPassword)('bldr', 'currentSession');
        const currentSessionJSON = currentSession && JSON.parse(currentSession);
        const currentAuthObject = currentSessionJSON && currentSessionJSON.authObject;
        debug('Current session', 'info', currentSession);
        //Check if session is expired
        let sessionExpired = currentAuthObject && (yield (0, _utils_1.isExpired)(currentSessionJSON.authObject));
        debug('Session expired', 'info', sessionExpired);
        //Check if target MID has been updated
        let midUpdated = false;
        if (currentAuthObject && activeMID !== currentAuthObject.account_id) {
            currentAuthObject.account_id = activeMID;
            midUpdated = true;
        }
        let sdkConfiguration = {
            client_id: stateConfiguration.apiClientId,
            client_secret: stateConfiguration.apiClientSecret,
            account_id: account_id || currentState.activeMID || stateConfiguration.parentMID,
            auth_url: stateConfiguration.authURI,
        };
        if (Object.prototype.hasOwnProperty.call(stateConfiguration, 'configurationType') &&
            stateConfiguration.configurationType === 'Server-to-Server') {
            if (currentSession && !sessionExpired && !midUpdated && stateInstance === currentSessionJSON.instance) {
                debug('Initiating bldr sdk: request', 'info', Object.assign(Object.assign({}, sdkConfiguration), currentAuthObject));
                return new BLDR(Object.assign(Object.assign({}, sdkConfiguration), currentAuthObject));
            }
            else {
                debug('Requesting Authentication Token Refresh: request', 'info', sdkConfiguration);
                const newSession = new BLDR(sdkConfiguration);
                let accessToken = yield newSession.sfmc.account.getAccessTokenResponse();
                debug('Requesting Authentication Token Refresh: response', 'info', accessToken);
                accessToken.scope = accessToken.scope.split(' ');
                delete accessToken.client_id;
                delete accessToken.client_secret;
                yield (0, keytar_sync_1.setPassword)('bldr', 'currentSession', JSON.stringify({
                    instance: stateInstance,
                    authObject: accessToken,
                }));
                debug('Check Session Saved', 'info', yield (0, keytar_sync_1.getPassword)('bldr', 'currentSession'));
                return newSession;
            }
        }
        else if (Object.prototype.hasOwnProperty.call(stateConfiguration, 'configurationType') &&
            stateConfiguration.configurationType === 'Web App') {
            if (currentSession && stateInstance === currentSessionJSON.instance && !sessionExpired && !midUpdated) {
                sdkConfiguration = Object.assign(Object.assign({}, sdkConfiguration), currentAuthObject);
            }
            else if (currentSession &&
                stateInstance === currentSessionJSON.instance &&
                (sessionExpired || midUpdated)) {
                debug('Requesting Authentication Token Refresh: request', 'info', sdkConfiguration);
                const verified = Object.assign({}, yield oAuthInitiator(Object.assign(Object.assign({}, sdkConfiguration), currentAuthObject)));
                debug('Initiate sdk Web-App: Received Verification', 'info', verified);
                if (verified) {
                    sdkConfiguration = Object.assign(Object.assign({}, sdkConfiguration), verified);
                    yield (0, keytar_sync_1.setPassword)('bldr', 'currentSession', JSON.stringify({
                        instance: stateInstance,
                        authObject: verified,
                    }));
                    debug('Check Session Saved', 'info', yield (0, keytar_sync_1.getPassword)('bldr', 'currentSession'));
                }
            }
            else if ((currentSession && stateInstance !== currentSessionJSON.instance) || !currentSession) {
                const verified = Object.assign({}, yield oAuthInitiator(sdkConfiguration));
                debug('Initiate sdk Web-App: Received Verification', 'info', verified);
                if (verified) {
                    sdkConfiguration = Object.assign(Object.assign({}, sdkConfiguration), verified);
                    yield (0, keytar_sync_1.setPassword)('bldr', 'currentSession', JSON.stringify({
                        instance: stateInstance,
                        authObject: verified,
                    }));
                    debug('Check Session Saved', 'info', yield (0, keytar_sync_1.getPassword)('bldr', 'currentSession'));
                }
            }
        }
        return new BLDR(sdkConfiguration);
    }
    catch (err) {
        debug('Initiate sdk Err', 'error', err);
        return err;
    }
});
exports.initiateBldrSDK = initiateBldrSDK;
