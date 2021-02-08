const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle requests for the endpoint.
const handleDataRequest = async (req, res) => {
    const region = req.params.region;
    const date1 = utils.getDate(req.query.date1);
    const date2 = utils.getDate(req.query.date2);

    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        res.status(404);
        res.send('No data for region ' + region);
        return;
    }

    // Check if dates are well-defined.
    if (date1 === undefined || !utils.isValidDate(date1)) {
        res.status(400);
        res.send(date1 + 'is not a valid date');
        return;
    }

    if (date2 === undefined || !utils.isValidDate(date2)) {
        res.status(400);
        res.send(date1 + 'is not a valid date');
        return;
    }

    await handleDataResponse(res, region, date1, date2);
}

// Function to handle responses from the endpoint.
async function handleDataResponse(res, region, date1, date2) {
    const query = utils.BASE_URL + 'data?date1=' + date1 + '&date2=' + date2;
    const data = await fetch(query).then(resFetch => {
        return resFetch.json();
    });

    // Prepare the results.
    const result = {};
    result[region] = data[region];

    res.status(200);
    res.send(result);
}

exports.register = app => {
    app.get('/dates-mapper/:region?', handleDataRequest);
};
