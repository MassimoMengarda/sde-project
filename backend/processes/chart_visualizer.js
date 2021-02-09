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
        res.status(404);
        res.send(`No data for region ${region}`);
        return;
    }

    // Check if from is well-defined.
    if (from === undefined || !utils.isValidDate(from)) {
        res.status(400);
        res.send(`${from} is not a valid date`);
        return;
    }

    // Check if to is well-defined.
    if (to === undefined || !utils.isValidDate(to)) {
        res.status(400);
        res.send(`${to} is not a valid date`);
        return;
    }

    console.log(`[CHART VISUALIZER] - Chart request for region ${region} and dates ${from} and ${to}`);
    await handleChartResponse(res, region, from, to);
}

// Function to handle the response from the map visualizer endpoint.
async function handleChartResponse(res, region, from, to) {
    const datesQuery = `${utils.BASE_URL}/dates-mapper/${region}?from=${from}&to=${to}`;
    const dates = await fetch(datesQuery).then(resFetch => {
        if (!resFetch.ok) {
            throw resFetch;
        }
        return resFetch.json();
    }).then(JSONdata => {
        return JSONdata[region];
    }).catch(err => {
        return {};
    });

    const data = dataMapper(dates);
    
    // TODO check if no data has been provided
    const chartQuery = `${utils.BASE_URL}/chart-image/${region}?data=${data}`;
    const chart = await fetch(chartQuery).then((resFetch) => {
        // .buffer() because we receive an image from fetch function.
        return resFetch.buffer();
    });

    // Set the right content type.
    res.set('Content-Type', 'image/png');
    res.status(200);
    res.send(chart);
    console.log(`[CHART VISUALIZER] - Done\n`);
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

exports.register = app => {
    app.get('/chart/:region?', handleChartRequest);
};
