import axios from 'axios'

const incrementMetric = async (metric: string, count = 1) => {
    try {
        // await axios.post(`http://127.0.0.1:5001/bldr-io-dev/us-central1/bldrAPI/api/v1/cli/increment/${metric}`, {
        //     count
        // })
    } catch (err) {
        console.log(err)
    }
}

export {
    incrementMetric
}
