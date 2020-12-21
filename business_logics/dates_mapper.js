const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// TODO set in a config file.
const BASE_URL = 'http://localhost:8080/';

const getDataByRegion = async (req, res) => {
    const region = req.params.region;
    const date1 = utils.getDate(req.query.date1);
    const date2 = utils.getDate(req.query.date2);

    // Check if region is valid
    if (region !== undefined || !regions.isValidRegion(region)) {
        res.status(404);
        res.send('No data for region ' + region);
        return;
    }

    // TODO other checks (date validity)
    // Check if dates are defined
    if (date1 === undefined || date2 === undefined) {
        res.status(400);
        res.send('Select valid dates');
        return;
    }

    // TODO workaround?
    const query = BASE_URL + 'data?date1=' + date1 + '&date2=' + date2;
    const data = await fetch(query).then(fetch_res => {
        return fetch_res.json();
    });

    const result = {};
    result[region] = data[region];

    res.status(200);
    res.send(result);
}

// TODO: better :region? instead of :region for better error handling? 
exports.register = app => {
    app.get('/dates-mapper/:region?', getDataByRegion);
};
