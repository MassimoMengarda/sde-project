const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle the requests for the map visualizer endpoint.
const handleChartRequest = async (req, res) => {
    const region = req.params.region;
    const from = utils.getDate(req.query.from);
    const to = utils.getDate(req.query.to);

    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    // Check if from is well-defined.
    if (from === undefined || !utils.isValidDate(from)) {
        return utils.handleError(res, 400, `${from} is not a valid date`);
    }

    // Check if to is well-defined.
    if (to === undefined || !utils.isValidDate(to)) {
        return utils.handleError(res, 400, `${to} is not a valid date`);
    }

    console.log(`[CHART VISUALIZER] - Chart request for region ${region} and dates ${from} and ${to}`);
    await handleChartResponse(res, region, from, to);
}

// Function to handle the response from the map visualizer endpoint.
async function handleChartResponse(res, region, from, to) {
    const query = `${utils.BASE_URL}/dates-mapper/${region}?from=${from}&to=${to}`;
    const fetchedData = await utils.fetchJSON(query);

    if (Object.keys(fetchedData).length === 0) {
        return utils.handleError(res, 404, `No data has been found for date ${from}`);
    }

    const data = dataMapper(fetchedData[region]);
    
    const chartQuery = `${utils.BASE_URL}/chart-image/${region}?data=${data}`;
    const chart = await fetch(chartQuery).then((resFetch) => {
        // .buffer() because we receive an image from fetch function.
        return resFetch.buffer();
    });

    // Set the right content type.
    console.log(`[CHART VISUALIZER] - Done\n`);
    res.set('Content-Type', 'image/png').status(200).send(chart);
}

// Function to format the data as location name => number of cases
// and return it as string.
function dataMapper(data) {
    const result = [];
    for (const elem of data) {
        result.push([elem['date'], elem['cases']]);
    }
    return JSON.stringify(result);
}

// Register endpoint.
exports.register = app => {
    app.get('/chart/:region?', handleChartRequest);
};
