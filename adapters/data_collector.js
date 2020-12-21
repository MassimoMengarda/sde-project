const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// TODO set in a config file.
const BASE_URL = 'http://localhost:8080/';

// Function that fetches all the endpoints and process the data.
const getAllData = async (req, res) => {
    console.log('Fetching all the endpoints')

    // Fetch the endpoints.
    const result = {}
    for (const region of regions.getRegions()) {
        result[region] = await fetchEndPoint(region);
    }

    // Send the data to the client with response code 200.
    res.status(200);
    res.send(result);
}

// Function that handles the endpoint's calls 
const getDataByPeriod = async (req, res) => {
    const date1 = utils.getDate(req.query.date1);
    const date2 = utils.getDate(req.query.date2);

    // Check whether the query params are not well-defined.
    if (date1 === undefined || date2 === undefined) {
        await getAllData(req, res);
        return;
    }

    // Order dates.
    const initialDate = date1 <= date2 ? date1 : date2;
    const finalDate = date1 > date2 ? date1 : date2;

    // Check if data ranges is valid.
    if (new Date(initialDate) < new Date('2020-01-01') || new Date(finalDate) >= new Date()) {
        res.status(400);
        res.send('Input dates are not valid (cannot select data before year 2020');
        return;
    } 
    
    // Prepare results.
    const result = {};
    for (const region of regions.getRegions()) {
        result[region] = await getDataByDates(region, initialDate, finalDate);
    }

    // Send the data to the client wih response code 200.
    res.status(200);
    res.send(result);
}

// Function that retieves region data by dates.
async function getDataByDates(endPoint, initialDate, finalDate) {
    // If final date is present I can assume all the dates before that are present too.
    const inDB = await isInDB(endPoint, finalDate);
    if (inDB) {
        const query = BASE_URL + 'db/' + endPoint + '?date1=' + initialDate + '&date2=' + finalDate;
        const dbEntries = await fetch(query).then(fetch_res => {
            return fetch_res.json();
        });
        return dbEntries.result;
    } else {
        // Get dates between initialDate and finalDate.
        const dates = utils.getDatesBetween(initialDate, finalDate);
        const endPointData = await fetchEndPoint(endPoint);
        
        const result = [];
        for (const entry of endPointData.result) {
            if (dates.includes(entry.date)) {
                result.push(entry);
            }
        }
        return result;
    }
}

// Function that given the name of an endpoint, it fetches and returns the data.
async function fetchEndPoint(endPoint) {
    const data = await fetch(BASE_URL + endPoint).then(fetch_res => {
        return fetch_res.json();
    });

    // Post data on database adapter.
    console.log('Updating db for endpoint ' + endPoint);
    await fetch(BASE_URL + 'db/' + endPoint, {
        method: 'post',
        body:    JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
    console.log('Done updating');

    return data;
}

// Function to check if a date is present as record in a db of a given endpoint.
async function isInDB(endPoint, date) {
    const query = BASE_URL + 'db/' + endPoint + '?date1=' + date;
    const result = await fetch(query).then(fetch_res => {
        return fetch_res.json();
    }).then(resJSON => {
        // If length == 0 it is not present.
        return resJSON.result.length !== 0
    });
    return result;
}

// Export the function to register the endpoint.
exports.register = app => {
    app.get('/data', getDataByPeriod);
};
