// https://github.com/louischatriot/nedb
const NeDB = require('nedb');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Create/load databases and create/load indexes on field date.
const databases = {};
createDatabases();

// Function that creates, load and setup all the databases
function createDatabases() {
    for (const region of regions.getRegions()) {
        databases[region] = new NeDB({ filename: './backend/databases/' + region + '.db' });
        databases[region].ensureIndex({ fieldName: 'date', unique: true });
        databases[region].loadDatabase((err) => {
            if (err) {
                console.log(err);
            }
        });
    }
}

// Function that returns a list of entries whether present in the db.
const select = async (req, res) => {
    const region = req.params.region;
    
    const date1 = utils.getDate(req.query.date1);
    const date2 = req.query.date2 === undefined ? date1 : utils.getDate(req.query.date2);

    // Check if a db exists.
    if (!regions.isValidRegion(region)) {
        res.status(400);
        res.send('Region ' + region + ' not expected');
        return;
    }

    // Need at least one date.
    if (date1 === undefined) {
        res.status(400);
        res.send('Input date expected');
        return;
    }

    // Order dates.
    const initialDate = date1 <= date2 ? date1 : date2;
    const finalDate = date1 > date2 ? date1 : date2;
    const dates = utils.getDatesBetween(initialDate, finalDate);

    const result = [];
    
    // Get all the data needed.
    for (const date of dates) {
        // This is a unique date.
        const entry = await new Promise((resolve, reject) => {
            databases[region].findOne({date: date}, (err, entry) => {
                if (err) {
                    reject(err);
                }
                resolve(entry); 
            });
        });
        if (entry !== undefined && entry !== null) {
            result.push(entry);
        }
    }
    

    // Send data and response code 200.
    res.status(200);
    res.send({result: result});
}

// Function that inserts new data in the db, it is called by the endpoint.
const insert = (req, res) => {
    const region = req.params.region;
    const data = req.body.result;

    // Check if the region is supported.
    if (!regions.isValidRegion(region)) {
        res.status(400);
        res.send('Region ' + region + ' not expected');
        return;
    }

    // Check if data has been correctly sent.
    if (data === undefined) {
        res.status(400);
        res.send('No data was received');
        return;
    }

    // Insert new records if not already present.
    insertNewData(databases[region], data);

    // Send response code 200.
    res.sendStatus(200);
};

// Function that inserts data in a database.
function insertNewData(db, data) {
    for (const entry of data) {
        db.insert(entry, (err) => {
            if (err) {
                // Just skip, if we can have the violation of unique constraint on date.
                // console.log(err);
            }
        });
    }
}

// Export the function to register the endpoint.
exports.register = (app) => {
    app.get('/db/:region?', select);
    app.post('/db/:region?', insert);
};
