const fetch = require('node-fetch');

const BASE_URL = 'https://epistat.sciensano.be/Data/COVID19BE_CASES_MUNI.json';

const getData = async (req, res) => {
    console.log('Starting fetching Belgium dataset...');
    const data = await fetch(BASE_URL).then(fetch_res => {
        return fetch_res.json();
    }).then(resJSON => {
        console.log('Done fetching\nElaborating...');
        const result = filter(resJSON);
        return {result: result};
    });

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
    app.get('/belgium', getData);
};