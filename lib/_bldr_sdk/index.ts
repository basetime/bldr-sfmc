// import BLDR from '@basetime/bldr-sfmc-sdk';
const BLDR = require('@basetime/bldr-sfmc-sdk')
import keytar from 'keytar-sync'
import { handleError } from '../_utils/handleError';
import { State } from '../_bldr/_processes/State';

const {
  getState
} = new State()

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
) => {
  try {
    // If authObject is passed use those credentials to initiate SDK
    if (authObject) {
      return new BLDR(authObject)
    }
    // If authObject is not passed use the current set credentials to initiate SDK
    const currentState = await getState();
  } catch (err: any) {
    return handleError(err.message)
  }
}

export {
  initiateBldrSDK
}