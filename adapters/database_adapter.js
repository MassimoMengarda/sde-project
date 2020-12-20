// https://github.com/louischatriot/nedb
const NeDB = require('nedb');

function createDatabase(name) {
    databases[name] = new NeDB({ filename: './database/' + name + '.db' });
    databases[name].loadDatabase();
    databases[name].ensureIndex({ fieldName: 'date', unique: true }, function (err) {
        if (err) {
            console.log('Error while creating "date" index in ' + name + ' database');
        }
    });
}

// Create/load databases and create/load indexes on field date
const databases = {};
createDatabase('belgium');
createDatabase('italy');
createDatabase('uk');

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
    for (const entry of data) {
        db.insert(entry, (err) => {
            if (err) {
                // Just skip, if we can have the violation of unique constraint on date
                // console.log(err);
            }
        });
    }
}

exports.register = (app) => {
    app.get('/db/:country', select);
    app.post('/db/:country', insert);
};
