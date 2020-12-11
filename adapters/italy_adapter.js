const fetch = require('node-fetch');

const BASE_URL = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-regioni/dpc-covid19-ita-regioni.csv';

// Function that retrieves the whole italian dataset.
// The dataset is initially in csv form and then parsed to json.
// The data is then filtered using the filter function.
const getData = async (req, res) => {
    console.log('Starting fetching Italy dataset...');

    // Fetch the data in the html page.
    const data = await fetch(BASE_URL).then(fetch_res => {
        // Since data is csv, we return it as string.
        return fetch_res.text();
    }).then(resCSV => {
        console.log('Done fetching\nElaborating...');
        let result = [];

        // Split the data in lines.
        const lines = resCSV.toString().split('\n');
        if (lines.length > 0) {

            // The first line represents the header.
            const headers = lines[0].split(',');

            // Build the json from the csv.
            for (const line of lines) {
                const obj = {};
                const fields = line.split(',');

                for (let i = 0; i < headers.length; i++) {
                    obj[headers[i]] = fields[i];
                }
                result.push(obj);
            }
        }
        // Filter the data.
        return { result: filter(result) };
    });

    // Send the data to the client wih response code 200.
    console.log('Sending data...');
    res.status(200);
    res.send(data);
    console.log('Done!');
};

// Function to filter the retrieved data.
// As result is returns a json with date as main objects.
function filter(data) {
    const result = {};

    // Skip the header.
    data.shift();

    // Filter only data, province and cases.
    for (const elem of data) {
        let date = elem.data;
        const province = elem.denominazione_regione;
        const cases = elem.nuovi_positivi;

        // Skip the rows that are not well defined.
        if (date !== undefined && province !== undefined && cases !== undefined) {
            // e.g. 2020-12-10T15:30:00, take only date.
            date = date.substring(0, 10);

            if (result[date] === undefined) {
                result[date] = {};
            }
            result[date][province] = {cases: cases};
        }
    }
    return result;
}

// Export the function to register the endpoint.
exports.register = app => {
    app.get('/italy', getData);
};