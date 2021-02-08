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
    
    console.log(`[DATABASE ADAPTER] - Loading databases`);
    for (const region of regions.getRegions()) {
        databases[region] = new NeDB({ filename: './backend/databases/' + region + '.db' });
        databases[region].ensureIndex({ fieldName: 'date', unique: true });
        databases[region].loadDatabase((err) => {
            if (err) {
                console.log(err);
            }
        });
    }
    
    console.log(`[DATABASE ADAPTER] - Done loading databases\n`);
    return databases;
}

// Function that creates the regions database.
function createRegionsDatabase() {
    console.log(`[DATABASE ADAPTER] - Loading regions database`);

    const database = new NeDB({ filename: './backend/databases/regions.db' });
    database.ensureIndex({ fieldName: 'region', unique: true });
    database.loadDatabase((err) => {
        if (err) {
            console.log(err);
        }
    });

    // Insert in the database the regions.
    populateRegionsDatabase(database);

    return database;
}

// Function to populate the regionDB with information about the regions.
function populateRegionsDatabase(database) {
    let counter = 0;
    for (const region of regions.getRegions()) {
        database.findOne({region: region}, (err, entry) => {
            // Add information only if it is not present.
            if (entry === undefined || entry === null) {
                // Wait due to the rate limit of the APIs.
                // TODO, we could have some errors due to the rate limit, what to do?
                setTimeout(() => addRegionInfo(database, region), 3000 * counter);
                counter += 1;
            }
        });
    }
}

// Function to fetch information about a region and insert it in the database.
function addRegionInfo(database, region) {
    console.log(`[DATABASE ADAPTER] - Updating regions database for ` + region);

    fetch(utils.BASE_URL + 'get-region-info/' + region).then(resFetch => {
        return resFetch.json();
    }).then(result => {
        insertNewData(database, [result]);
    });
}

// Function to handle the select requests to the database.
const handleSelectRequest = async (req, res) => {
    const region = req.params.region;
    
    const date1 = utils.getDate(req.query.date1);
    const date2 = req.query.date2 === undefined ? date1 : utils.getDate(req.query.date2);

    // Check the given region is valid.
    if (!regions.isValidRegion(region)) {
        res.status(400);
        res.send('Region ' + region + ' not expected');
        return;
    }

    // Need at least one date.
    if (date1 === undefined || !utils.isValidDate(date1) || !utils.isValidDate(date2)) {
        res.status(400);
        res.send(date1 + 'is not a valid date');
        return;
    }

    console.log(`[DATABASE ADAPTER] - Select request for region ${region} and dates ${date1} ${date2}`);
    await handleSelectResponse(res, region, date1, date2);
}

// Function to handle the select responses from the database.
async function handleSelectResponse(res, region, date1, date2) {
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
    console.log(`[DATABASE ADAPTER] - Done\n`);
}

// Function to handle the insert requests to the database.
const handleInsertRequest = async (req, res) => {
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

    console.log(`[DATABASE ADAPTER] - Insert request for region ${region}`);
    await handleInsertResponse(res, region, data);
}

// Function to handle the insert responses from the database.
async function handleInsertResponse(res, region, data) {
    // Insert new records if not already present.
    insertNewData(databases[region], data);

    // Send response code 200.
    res.sendStatus(200);
    console.log(`[DATABASE ADAPTER] - Done\n`);
}

// Function to handle the requests of information about a region.
const handleRegionInfoRequest = async (req, res) => {
    const region = req.params.region;

    // Check if it is a valid region.
    if (!regions.isValidRegion(region)) {
        res.status(400);
        res.send('Region ' + region + ' not expected');
        return;
    }

    console.log(`[DATABASE ADAPTER] - Region info request for region ${region}`);
    await handleRegionInfoResponse(res, region);
}

// Function to handle the responses for information about a region.
async function handleRegionInfoResponse(res, region) {
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
    console.log(`[DATABASE ADAPTER] - Done\n`);
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
    app.get('/db/:region?', handleSelectRequest);
    app.post('/db/:region?', handleInsertRequest);
    app.get('/db-info/:region?', handleRegionInfoRequest);
};
