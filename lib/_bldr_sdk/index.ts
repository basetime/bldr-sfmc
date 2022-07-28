// import BLDR from '@basetime/bldr-sfmc-sdk';
const BLDR = require("@basetime/bldr-sfmc-sdk");
import {BLDR_Client} from "@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_client"
import { handleError } from "../_utils/handleError";
import { State } from "../_bldr/_processes/State";
import { Config } from "../_bldr/_processes/Config";

const { getState } = new State();
const { getInstanceConfiguration } = new Config()

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
  account_id?: number
): Promise<BLDR_Client> => {
  try {
    // If authObject is passed use those credentials to initiate SDK
    if (authObject) {
      return new BLDR(authObject);
    }
    // If authObject is not passed use the current set credentials to initiate SDK
    const currentState = await getState();
    const stateInstance = currentState.instance;

    let stateConfiguration = await getInstanceConfiguration(stateInstance)
    const sdkConfiguration = {
      client_id: stateConfiguration.apiClientId,
      client_secret: stateConfiguration.apiClientSecret,
      account_id: account_id || stateInstance.activeMID || stateConfiguration.parentMID,
      auth_url: stateConfiguration.authURI,
    }

    return new BLDR(sdkConfiguration)

  } catch (err: any) {
    return err.message && handleError(err.message)
  }
};

export {
  initiateBldrSDK
}
