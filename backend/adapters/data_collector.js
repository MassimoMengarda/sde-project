const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Function to handle the requests to the endpoint. 
const handleDataRequest = async (req, res) => {
    const date = utils.getDate(req.query.date);
    const from = utils.getDate(req.query.from);
    const to = utils.getDate(req.query.to);

    const inputRegions = regions.getRegions();

    // Check whether we need to get all the data or only by period or by date.
    if (utils.isValidDate(date)) {
        console.log(`[DATA COLLECTOR] - Request for data in date ${date}\n`);
        await handleResponseByDate(res, date, inputRegions);
    } else if (utils.isValidDate(from) && utils.isValidDate(to)) {
        console.log(`[DATA COLLECTOR] - Request for data between ${from} and ${to}\n`);
        await handleResponseByPeriod(res, from, to, inputRegions);
    } else {
        console.log(`[DATA COLLECTOR] - Request for all data\n`);
        await handleResponseAllData(res, inputRegions);
    }
}

// Function to handle the requests for a specific region. 
const handleDataByRegionRequest = async (req, res) => {
    const region = req.params.region;

    const date = utils.getDate(req.query.date);
    const from = utils.getDate(req.query.from);
    const to = utils.getDate(req.query.to);

    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    const inputRegions = [region];

    // Check whether we need to get all the data or only by period or by date.
    if (utils.isValidDate(date)) {
        console.log(`[DATA COLLECTOR] - Request for data in date ${date}\n`);
        await handleResponseByDate(res, date, inputRegions);
    } else if (utils.isValidDate(from) && utils.isValidDate(to)) {
        console.log(`[DATA COLLECTOR] - Request for data between ${from} and ${to}\n`);
        await handleResponseByPeriod(res, from, to, inputRegions);
    } else {
        console.log(`[DATA COLLECTOR] - Request for all data\n`);
        await handleResponseAllData(res, inputRegions);
    }
}

// Function that fetches all the endpoints and process the data.
async function handleResponseByDate(res, date, inputRegions) {
    console.log(`[DATA COLLECTOR] - Fetching all the endpoints`)

    // Fetch the endpoints.
    const result = {}
    for (const region of inputRegions) {
        result[region] = await getDataByDates(region, date, date);
        if (result[region] === undefined) {
            return utils.handleError(res, 500, 'Internal error, cannot fetch data');
        }
    }

    // Send the data to the client with response code 200.
    console.log(`[DATA COLLECTOR] - Done`);
    res.status(200).send(result);
}

// Function to handle responses of periods of time.
async function handleResponseByPeriod(res, from, to, inputRegions) {
    // Prepare results.
    const result = {};
    for (const region of inputRegions) {
        result[region] = await getDataByDates(region, from, to);
        if (result[region] === undefined) {
            return utils.handleError(res, 500, 'Internal error, cannot fetch data');
        }
    }

    // Send the data to the client wih response code 200.
    console.log(`[DATA COLLECTOR] - Done`);
    res.status(200).send(result);
}

// Function that fetches all the endpoints and process the data.
async function handleResponseAllData(res, inputRegions) {
    console.log(`[DATA COLLECTOR] - Fetching all the endpoints`)

    // Fetch the endpoints.
    const result = {}
    
    for (const region of inputRegions) {
        result[region] = await fetchEndPoint(region);
        if (result[region] === undefined) {
            return utils.handleError(res, 500, 'Internal error, cannot fetch data');
        }
    }

    // Send the data to the client with response code 200.
    console.log(`[DATA COLLECTOR] - Done`);
    res.status(200).send(result);
}

// Function to handle the requests for the latest data. 
const handleLatestDataRequest = async (req, res) => {
    const region = req.params.region;

    console.log(`[DATA COLLECTOR] - Request for latest data\n`);

    // Check if region is valid, but we accept undefined.
    if (region !== undefined && !regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    const inputRegions = region === undefined ? regions.getRegions() : [region];

    await handleResponseLatest(res, inputRegions);
}

// Function to handle the responses for the latest data. 
async function handleResponseLatest(res, inputRegions) {
    // Fetch the endpoints.
    const result = {}
    for (const region of inputRegions) {
        const query = `${utils.BASE_URL}/db/latest/${region}`
        const latestData = await utils.fetchJSON(query);

        result[region] = latestData[region];

        if (Object.keys(latestData[region]).length === 0) {
            return utils.handleError(res, 404, 'No data found in database');
        }
    }

    // Send the data to the client with response code 200.
    console.log(`[DATA COLLECTOR] - Done`);
    res.status(200).send(result);
}

// Function that retieves region data by dates.
async function getDataByDates(endPoint, from, to) {
    // If final date is present I can assume all the dates before that are present too.
    const inDB = await isInDB(endPoint, to);
    if (inDB) {
        // I know data is in the database.
        const query = `${utils.BASE_URL}/db/${endPoint}?from=${from}&to=${to}`;
        const dbEntries = await utils.fetchJSON(query);
        return dbEntries[endPoint];
    } else {
        // Get dates between from and to.
        const dates = utils.getDatesBetween(from, to);
        const endPointData = await fetchEndPoint(endPoint);
        if (endPointData === undefined) {
            return undefined;
        }
        
        const result = [];
        for (const entry of endPointData) {
            if (dates.includes(entry.date)) {
                result.push(entry);
            }
        }
        return result;
    }
}

// Function that given the name of an endpoint, it fetches and returns the data.
async function fetchEndPoint(endPoint) {
    const fetchedData = await utils.fetchJSON(`${utils.BASE_URL}/${endPoint}`);
    if (Object.keys(fetchedData).length == 0) {
        return undefined;
    }

    const data = fetchedData[endPoint];

    // Post data on database adapter.
    console.log(`[DATA COLLECTOR] - Updating db for endpoint ${endPoint}`);
    await fetch(`${utils.BASE_URL}/db/${endPoint}`, {
        method: 'post',
        body:    JSON.stringify({data: data}),
        headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`[DATA COLLECTOR] - Done updating\n`);
    return data;
}

// Function to check if a date is present as record in a db of a given endpoint.
async function isInDB(endPoint, date) {
    const query = `${utils.BASE_URL}/db/${endPoint}?from=${date}&to=${date}`;
    const result = await fetch(query).then(resFetch => {
        return resFetch.ok;
    });
    return result;
}

// Register endpoint.
exports.register = app => {
    app.get('/data', handleDataRequest);
    app.get('/data/latest/:region?', handleLatestDataRequest);
    app.get('/data/:region', handleDataByRegionRequest);
};
