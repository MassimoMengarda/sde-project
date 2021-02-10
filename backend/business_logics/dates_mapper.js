const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle requests for the endpoint.
const handleDataRequest = async (req, res) => {
    const region = req.params.region;
    const from = utils.getDate(req.query.from);
    const to = utils.getDate(req.query.to);

    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    // Check if dates are well-defined.
    if (from === undefined || !utils.isValidDate(from)) {
        return utils.handleError(res, 400, `${from} is not a valid date`);
    }

    if (to === undefined || !utils.isValidDate(to)) {
        return utils.handleError(res, 400, `${to} is not a valid date`);
    }

    console.log(`[DATES MAPPER] - Request for ${region} and dates ${from} and ${to}`);
    await handleDataResponse(res, region, from, to);
}

// Function to handle responses from the endpoint.
async function handleDataResponse(res, region, from, to) {
    const query = `${utils.BASE_URL}/data?from=${from}&to=${to}`;
    const data = await utils.fetchJSON(query);

    if (Object.keys(data).length === 0 || data[region].length === 0) {
        return utils.handleError(res, 404, `No data has been found for date ${from}`);
    }
    
    // Prepare the results.
    const result = {};
    result[region] = data[region];
    
    console.log(`[DATES MAPPER] - Done\n`);
    res.status(200).send(result);
}

// Register endpoint.
exports.register = app => {
    app.get('/dates-mapper/:region?', handleDataRequest);
};
