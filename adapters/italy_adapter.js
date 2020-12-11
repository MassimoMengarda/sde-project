const fetch = require('node-fetch');

const BASE_URL = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-regioni/dpc-covid19-ita-regioni.csv';

const getData = async (req, res) => {
    console.log('Starting fetching Italy dataset...');
    const data = await fetch(BASE_URL).then(fetch_res => {
        return fetch_res.text();
    }).then(resCSV => {
        console.log('Done fetching\nElaborating...');
        let result = [];
        const lines = resCSV.toString().split('\n');
        if (lines.length > 0) {
            const headers = lines[0].split(',');
            for (const line of lines) {
                const obj = {};
                const fields = line.split(',');

                for (let i = 0; i < headers.length; i++) {
                    obj[headers[i]] = fields[i];
                }
                result.push(obj);
            }
        }
        return { result: filter(result) };
    });

    console.log('Sending data...');
    res.status(200);
    res.send(data);
    console.log('Done!');
};

function filter(data) {
    const result = {};

    data.shift(); // Skip header
    for (const elem of data) {
        let date = elem.data;
        const province = elem.denominazione_regione;
        const cases = elem.nuovi_positivi;

        if (date !== undefined && province !== undefined && cases !== undefined) {
            date = date.substring(0, 10);
            if (result[date] === undefined) {
                result[date] = {};
            }
            result[date][province] = {cases: cases};
        }
    }
    return result;
}

exports.register = app => {
    app.get('/italy', getData);
};