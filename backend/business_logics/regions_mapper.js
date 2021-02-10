const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle the requests for the endpoint.
const handleDataRequest = async (req, res) => {
    const region = req.params.region;
    const date = utils.getDate(req.query.date);

    // Check if region is valid
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    // Check if date is well-defined.
    if (date === undefined || !utils.isValidDate(date)) {
        return utils.handleError(res, 400, `${date} is not a valid date`);
    }

    console.log(`[REGIONS MAPPER] - Request for region ${region} and date ${date}`);
    await handleDataResponse(res, region, date);
}

// Function to handle the responses from the endpoint.
async function handleDataResponse(res, region, date) {
    const query = `${utils.BASE_URL}/data?from=${date}&to=${date}`;
    const data = await utils.fetchJSON(query);

    if (Object.keys(data).length === 0 || Object.keys(data[region]).length === 0) {
        return utils.handleError(res, 404, `No data has been found for date ${date}`);
    }

    // Prepare the results.
    let result = {};
    result[region] = data[region];
    
    console.log(`[REGIONS MAPPER] - Done\n`);
    res.status(200).send(result);
}

exports.register = app => {
    app.get('/region-mapper/:region?', handleDataRequest);
};
