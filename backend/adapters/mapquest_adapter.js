const fetch = require('node-fetch');
const utils = require('../utils/utils');
const regions = require('../utils/regions');

const BASE_URL = 'https://www.mapquestapi.com/staticmap/v5/map?';
const KEY = 'key=msjfZTaaaRwasQi8K3jplvGnZBUvPFA0'; // Move to a better file.
const MAPS_SIZE = 'size=@2x';

// Function to handle the requests for the endpoint.
const handleMapRequest = async (req, res) => {
    const region = req.params.region;
    const input = req.query.data;
    
    console.log(`[MAPQUEST ADAPTER] - Map request for region ${region}`);
    
    // Check if region is valid.
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }

    // input is a string in the following form:
    // [["rome", 100], ["milan", 200]]
    let locations = undefined;
    try {
        locations = JSON.parse(input);
    } catch(err) {
        return utils.handleError(res, 400, 'Bad input data');
    }

    await handleMapResponse(res, region, locations);
}

// Function to handle the responses from the endpoint.
async function handleMapResponse(res, region, locations) {
    // Retrieve the fields to pass to the mapquest API.
    const regionInfo = await getRegionInfo(region);
    const mapLocations = getMapLocations(locations, regionInfo);
    console.log(`[MAPQUEST ADAPTER] - Fetching Map Quest API`);
    
    // Fetch the data in the html page, concatenating the URL.
    const query = `${BASE_URL}${KEY}&${MAPS_SIZE}&${regionInfo.zoom}&${regionInfo.center}${mapLocations}`;
    const data = await fetch(query).then(resFetch => {
        // .buffer() because we receive an image from fetch function.
        return resFetch.buffer();
    });

    // Set the right content type (without this, the map image is downloaded)
    // and send the data to the client.
    console.log(`[MAPQUEST ADAPTER] - Done\n`);
    res.set('Content-Type', 'image/png').status(200).send(data);
};

// Function to retrieve all the necessary information of a region.
async function getRegionInfo(region) {
    // TODO we could have errors here
    const regionInfo = await utils.fetchJSON(`${utils.BASE_URL}/db-info/${region}`);

    const result = {
        'region' : regionInfo.region,
        'center' : 'center=' + regionInfo.coordinates,
        'zoom' : 'zoom=' + getRegionZoom(regionInfo.area),
        'population' : regionInfo.population
    }

    return result;
}

// Function to compute the zoom of a region for the mapquest API.
function getRegionZoom(area) {
    const maxSize = 1000000;
    const minSize = 1000;

    const minScale = 1;
    const maxScale = 8;

    const scalingParam = 1 - ((area - minSize) / (maxSize - minSize));

    const result = Math.floor(minScale + (maxScale - minScale) * scalingParam);

    return Math.max(result, 1);
}

// Function to build the URL to query MapQuest.
// Each location is represented by circle and gathered in a list.
function getMapLocations(locations, regionInfo) {
    const result = [];
    const scalingParam = 250000;

    for (const entry of locations) {
        const location = entry[0];
        const radius = entry[1] / (regionInfo.population / scalingParam);
        result.push(`&shape=border:ff0000ff|fill:ff000099|radius:${radius}|${location},${regionInfo.region}`);
    }

    return result;
}

// Export the function to register the endpoint.
exports.register = (app) => {
    app.get('/map-image/:region?', handleMapRequest);
};
