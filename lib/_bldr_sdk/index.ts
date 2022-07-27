import { BLDR } from '@basetime/bldr-sfmc-sdk/lib'
import keytar from 'keytar-sync'

import { stateInit } from './store'


const initiateBldrSDK = async () => {
    const currentState = await stateInit.get();
    console.log(currentState)
    // const bldrSDK = new BLDR()
}
