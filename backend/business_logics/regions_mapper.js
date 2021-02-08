const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle the requests for the endpoint.
const handleDataRequest = async (req, res) => {
    const region = req.params.region;
    const date = utils.getDate(req.query.date);

    // Check if region is valid
    if (!regions.isValidRegion(region)) {
        res.status(404);
        res.send(`No data for region ${region}`);
        return;
    }

    // Check if date is well-defined.
    if (date === undefined || !utils.isValidDate(date)) {
        res.status(400);
        res.send(`${date} is not a valid date`);
        return;
    }

    console.log(`[REGIONS MAPPER] - Request for region ${region} and date ${date}`);
    await handleDataResponse(res, region, date);
}

// Function to handle the responses from the endpoint.
async function handleDataResponse(res, region, date) {
    // TODO workaround, bad input parameters names
    const query = `${utils.BASE_URL}/data?date1=${date}&date2=${date}`;
    const data = await fetch(query).then(resFetch => {
        return resFetch.json();
    });

    // Prepare the results.
    let result = {};
    if (region === undefined) {
        result = data;
    } else {
        result[region] = data[region];
    }

    res.status(200);
    res.send(result);
    console.log(`[REGIONS MAPPER] - Done\n`);
}

exports.register = app => {
    app.get('/region-mapper/:region?', handleDataRequest);
};
