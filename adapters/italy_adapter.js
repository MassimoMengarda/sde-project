const fetch = require('node-fetch');
const parse = require('csv-parse/lib/sync');

const BASE_URL = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-regioni/dpc-covid19-ita-regioni.csv';

const getData = async (req, res) => {
    console.log('Starting fetching Italy dataset...');
    const data = await fetch(BASE_URL).then(fetch_res => {
        const csv_data = parse(fetch_res.text(), {columns: true});
        return csv_data;
    });
    //console.log(data);
    // .then(resJSON => {
    //     console.log('Done fetching\nElaborating...');
    //     const result = filter(resJSON);
    //     return {result: result};
    // });

    console.log('Sending data...');
    res.status(200);
    res.send(data);
    console.log('Done!');
}

function filter(data) {
    const result = {};

    for (const elem of data) {
        const date = elem.DATE;
        const province = elem.PROVINCE;
        let cases = elem.CASES;

        if (date !== undefined && province !== undefined && cases !== undefined) {
            if (result[date] === undefined) {
                result[date] = {};
            }
            if (result[date][province] === undefined) {
                result[date][province] = {cases: 0};
            }
            if (cases === '<5') {
                cases = Math.round(Math.random() * 5);
            }
            result[date][province].cases += parseInt(cases);
        }
    }
    return result;
}

exports.register = app => {
    app.get('/italy', getData);
};