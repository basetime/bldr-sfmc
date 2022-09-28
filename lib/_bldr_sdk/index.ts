// import BLDR from '@basetime/bldr-sfmc-sdk';
const BLDR = require('@basetime/bldr-sfmc-sdk');
const axios = require('axios').default
const port = 3000;
const redirect = encodeURIComponent('https://us-central1-bldr-io.cloudfunctions.net/sfmc_oauth/');
const open = require('open')

import { BLDR_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_client';
import { handleError } from '../_utils/handleError';
import { State } from '../_bldr/_processes/state';
import { Config } from '../_bldr/_processes/config';
import { SFMC_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/sfmc_client';
import { CLI_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/cli_client';
import { getPassword, setPassword, findCredentials, deletePasswordSync, getPasswordSync } from 'keytar-sync';

const { getState } = new State();
const { getInstanceConfiguration } = new Config();

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
            await oAuthInitiator(authObject)
            let oAuthObject = await getPassword('bldr', 'oAuthTemp')
            let oAuthJSON = oAuthObject && JSON.parse(oAuthObject)

            oAuthJSON = {
                ...oAuthJSON,
                ...authObject
            }
            return oAuthObject && new BLDR(oAuthJSON)
        }

        // If authObject is not passed use the current set credentials to initiate SDK
        const currentState = await getState();
        const stateInstance = currentState.instance;
        const stateConfiguration = await getInstanceConfiguration(stateInstance);

        const sdkConfiguration = {
            client_id: stateConfiguration.apiClientId,
            client_secret: stateConfiguration.apiClientSecret,
            account_id: account_id || currentState.activeMID || stateConfiguration.parentMID,
            auth_url: stateConfiguration.authURI,
        };

        const bldrClient = new BLDR(sdkConfiguration);
        return bldrClient
    } catch (err: any) {
        return err.message && handleError(err.message);
    }
};


const verifyChallengeCode = async (authObject: any, code:string) => {
    try {
      console.log('Verifying Challenge Code...')
      const challengePayload = {
        grant_type: "authorization_code",
        client_id: authObject.client_id,
        client_secret: authObject.client_secret,
        redirect_uri: "https://us-central1-bldr-io.cloudfunctions.net/sfmc_oauth/",
        account_id: authObject.account_id,
        code: code
      }

      const tokenRequest = await axios.post(`${authObject.auth_url}v2/token`, challengePayload)

      if(tokenRequest.status === 200){
        console.log('Challenge Code verified...')
        let authObjectResponse = tokenRequest.data;
        authObjectResponse.scope = authObjectResponse.scope.split(' ');
        authObjectResponse.expiration = process.hrtime()[0] + authObjectResponse.expires_in;
        authObjectResponse.account_id = authObject.account_id;
        return authObjectResponse;
      }

      return false
    } catch (err) {
      console.log(err)
    }
  }

  const oAuthInitiator = async (authObject: any) => {
    const express = require('express')
    const app = express();

    console.log('Initiating oAuthentication...')
    await open(`${authObject.auth_url}v2/authorize?client_id=${authObject.client_id}&redirect_uri=${redirect}&response_type=code`);

    const bodyParser = require("body-parser");
    let httpServer = require("http").createServer(app);

    app.use(bodyParser.json());
    app.get('/oauth', async function (req: any, res: any) {
      const code = req.query.code
      code && console.log('BLDR Received Challenge Code...')
      const verified = code && await verifyChallengeCode(authObject, code)
    console.log('verified', verified)
      verified && console.log('Finishing oAuthentication...')
      verified && await setPassword('bldr', 'oAuthTemp', JSON.stringify(verified))
      !verified && console.log('Authentication Failed...')
      code && httpServer.close()
      res.end('');
    });

    httpServer.listen(port, () => {});
  };


export { initiateBldrSDK };
