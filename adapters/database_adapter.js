// https://github.com/louischatriot/nedb
const NeDB = require('nedb');

// Create/load databases and create/load indexes on field date
const databases = {};


databases['belgium'] = new NeDB({ filename: './database/belgium.db' });
databases['belgium'].loadDatabase();
// databases['belgium'].ensureIndex({ fieldName: 'date', unique: true }, function (err) {
//     if (err) {
//         console.log('Error while creating "date" index in belgium database');
//     }
// });

databases['italy'] = new NeDB({ filename: './database/italy.db' });
databases['italy'].loadDatabase();
// databases['italy'].ensureIndex({ fieldName: 'date', unique: true }, function (err) {
//     if (err) {
//         console.log('Error while creating "date" index in italy database');
//     }
// });

databases['uk'] = new NeDB({ filename: './database/uk.db' });
databases['uk'].loadDatabase();
// databases['uk'].ensureIndex({ fieldName: 'date', unique: true }, function (err) {
//     if (err) {
//         console.log('Error while creating "date" index in uk database');
//     }
// });

const select = (req, res) => {
    const country = req.params.country;

    if (country !== 'belgium' && country !== 'italy' && country !== 'uk') {
        res.status(400);
        res.send('Country ' + country + ' not expected');
        return;
    }

    res.status(200);
    res.send('Work in progress')
}

const insert = (req, res) => {
    const country = req.params.country;
    const data = req.body.result;

    // Check if the country is supported
    if (!databases.hasOwnProperty(country)) {
        res.status(400);
        res.send('Country ' + country + ' not expected');
        return;
    }

    // Check if data has been correctly sent
    if (data === undefined) {
        res.status(400);
        res.send('No data was received');
        return;
    }

    // Insert new records if not already present
    insertNewData(databases[country], data);

    res.sendStatus(200);
};

function insertNewData(db, data) {
    for (const key in data) {
        const entry = {};
        entry[key] = data[key];
        db.insert(entry, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
}

exports.register = (app) => {
    app.get('/db/:country', select);
    app.post('/db/:country', insert);
};
