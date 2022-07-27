// import { BLDR } from '@basetime/bldr-sfmc-sdk/lib'
import keytar from 'keytar-sync'

import { State } from '../_bldr/_processes/State';
const state = new State()

const initiateBldrSDK = async () => {
    const currentState = await state.get();
    console.log(currentState)
    // const bldrSDK = new BLDR()
}
