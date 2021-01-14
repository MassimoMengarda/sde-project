const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

const getRegion = async (req, res) => {
    const region = req.params.region;
    const date = utils.getDate(req.query.date);

    // Check if date is well-defined.
    if (date === undefined) {
        res.status(400);
        res.send('Select a valid date');
        return;
    }

    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        res.status(404);
        res.send('No data for region ' + region);
        return;
    }

    const regionQuery = utils.BASE_URL + 'region-mapper/' + region + '?date=' + date;
    const provinceData = await fetch(regionQuery).then(fetch_res => {
        return fetch_res.json();
    }).then(JSONdata => {
        // TODO check if undefined?
        return JSONdata[region][0].provinces;
    });

    const locations = locationsMapper(provinceData);
    
    const imageQuery = utils.BASE_URL + 'map-image/' + region + '?data=' + locations;
    const map = await fetch(imageQuery).then((fetch_res) => {
        // .buffer() because we receive an image from fetch function
        return fetch_res.buffer();
    });

    // Set the right content type
    res.set('Content-Type', 'image/png');
    res.status(200);
    res.send(map);
}

// Function to format the data as
// location name => number of cases
// and return it as string
function locationsMapper(data) {
    const result = [];
    for (const key in data) {
        result.push([key, data[key].cases]);
    }
    return JSON.stringify(result);
}

exports.register = app => {
    app.get('/map/:region?', getRegion);
};
