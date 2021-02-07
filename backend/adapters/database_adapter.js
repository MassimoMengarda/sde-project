// https://github.com/louischatriot/nedb
const NeDB = require('nedb');
const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

// Create/load databases and create/load indexes.
const databases = loadDatabases();
const regionsDB = createRegionsDatabase(); 

// Function that loads and sets up all the databases.
function loadDatabases() {
    const databases = {};
    
    console.log('Loading databases');
    for (const region of regions.getRegions()) {
        databases[region] = new NeDB({ filename: './backend/databases/' + region + '.db' });
        databases[region].ensureIndex({ fieldName: 'date', unique: true });
        databases[region].loadDatabase((err) => {
            if (err) {
                console.log(err);
            }
        });
    }
    
    console.log('Done loading databases\n');
    return databases;
}

// Function that creates the regions database.
function createRegionsDatabase() {
    console.log('Loading regions database');

    const database = new NeDB({ filename: './backend/databases/regions.db' });
    database.ensureIndex({ fieldName: 'region', unique: true });
    database.loadDatabase((err) => {
        if (err) {
            console.log(err);
        }
    });

    // Insert in the database the regions.
    populateRegionsDatabase(database);

    console.log('Done loading regions database\n');
    return database;
}

// Function to populate the regionDB with information about the regions.
function populateRegionsDatabase(database) {
    let counter = 0;
    for (const region of regions.getRegions()) {
        database.findOne({region: region}, (err, entry) => {
            // Add information only if it is not present.
            if (entry === undefined || entry === null) {
    
                // Wait due to the rate limit of 1 request per second.
                setTimeout(() => {
                    console.log('Updating regions database for ' + region);
                    fetch(utils.BASE_URL + 'get-region-info/' + region).then(resFetch => {
                        return resFetch.json();
                    }).then(result => {
                        insertNewData(database, [result]);
                    });
                }, 2000 * counter);

                counter += 1;
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

// Function that returns the information about the requested region.
const getRegionInfo = async (req, res) => {
    const region = req.params.region;

    // Check if it is a valid region.
    if (!regions.isValidRegion(region)) {
        res.status(400);
        res.send('Region ' + region + ' not expected');
        return;
    }

    // Get the information in the DB.
    const entry = await new Promise((resolve, reject) => {
        regionsDB.findOne({region: region}, (err, entry) => {
            if (err) {
                reject(err);
            }
            resolve(entry); 
        });
    });
    
    // Send data and response code 200.
    res.status(200);
    res.send(entry);
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
}

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
    app.get('/db-info/:region?', getRegionInfo);
};
