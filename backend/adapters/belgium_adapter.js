const utils = require('../utils/utils');

const BASE_URL = 'https://epistat.sciensano.be/Data/COVID19BE_CASES_MUNI.json';

// Function that retrieves the whole belgium dataset.
// The data is filtered using the filter function.
const handleDataRequest = async (req, res) => {
    console.log(`[BELGIUM ADAPTER] - Starting fetching dataset`);

    // Fetch the data in the html page and filter the results.
    const fetchedData = await utils.fetchJSON(BASE_URL);
    if (Object.keys(fetchedData).length === 0) {
        return utils.handleError(res, 500, `Cannot contact belgian database\n`);
    }

    const data = filter(fetchedData)
    
    // Send the data to the client wih response code 200.
    console.log(`[BELGIUM ADAPTER] - Done\n`);
    res.status(200).send({'belgium' : data});
}

// Function to filter the retrieved data.
// As result is returns a json with date as main objects.
function filter(data) {
    const resultBuilder = {};

    // Filter only data, province and cases.
    for (const elem of data) {
        const date = elem['DATE'];
        let province = elem['PROVINCE'];
        let cases = elem['CASES'];

        // Skip the rows that are not well defined.
        if (date !== undefined && province !== undefined && cases !== undefined) {
            province = province.replace(/\./g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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

// Register endpoint.
exports.register = app => {
    app.get('/belgium', handleDataRequest);
};
