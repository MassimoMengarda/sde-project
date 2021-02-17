const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle the requests for the map visualizer endpoint.
const handleMapRequest = async (req, res) => {
    const region = req.params.region;
    const date = utils.getDate(req.query.date);
    
    console.log(`[MAP VISUALIZER] - Map request for region ${region} and date ${date}`);
    
    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    // Check if date is well-defined and not in the future.
    if (!utils.isValidDate(date)) {
        return utils.handleError(res, 400, `${date} is not a valid date`);
    }

    await handleMapResponse(res, region, date);
}

// Function to handle the response from the map visualizer endpoint.
async function handleMapResponse(res, region, date) {
    const query = `${utils.BASE_URL}/region-mapper/${region}?date=${date}`;
    const fetchedData = await utils.fetchJSON(query);

    // Check if no data has been provided.
    // if (Object.keys(fetchedData).length === 0 || fetchedData[region].length === 0) {
    //     return utils.handleError(res, 404, `No data has been found for date ${date}`);
    // }
    
    const imageQuery = `${utils.BASE_URL}/map-image/${region}?data=${JSON.stringify(fetchedData)}`;
    const map = await fetch(imageQuery).then(resFetch => {
        // .buffer() because we receive an image from fetch function.
        return resFetch.buffer();
    });

    // Set the right content type.
    console.log(`[MAP VISUALIZER] - Done\n`);
    res.set('Content-Type', 'image/png').status(200).send(map);
}

// Register endpoint.
exports.register = app => {
    app.get('/map/:region?', handleMapRequest);
};
