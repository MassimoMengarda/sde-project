const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle the requests to the endpoint. 
const handleDataRequest = async (req, res) => {
    const from = utils.getDate(req.query.from);
    const to = utils.getDate(req.query.to);

    // Check whether we need to get all the data or only by period.
    if (from === undefined || to === undefined || !utils.isValidDate(from) || !utils.isValidDate(to)) {
        console.log(`[DATA COLLECTOR] - Request for all data\n`);
        await handleResponseAllData(res);
    } else {console.log(`[DATA COLLECTOR] - Request for data between ${from} and ${to}\n`);
        await handleResponseByPeriod(res, from, to);
    }
}

// Function that fetches all the endpoints and process the data.
async function handleResponseAllData(res) {
    console.log(`[DATA COLLECTOR] - Fetching all the endpoints`)

    // Fetch the endpoints.
    const result = {}
    for (const region of regions.getRegions()) {
        result[region] = await fetchEndPoint(region);
    }

    // Send the data to the client with response code 200.
    res.status(200);
    res.send(result);
    console.log(`[DATA COLLECTOR] - Done`);
}

async function handleResponseByPeriod(res, from, to) {
    // Order dates.
    const initialDate = from <= to ? from : to;
    const finalDate = from > to ? from : to;
    
    // Prepare results.
    const result = {};
    for (const region of regions.getRegions()) {
        result[region] = await getDataByDates(region, initialDate, finalDate);
    }

    // Send the data to the client wih response code 200.
    res.status(200);
    res.send(result);
    console.log(`[DATA COLLECTOR] - Done`);
}

// Function that retieves region data by dates.
async function getDataByDates(endPoint, initialDate, finalDate) {
    // If final date is present I can assume all the dates before that are present too.
    const inDB = await isInDB(endPoint, finalDate);
    if (inDB) {
        const query = `${utils.BASE_URL}/db/${endPoint}?from=${initialDate}&to=${finalDate}`;
        const dbEntries = await fetch(query).then(resFetch => {
            return resFetch.json();
        });
        return dbEntries.result;
    } else {
        // Get dates between initialDate and finalDate.
        const dates = utils.getDatesBetween(initialDate, finalDate);
        const endPointData = await fetchEndPoint(endPoint);
        
        const result = [];
        for (const entry of endPointData.data) {
            if (dates.includes(entry.date)) {
                result.push(entry);
            }
        }
        return result;
    }
}

// Function that given the name of an endpoint, it fetches and returns the data.
async function fetchEndPoint(endPoint) {
    const data = await fetch(`${utils.BASE_URL}/${endPoint}`).then(resFetch => {
        return resFetch.json();
    }).then(resJSON => {
        return {data : resJSON['result']};
    });

    // Post data on database adapter.
    console.log(`[DATA COLLECTOR] - Updating db for endpoint ${endPoint}`);
    await fetch(`${utils.BASE_URL}/db/${endPoint}`, {
        method: 'post',
        body:    JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`[DATA COLLECTOR] - Done updating\n`);
    return data;
}

// Function to check if a date is present as record in a db of a given endpoint.
async function isInDB(endPoint, date) {
    const query = `${utils.BASE_URL}/db/${endPoint}?from=${date}`;
    const result = await fetch(query).then(resFetch => {
        return resFetch.ok;
    });
    return result;
}

// Export the function to register the endpoint.
exports.register = app => {
    app.get('/data', handleDataRequest);
};
