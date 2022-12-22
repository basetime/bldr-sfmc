// import BLDR from '@basetime/bldr-sfmc-sdk';
const BLDR = require('@basetime/bldr-sfmc-sdk');
const axios = require('axios').default

const redirectURL = 'https://bldr.io/cli/sfmc/authenticate/';
const redirect = encodeURIComponent(redirectURL);
const open = require('open')

import { BLDR_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_client';
import { handleError } from '../_utils/handleError';
import { State } from '../_bldr/_processes/state';
import { Config } from '../_bldr/_processes/config';
import { SFMC_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/sfmc_client';
import { CLI_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/cli_client';
import { getPassword, setPassword, deletePassword } from 'keytar-sync';
import { isExpired } from '../_utils';
import { displayLine } from '../_utils/display';

const { getState } = new State();
const { getInstanceConfiguration } = new Config();
/**
 *
 * @param accessToken
 */
const getAuthenticatedUserPermissions = async (authObject: any) => {
    try {
        const userRequest = await axios.get(`${authObject.auth_url}v2/userinfo`, {
            headers: {
                Authorization: `Bearer ${authObject.access_token}`
            }
        });

        return userRequest?.data?.permissions;
    } catch (err) {
        console.log(err)
    }
}
/**
 *
 * @param authObject
 * @param code
 * @returns
 */
const verifyChallengeCode = async (authObject: any, code: string) => {
    try {
        displayLine('Verifying Challenge Code', 'info')
        const challengePayload = {
            grant_type: "authorization_code",
            client_id: authObject.client_id,
            client_secret: authObject.client_secret,
            redirect_uri: redirectURL,
            account_id: authObject.account_id,
            code: code
        }

        const tokenRequest = await axios.post(`${authObject.auth_url}v2/token`, challengePayload)

        if (tokenRequest.status === 200) {
            displayLine('Challenge Code verified', 'success')
            let authObjectResponse = tokenRequest.data;
            authObjectResponse.scope = authObjectResponse.scope.split(' ');
            authObjectResponse.expiration = process.hrtime()[0] + authObjectResponse.expires_in;
            authObjectResponse.account_id = authObject.account_id;
            authObjectResponse.auth_url = authObject.auth_url;
            return authObjectResponse;
        }

        return false
    } catch (err) {
        console.log(err)
    }
}
/**
 *
 * @param authObject
 * @returns
 */
const oAuthInitiator = async (authObject: any) => {
    return new Promise(async (resolve, reject) => {
        const express = require('express')
        const cors = require('cors')
        const app = express();
        const port = 3000;

        displayLine('Initiating Authentication', 'info')
        displayLine('Opening Browser for Authentication, action may be required', 'info')
        await open(`${authObject.auth_url}v2/authorize?client_id=${authObject.client_id}&redirect_uri=${redirect}&response_type=code`);

        const bodyParser = require("body-parser");
        let httpServer = require("http").createServer(app);

        app.use(bodyParser.json());
        app.use(cors({ origin: '*' }))

        app.post('/oauth', async function (req: any, res: any) {
            //const code = req.query.code
            const code = req.body.code;
            code && displayLine('BLDR Received Challenge Code', 'info')
            const verified = code && await verifyChallengeCode(authObject, code)
            const userPermissions = verified && await getAuthenticatedUserPermissions(verified)

            verified.user = {
                permissions: verified && userPermissions
            }

            verified && displayLine('Finishing oAuthentication', 'info')
            verified && displayLine('Open browser window can be closed', 'info');

            setTimeout(() => {
                !verified && displayLine('Authentication Failed', 'info')
                res.end()
                httpServer.close()
            }, 6000)

            res.send('BLDR -> SFMC authentication complete. You can close this window now!')
            res.end()
            httpServer.close()

            resolve(verified)
        });

        httpServer.listen(port, () => { });
    });
};
/**
 *
 * @param authObject.client_id
 * @param authObject.client_secret
 * @param authObject.account_id
 * @param authObject.auth_url
 */
const initiateBldrSDK = async (
    authObject?: {
        client_id: string;
        client_secret: string;
        account_id: number;
        auth_url: string;
    },
    instance?: string,
    configurationType?: string,
    account_id?: number
): Promise<{
    sfmc: SFMC_Client;
    cli: CLI_Client;
}> => {
    try {
        // If authObject is passed use those credentials to initiate SDK
        if (authObject && configurationType && configurationType === 'Server-to-Server') {
            return new BLDR(authObject);
        } else if (authObject && configurationType && configurationType === 'Web App') {
            const verified = Object.assign({}, await oAuthInitiator(authObject))

            if (verified) {
                const oAuthJSON = {
                    ...verified,
                    ...authObject
                }
                await setPassword('bldr', 'currentSession', JSON.stringify({
                    instance,
                    authObject: oAuthJSON
                }))

                return oAuthJSON && new BLDR(oAuthJSON)
            }
        }

        // If authObject is not passed use the current set credentials to initiate SDK
        const currentState = await getState();
        const stateInstance = currentState.instance;
        const activeMID = currentState.activeMID;

        let stateConfiguration = await getInstanceConfiguration(stateInstance);
        stateConfiguration.configurationType = stateConfiguration.configurationType || 'Server-to-Server';

        const currentSession = await getPassword('bldr', 'currentSession');
        const currentSessionJSON = currentSession && JSON.parse(currentSession);
        const currentAuthObject = currentSessionJSON && currentSessionJSON.authObject;


        //Check if session is expired
        const sessionExpired = currentAuthObject && await isExpired(currentSessionJSON.authObject);

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
            auth_url: stateConfiguration.authURI
        };


        if (
            Object.prototype.hasOwnProperty.call(stateConfiguration, 'configurationType')
            && stateConfiguration.configurationType === 'Server-to-Server'
        ) {
            if (currentSession && !sessionExpired && !midUpdated && stateInstance === currentSessionJSON.instance) {
                return new BLDR({
                    ...sdkConfiguration,
                    ...currentAuthObject
                })
            } else {
                const newSession = new BLDR(sdkConfiguration)
                let accessToken = await newSession.sfmc.account.getAccessTokenResponse();
                accessToken.scope = accessToken.scope.split(' ')

                delete accessToken.client_id;
                delete accessToken.client_secret;

                await setPassword('bldr', 'currentSession', JSON.stringify({
                    instance: stateInstance,
                    authObject: accessToken
                }))

                return newSession
            }
        } else if (
            Object.prototype.hasOwnProperty.call(stateConfiguration, 'configurationType')
            && stateConfiguration.configurationType === 'Web App'
        ) {
            if (currentSession && stateInstance === currentSessionJSON.instance && !sessionExpired && !midUpdated) {
                sdkConfiguration = {
                    ...sdkConfiguration,
                    ...currentAuthObject
                }
            } else if (currentSession && stateInstance === currentSessionJSON.instance && (sessionExpired || midUpdated)) {

                const verified = Object.assign({}, await oAuthInitiator({
                    ...sdkConfiguration,
                    ...currentAuthObject
                }))

                if (verified) {
                    sdkConfiguration = {
                        ...sdkConfiguration,
                        ...verified
                    }
                    await setPassword('bldr', 'currentSession', JSON.stringify({
                        instance: stateInstance,
                        authObject: verified
                    }))
                }
            } else if ((currentSession && stateInstance !== currentSessionJSON.instance) || !currentSession) {
                const verified = Object.assign({}, await oAuthInitiator(sdkConfiguration))

                if (verified) {
                    sdkConfiguration = {
                        ...sdkConfiguration,
                        ...verified
                    }
                    await setPassword('bldr', 'currentSession', JSON.stringify({
                        instance: stateInstance,
                        authObject: verified
                    }))
                }
            }
        }

        return new BLDR(sdkConfiguration)
    } catch (err: any) {
        return err.message && displayLine(err.message, 'error');
    }
};


export { initiateBldrSDK };
