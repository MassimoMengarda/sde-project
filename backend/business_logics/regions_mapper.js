const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle the requests for the endpoint.
const handleDataRequest = async (req, res) => {
    const region = req.params.region;
    const date = utils.getDate(req.query.date);
    
    console.log(`[REGIONS MAPPER] - Request for region ${region} and date ${date}`);
    
    // Check if region is valid
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    // Check if date is well-defined.
    if (!utils.isValidDate(date)) {
        return utils.handleError(res, 400, `${date} is not a valid date`);
    }

    await handleDataResponse(res, region, date);
}

// Function to handle the responses from the endpoint.
async function handleDataResponse(res, region, date) {
    const query = `${utils.BASE_URL}/data/${region}?from=${date}&to=${date}`;
    const fetchedData = await utils.fetchJSON(query);

    if (Object.keys(fetchedData).length === 0 || Object.keys(fetchedData[region]).length === 0) {
        return utils.handleError(res, 404, `No data has been found for date ${date}`);
    }

    // Get the index of the date (0 because we have only 1 date)
    const provinces = fetchedData[region][0].provinces;
    
    // Prepare the results.
    const result = [];
    for (const key in provinces) {
        result.push([key, provinces[key].cases]);
    }
    
    console.log(`[REGIONS MAPPER] - Done\n`);
    res.status(200).send(result);
}

// Register endpoint.
exports.register = app => {
    app.get('/region-mapper/:region?', handleDataRequest);
};
