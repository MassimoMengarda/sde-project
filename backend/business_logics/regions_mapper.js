const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

const getDataByDate = async (req, res) => {
    const region = req.params.region;
    const date = utils.getDate(req.query.date);

    // Check if date is well-defined.
    if (date === undefined) {
        res.status(400);
        res.send('Select a valid date');
        return;
    }

    // Check if region is valid
    if (!regions.isValidRegion(region)) {
        res.status(404);
        res.send('No data for region ' + region);
        return;
    }

    // TODO workaround, bad input parameters names
    const query = utils.BASE_URL + 'data?date1=' + date + '&date2=' + date;
    const data = await fetch(query).then(fetch_res => {
        return fetch_res.json();
    });

    let result = {};

    if (region === undefined) {
        result = data;
    } else {
        result[region] = data[region];
    }

    res.status(200);
    res.send(result);
}

exports.register = app => {
    app.get('/region-mapper/:region?', getDataByDate);
};
