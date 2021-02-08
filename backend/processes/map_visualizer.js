const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle the requests for the map visualizer endpoint.
const handleMapRequest = async (req, res) => {
    const region = req.params.region;
    const date = utils.getDate(req.query.date);

    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        res.status(404);
        res.send('No data for region ' + region);
        return;
    }

    // Check if date is well-defined and not in the future.
    if (date === undefined || !utils.isValidDate(date)) {
        res.status(400);
        res.send(date + ' is not a valid date');
        return;
    }

    await handleMapResponse(res, region, date);
}

// Function to handle the response from the map visualizer endpoint.
async function handleMapResponse(res, region, date) {
    const regionQuery = utils.BASE_URL + 'region-mapper/' + region + '?date=' + date;
    const provinceData = await fetch(regionQuery).then(resFetch => {
        return resFetch.json();
    }).then(JSONdata => {
        // TODO check if undefined?
        return JSONdata[region][0].provinces;
    });

    const locations = locationsMapper(provinceData);
    
    const imageQuery = utils.BASE_URL + 'map-image/' + region + '?data=' + locations;
    const map = await fetch(imageQuery).then((resFetch) => {
        // .buffer() because we receive an image from fetch function.
        return resFetch.buffer();
    });

    // Set the right content type.
    res.set('Content-Type', 'image/png');
    res.status(200);
    res.send(map);
}

// Function to format the data as location name => number of cases
// and return it as string.
function locationsMapper(data) {
    const result = [];
    for (const key in data) {
        result.push([key, data[key].cases]);
    }
    return JSON.stringify(result);
}

exports.register = app => {
    app.get('/map/:region?', handleMapRequest);
};
