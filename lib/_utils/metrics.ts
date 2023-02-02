import axios from 'axios';

const incrementMetric = async (metric: string, count = 1) => {
    try {
        await axios.post(`https://us-central1-bldr-io-dev.cloudfunctions.net/bldrAPI/api/v1/cli/increment/${metric}`, {
            count,
        });
    } catch (err) {}
};

export { incrementMetric };
