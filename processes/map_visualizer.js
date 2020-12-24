const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// TODO set in a config file.
const BASE_URL = 'http://localhost:8080/';

const getRegion = async (req, res) => {
    const region = req.params.region;
    const date = utils.getDate(req.query.date);

    // Check if region is valid
    if (region === undefined || !regions.isValidRegion(region)) {
        res.status(404);
        res.send('No data for region ' + region);
        return;
    }

    // TODO other checks (date validity)
    // Check if dates are defined
    if (date === undefined) {
        res.status(400);
        res.send('Select a valid date');
        return;
    }

    const query = BASE_URL + 'region-mapper/' + region + '?date=' + date;
    const provinceData = await fetch(query).then(fetch_res => {
        return fetch_res.json();
    }).then(JSONdata => {
        // TODO check if undefined?
        return JSONdata[region][0].provinces;
    });

    const locations = locationsBuilder(provinceData);
    
    const query2 = BASE_URL + 'map/' + region + '?data=' + locations;
    const map = await fetch(query2).then((fetch_res) => {
        // .buffer() because we receive an image from fetch function
        return fetch_res.buffer();
    });

    // Set the right content type
    res.set('Content-Type', 'image/png');
    res.status(200);
    res.send(map);
}

function locationsBuilder(data) {
    const result = [];
    for (const key in data) {
        result.push([key, data[key].cases]);
    }
    return JSON.stringify(result);
}

// TODO: better :region? instead of :region for better error handling? 
exports.register = app => {
    app.get('/tmpmap/:region', getRegion);
};
