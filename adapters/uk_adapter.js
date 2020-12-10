const fetch = require('node-fetch');

//TODO areaType=region (2pages) OR areaType=utla (30pages)
const BASE_URL = 'https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=utla&structure' + 
                 '={"date":"date","name":"areaName","cases":"newCasesByPublishDate"}&format=json';

const getData = async (req, res) => {
    console.log('Starting fetching UK dataset...');
    const pages = await fetch(BASE_URL).then(fetch_res => {
        return fetch_res.json();
    }).then(resJSON => {
        return parseInt(resJSON.pagination.last.slice(-2).replace('=',''));
    });
    
    const data = await filter(pages);

    console.log('Done fetching\nSending data...');
    res.status(200);
    res.send({result: data});
    console.log('Done!');
}

async function filter(pages) {
    const result = {};

    for (let i = 1; i <= pages; i++) {
        const query = BASE_URL + '&page=' + i;

        const entries = await fetch(query).then(fetch_res => {
            return fetch_res.json();
        }).then(resJSON => {
            return resJSON.data;
        });

        for (const elem of entries) {
            const date = elem.date;
            const province = elem.name;
            const cases = elem.cases;

            if (date !== undefined && province !== undefined && cases !== undefined) {
                if (result[date] === undefined) {
                    result[date] = {};
                }
                result[date][province] = {cases: cases}; 
            }
        }
    }
    
    return result;
}

exports.register = app => {
    app.get('/uk', getData);
};