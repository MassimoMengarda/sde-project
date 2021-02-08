const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle the requests to the endpoint. 
const handleDataRequest = async (req, res) => {
    const date1 = utils.getDate(req.query.date1);
    const date2 = utils.getDate(req.query.date2);

    // Check whether we need to get all the data or only by period.
    if (date1 === undefined || date2 === undefined || !utils.isValidDate(date1) || !utils.isValidDate(date2)) {
        console.log(`[DATA COLLECTOR] - Request for all data\n`);
        await handleResponseAllData(res);
    } else {console.log(`[DATA COLLECTOR] - Request for data between ${date1} and ${date2}\n`);
        await handleResponseByPeriod(res, date1, date2);
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

async function handleResponseByPeriod(res, date1, date2) {
    // Order dates.
    const initialDate = date1 <= date2 ? date1 : date2;
    const finalDate = date1 > date2 ? date1 : date2;
    
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
        const query = utils.BASE_URL + 'db/' + endPoint + '?date1=' + initialDate + '&date2=' + finalDate;
        const dbEntries = await fetch(query).then(resFetch => {
            return resFetch.json();
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
    const data = await fetch(utils.BASE_URL + endPoint).then(resFetch => {
        return resFetch.json();
    });

    // Post data on database adapter.
    console.log(`[DATA COLLECTOR] - Updating db for endpoint ${endPoint}`);
    await fetch(utils.BASE_URL + 'db/' + endPoint, {
        method: 'post',
        body:    JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`[DATA COLLECTOR] - Done updating\n`);
    return data;
}

// Function to check if a date is present as record in a db of a given endpoint.
async function isInDB(endPoint, date) {
    const query = utils.BASE_URL + 'db/' + endPoint + '?date1=' + date;
    const result = await fetch(query).then(resFetch => {
        return resFetch.json();
    }).then(resJSON => {
        // If length == 0 it is not present.
        return resJSON.result.length !== 0
    });
    return result;
}

// Export the function to register the endpoint.
exports.register = app => {
    app.get('/data', handleDataRequest);
};
