const fetch = require('node-fetch');
const utils = require('../utils/utils');

// areaType is region, but it could be utla (too detailed)
const BASE_URL = 'https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=region&structure' + 
                 '={"date":"date","name":"areaName","cases":"newCasesByPublishDate"}&format=json';

// Function that retrieves the whole uk dataset.
// The data is filtered using the filter function.
const handleDataRequest = async (req, res) => {
    console.log('Starting fetching UK dataset...');

    // Fetch the number of pages (the offset cannot be removed).
    const pages = await fetch(BASE_URL).then(resFetch => {
        // Return the data as json.
        return resFetch.json();
    }).then(resJSON => {
        // Take the number of pages (at most 2 digits, remove = if only 1)
        return parseInt(resJSON.pagination.last.slice(-2).replace('=',''));
    });
    
    // Fetch and filter the data.
    const data = await filter(pages);

    // Send the data to the client wih response code 200.
    console.log('Done fetching\nSending data...');
    res.status(200);
    res.send({result: data});
    console.log('Done!\n');
}

// Function to retrieve and filter the data.
// As result it returns a json with date as main objects.
async function filter(pages) {
    const resultBuilder = {};

    // Fetch all the pages.
    for (let i = 1; i <= pages; i++) {
        const query = BASE_URL + '&page=' + i;

        // Fetch the i-th page and parse it to json.
        const entries = await fetch(query).then(resFetch => {
            return resFetch.json();
        }).then(resJSON => {
            return resJSON.data;
        });

        // Filter only data, province and cases.
        for (const elem of entries) {
            const date = elem['date'];
            let province = elem['name'];
            let cases = elem['cases'];

            // Skip the rows that are not well defined.
            if (date !== undefined && province !== undefined && cases !== undefined) {
                province = province.replace(/\./g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                cases = parseInt(cases);
                if (resultBuilder[date] === undefined) {
                    resultBuilder[date] = {provinces : {}, cases: 0};
                }
                resultBuilder[date].provinces[province] = {cases: cases};
                resultBuilder[date].cases += cases;
            }
        }
    }
    
    const result = utils.dataFormatter(resultBuilder);
    return result;
}

// Export the function to register the endpoint.
exports.register = app => {
    app.get('/uk', handleDataRequest);
};
