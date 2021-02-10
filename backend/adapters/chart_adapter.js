const fetch = require('node-fetch');
const regions = require('../utils/regions');

// https://quickchart.io/documentation/
const BASE_URL = 'https://quickchart.io/chart?c=';

// Function to handle the requests for the endpoint.
const handleChartRequest = async (req, res) => {
    const region = req.params.region;
    const input = req.query.data;

    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    // input is a string in the following form:
    // [["2021-02-01", 100],["2021-02-02", 200]]
    let labels = undefined;
    let data = undefined;
    try {
        const dates = JSON.parse(input);
        labels = dates.map((v,i) => { return v[0]; });
        data = dates.map((v,i) => { return v[1]; });
    } catch(err) {
        return utils.handleError(res, 400, 'Bad input data');
    }

    console.log(`[CHART ADAPTER] - Chart request for region ${region}`);
    await handleChartResponse(res, region, labels, data);
}

// Function to handle the responses from the endpoint.
async function handleChartResponse(res, region, labels, data) {
    const params = {
        type : 'line',
        data : {
            labels : labels,
            datasets: [{
                label: `New Infected in ${region}`,
                data: data
            }]
        }
    };
    
    const chart = await fetch(`${BASE_URL}${JSON.stringify(params)}`).then((resFetch) => {
        // .buffer() because we receive an image from fetch function.
        return resFetch.buffer();
    });

    // Set the right content type (without this, the chart is downloaded)
    // and send the data to the client.
    console.log(`[CHART ADAPTER] - Done\n`);
    res.set('Content-Type', 'image/png').status(200).send(chart);
}

// Register endpoint.
exports.register = (app) => {
    app.get('/chart-image/:region?', handleChartRequest);
};