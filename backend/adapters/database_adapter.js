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
        databases[region] = new NeDB({ filename: `./backend/databases/${region}.db` });
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

    fetch(`${utils.BASE_URL}/region-info/${region}`).then(resFetch => {
        return resFetch.json();
    }).then(result => {
        insertNewData(database, [result]);
    });
}

// Function to handle the requests for latest data.
const handleSelectLatestRequest = async (req, res) => {
    const region = req.params.region;
    
    console.log(`[DATABASE ADAPTER] - Region latest data request for region ${region}`);
    
    // Check if it is a valid region.
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    await handleSelectLatestResponse(res, region);
}

// Function to handle the responses for latest data.
async function handleSelectLatestResponse(res, region) {
    // Get the information in the DB.
    const entry = await new Promise((resolve, reject) => {
        databases[region].find({}).sort({date : -1}).limit(1).exec((err, entry) => {
            if (err) {
                reject(err);
            }
            resolve(entry); 
        });
    });
    
    console.log(`[DATABASE ADAPTER] - Done\n`);
    res.status(200).send(entry);
}

// Function to handle the select requests to the database.
const handleSelectRequest = async (req, res) => {
    const region = req.params.region;
    const from = utils.getDate(req.query.from);
    const to = req.query.to === undefined ? from : utils.getDate(req.query.to);

    console.log(`[DATABASE ADAPTER] - Select request for region ${region} and dates ${from} ${to}`);
    
    // Check the given region is valid.
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    // Need at least one date.
    if (!utils.isValidDate(from) || !utils.isValidDate(to)) {
        return utils.handleError(res, 400, `${from} is not a valid date`);
    }

    await handleSelectResponse(res, region, from, to);
}

// Function to handle the select responses from the database.
async function handleSelectResponse(res, region, from, to) {
    const dates = utils.getDatesBetween(from, to);

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

    if (result.length == 0) {
        return utils.handleError(res, 404, `No data has been found for date ${initialDate} in the database`);
    }
    
    console.log(`[DATABASE ADAPTER] - Done\n`);
    res.status(200).send({result: result});
}

// Function to handle the insert requests to the database.
const handleInsertRequest = async (req, res) => {
    const region = req.params.region;
    const data = req.body.data;
    
    console.log(`[DATABASE ADAPTER] - Insert request for region ${region}`);
    
    // Check if the region is supported.
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    // Check if data has been correctly sent.
    if (data === undefined) {
        return utils.handleError(res, 400, 'No data was received');
    }

    await handleInsertResponse(res, region, data);
}

// Function to handle the insert responses from the database.
async function handleInsertResponse(res, region, data) {
    // Insert new records if not already present.
    insertNewData(databases[region], data);

    console.log(`[DATABASE ADAPTER] - Done\n`);
    res.sendStatus(201);
}

// Function to handle the requests of information about a region.
const handleRegionInfoRequest = async (req, res) => {
    const region = req.params.region;
    
    console.log(`[DATABASE ADAPTER] - Region info request for region ${region}`);
    
    // Check if it is a valid region.
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

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
    
    console.log(`[DATABASE ADAPTER] - Done\n`);
    res.status(200).send(entry);
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

// Register endpoints.
exports.register = (app) => {
    app.get('/db/latest/:region?', handleSelectLatestRequest);
    app.get('/db/:region?', handleSelectRequest);
    app.post('/db/:region?', handleInsertRequest);
    app.get('/db-info/:region?', handleRegionInfoRequest);
};
