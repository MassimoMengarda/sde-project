const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle the requests for the map visualizer endpoint.
const handleChartRequest = async (req, res) => {
    const region = req.params.region;
    const date1 = utils.getDate(req.query.date1);
    const date2 = utils.getDate(req.query.date2);

    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        res.status(404);
        res.send(`No data for region ${region}`);
        return;
    }

    // Check if date1 is well-defined.
    if (date1 === undefined || !utils.isValidDate(date1)) {
        res.status(400);
        res.send(`${date1} is not a valid date`);
        return;
    }

    // Check if date2 is well-defined.
    if (date2 === undefined || !utils.isValidDate(date2)) {
        res.status(400);
        res.send(`${date2} is not a valid date`);
        return;
    }

    console.log(`[CHART VISUALIZER] - Chart request for region ${region} and dates ${date1} and ${date2}`);
    await handleChartResponse(res, region, date1, date2);
}

// Function to handle the response from the map visualizer endpoint.
async function handleChartResponse(res, region, date1, date2) {
    const datesQuery = `${utils.BASE_URL}/dates-mapper/${region}?date1=${date1}&date2=${date2}`;
    const dates = await fetch(datesQuery).then(resFetch => {
        return resFetch.json();
    }).then(JSONdata => {
        return JSONdata[region];
    });

    const data = dataMapper(dates);
    
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
