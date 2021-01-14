const fetch = require('node-fetch');
const regions = require('../utils/regions');

const BASE_URL = 'https://www.mapquestapi.com/staticmap/v5/map?';
const KEY = 'key=msjfZTaaaRwasQi8K3jplvGnZBUvPFA0';
const MAPS_SIZE = 'size=@2x';

// Function that retrieves the map of region indicated in URL.
const getMap = async (req, res) => {
    // Get the region and location params
    const region = req.params.region;
    const input = req.query.data;

    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        res.status(400);
        res.send('Parameter region is undefined');
        return;
    }

    // input is a string in the following form:
    // [["rome", 100], ["milan", 200]]
    let locations = undefined;
    try {
        locations = JSON.parse(input);
    } catch(err) {
        res.status(400);
        res.send('Bad input data');
        return;
    }

    const mapRegion = getMapRegion(region);
    if (mapRegion === undefined) {
        res.status(400);
        res.send('Region ' + region + ' is unexpected');
        return;
    }
    
    const mapLocations = getMapLocations(locations, region);
    console.log('Starting fetching Map Quest API...');
    
    // Fetch the data in the html page, concatenating the URL
    const query = BASE_URL +
                KEY + '&' +
                MAPS_SIZE + '&' +
                mapRegion.zoom + '&' + 
                mapRegion.center + mapLocations;
    const data = await fetch(query).then((fetch_res) => {
        // .buffer() because we receive an image from fetch function
        return fetch_res.buffer();
    });

    // Set the right content type (without this, the map image is downloaded)
    // and send the data to the client
    console.log('Sending data...');
    res.set('Content-Type', 'image/png');
    res.status(200);
    res.send(data);
    console.log('Done!');
};


// Function to adapt the image to coordinates of the center
// of the map and zoom value for the region concerned
function getMapRegion(region) {
    const result = {};

    // TODO scalable, move to regions utils?
    if (region === 'italy') {
        result.center = 'center=42.43169019179292,13.122537387489809';
        result.zoom = 'zoom=5';
    } else if (region === 'uk') {
        result.center = 'center=54.56400960664871,-2.179826941380527';
        result.zoom = 'zoom=5';
    } else if (region === 'belgium') {
        result.center = 'center=50.694457836779684,4.657968959260875';
        result.zoom = 'zoom=7';
    }

    return result;
}

// Function to build the URL to query MapQuest.
// Each location is represented by circle and
// gathered in a list.
function getMapLocations(locations, region) {
    const result = [];

    for (const entry of locations) {
        const location = entry[0];
        const radius = entry[1] / regions.getRegionScaleFactor(region);
        result.push('&shape=border:ff0000ff|fill:ff000099|radius:' + radius + '|' + location + ',' + region);
    }

    return result;
}

// Export the function to register the endpoint.
exports.register = (app) => {
    app.get('/map-image/:region?', getMap);
};
