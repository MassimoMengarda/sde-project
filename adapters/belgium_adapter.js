const fetch = require('node-fetch');
const utils = require('../utils/utils');

const BASE_URL = 'https://epistat.sciensano.be/Data/COVID19BE_CASES_MUNI.json';

// Function that retrieves the whole belgium dataset.
// The data is filtered using the filter function.
const getData = async (req, res) => {
    console.log('Starting fetching Belgium dataset...');

    // Fetch the data in the html page and filter the results.
    const data = await fetch(BASE_URL).then(fetch_res => {
        // Return the data as json.
        return fetch_res.json();
    }).then(resJSON => {
        console.log('Done fetching\nElaborating...');

        // Filter the results.
        const result = filter(resJSON);
        return {result: result};
    });

    // Send the data to the client wih response code 200.
    console.log('Sending data...');
    res.status(200);
    res.send(data);
    console.log('Done!');
}

// Function to filter the retrieved data.
// As result is returns a json with date as main objects.
function filter(data) {
    const resultBuilder = {};

    // Filter only data, province and cases.
    for (const elem of data) {
        const date = elem.DATE;
        let province = elem.PROVINCE;
        let cases = elem.CASES;

        // Skip the rows that are not well defined.
        if (date !== undefined && province !== undefined && cases !== undefined) {
            province = province.replace(/\./g, '');
            if (resultBuilder[date] === undefined) {
                resultBuilder[date] = {provinces : {}, cases: 0};
            }
            if (resultBuilder[date].provinces[province] === undefined) {
                resultBuilder[date].provinces[province] = {cases: 0};
            }
            // Cases can contain <5 string, randomize the data from 0 to 5.
            if (cases === '<5') {
                cases = Math.round(Math.random() * 5);
            } else {
                cases = parseInt(cases);
            }
            resultBuilder[date].provinces[province].cases += cases;
            resultBuilder[date].cases += cases;
        }
    }
    const result = utils.dataFormatter(resultBuilder);
    return result;
}

// Export the function to register the endpoint.
exports.register = app => {
    app.get('/belgium', getData);
};