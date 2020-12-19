const fetch = require('node-fetch');
const utils = require('./utils');

// TODO set in a config file.
const BASE_URL = 'http://localhost:8080/';

// Function that fetches all the endpoints and process the data.
const getAllData = async (req, res) => {
    console.log('Fetching all the endpoints')

    // Fetch the endpoints.
    const belgiumData = await fetchEndPoint('belgium');
    const italyData = await fetchEndPoint('italy');
    const ukData = await fetchEndPoint('uk');
    
    // TODO process -> wikipedia and database.
    const result = {
        belgium: belgiumData,
        italy: italyData,
        uk: ukData
    }

    // Send the data to the client wih response code 200.
    res.status(200);
    res.send(result);
}

const getDataByPeriod = async (req, res) => {
    const date1 = utils.getDate(req.query.date1);
    const date2 = utils.getDate(req.query.date2);

    // Check whether the query params are not well-defined.
    if (date1 === undefined || date2 === undefined) {
        await getAllData(req, res);
        return;
    }

    // Get dates between data1 and date2.
    const dates = utils.getDatesBetween(date1, date2);

    // Check if data ranges is valid.
    // TODO check must be done before in order to avoid dos.
    const firstDate = new Date(dates[0]);
    const lastDate = new Date(dates[dates.length - 1]);
    if (firstDate < new Date('2020-01-01') || lastDate >= new Date()) {
        res.status(400);
        res.send('Input dates are not valid (cannot select data before year 2020');
        return;
    } 
    
    const result = {
        belgium: {},
        italy: {},
        uk: {}
    };

    // Get the data by dates.
    result.belgium = await getDataByDates('belgium', dates);
    result.italy = await getDataByDates('italy', dates);
    result.uk = await getDataByDates('uk', dates);

    // Send the data to the client wih response code 200.
    res.status(200);
    res.send(result);
}

// Function that retieves region data by dates.
async function getDataByDates(endPoint, dates) {
    const result = {}
    // TODO check if data is present in database for region
    if (false) {
        // TODO retrieve from database
    } else {
        const endPointData = await fetchEndPoint(endPoint);
        for (const date of dates) {
            result[date] = endPointData.result[date];
        }
    }
    return result;
}

// Function that given the name of an endpoint, it fetches and returns the data.
async function fetchEndPoint(endPoint) {
    const data = await fetch(BASE_URL + endPoint).then(fetch_res => {
        return fetch_res.json();
    });

    console.log('Updating db for endpoint ' + endPoint);
    await fetch(BASE_URL + 'db/' + endPoint, {
        method: 'post',
        body:    JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });

    return data;
}

// Export the function to register the endpoint.
exports.register = app => {
    app.get('/data', getDataByPeriod);
};