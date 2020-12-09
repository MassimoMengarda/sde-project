const utils = require('./utils')

const fetch = require('node-fetch');
const BASE_URL = "https://coronavirusapi-france.now.sh/AllDataByDate?date=";

const getDataByDate = async (req, res) => {
    const year = req.params.year === undefined ? utils.getYear() : req.params.year;
    const month = req.params.month === undefined ? utils.getMonth() : req.params.month;
    const day = req.params.day === undefined ? utils.getDay() : req.params.day;

    const query = BASE_URL + year + "-" + month + "-" + day;

    const result = await fetch(query).then(res => {
        return res.json();
    }).then(resJSON => {
        return resJSON.allFranceDataByDate;
    });
    console.log(query)
    res.status(200);
    res.json({"result" : result});
}

exports.register = app => {
    app.get('/france/:year?/:month?/:day?', getDataByDate);
};