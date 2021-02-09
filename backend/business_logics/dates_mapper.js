const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle requests for the endpoint.
const handleDataRequest = async (req, res) => {
    const region = req.params.region;
    const from = utils.getDate(req.query.from);
    const to = utils.getDate(req.query.to);

    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        res.status(404);
        res.send(`No data for region ${region}`);
        return;
    }

    // Check if dates are well-defined.
    if (from === undefined || !utils.isValidDate(from)) {
        res.status(400);
        res.send(`${from} is not a valid date`);
        return;
    }

    if (to === undefined || !utils.isValidDate(to)) {
        res.status(400);
        res.send(`${to} is not a valid date`);
        return;
    }

    console.log(`[DATES MAPPER] - Request for ${region} and dates ${from} - ${to}`);
    await handleDataResponse(res, region, from, to);
}

// Function to handle responses from the endpoint.
async function handleDataResponse(res, region, from, to) {
    const query = `${utils.BASE_URL}/data?from=${from}&to=${to}`;
    const data = await fetch(query).then(resFetch => {
        if (!resFetch.ok) {
            throw resFetch;
        }
        return resFetch.json();
    }).catch(err => {
        return {};
    });

    // Prepare the results.
    const result = {};
    result[region] = data[region];

    console.log(`[DATES MAPPER] - Done\n`);
    if (Object.keys(result).length === 0 || Object.keys(result[region]).length === 0) {
        res.status(404);
        res.send(`No data has been found for date ${from}`);
        return;
    }

    res.status(200);
    res.send(result);
}

exports.register = app => {
    app.get('/dates-mapper/:region?', handleDataRequest);
};
