const fetch = require('node-fetch');
const regions = require('../utils/regions');
const utils = require('../utils/utils');
const secret = require('../secret');

const COUNTRIES_BASE_URL = 'https://countries-cities.p.rapidapi.com/location/country/';
const WIKI_BASE_URL = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates&titles=';

// Function to handle requests of information about the selected region.
const handleRegionInfoRequest = async (req, res) => {
    const region = req.params.region;
    
    console.log(`[INFORMATION ADAPTER] - Request for region ${region}`);
    
    if (!regions.isValidRegion(region)) {
        return utils.handleError(res, 400, `${region} is not a valid region`);
    }
    
    await handleRegionInfoResponse(res, region);
}

// Function to handle responses for information about the selected region.
async function handleRegionInfoResponse(res, region) {
    // Retrieve the information.
    const stats = await getAreaAndPopulation(regions.getRegionTranslation(region, 'countries'));
    const coords = await getCoordinates(regions.getRegionTranslation(region, 'wiki'));

    // Build the response object.
    const result = {
        'region' : region,
        'area' : Number(stats.area.split('.')[0]),
        'population' : stats.population,
        'coordinates' : coords
    }

    console.log(`[INFORMATION ADAPTER] - Done\n`);
    res.status(200).send(result);
}

// Function to retrieve the coordinates of a given region.
// https://en.wikipedia.org/w/api.php
async function getCoordinates(region) {
    const data = await fetch(WIKI_BASE_URL + region).then(resFetch => {
        return resFetch.json();
    }).then(resJSON => {
        const pageChild = Object.keys(resJSON.query.pages);
        const coordinatesChild = Object.keys(
            resJSON.query.pages[pageChild].coordinates
        );
        const coords = resJSON.query.pages[pageChild].coordinates[coordinatesChild];
        return coords.lat + ',' + coords.lon;
    }).catch(() => {
        console.log(`[INFORMATION ADAPTER] - Wikipedia fetch error: Location ${region} not found`);
        return undefined;
    });

    return data;
}

// Function to retrieve the area and the population size of a given region.
// https://rapidapi.com/natkapral/api/countries-cities
async function getAreaAndPopulation(region) {
    // Add also the needed headers.
    const data = await fetch(COUNTRIES_BASE_URL + region, {
                    headers : {
                        'x-rapidapi-key': secret.COUNTRIES_KEY,
                        'x-rapidapi-host': 'countries-cities.p.rapidapi.com',
                        'useQueryString': 'true'
                    }
    }).then(resFetch => {
        return resFetch.json();
    }).then(resJSON => {
        // Return only the needed fields.
        return {'area' : resJSON['area_size'], 'population' : resJSON['population']};
    });
    
    return data;
};

// Register endpoint.
exports.register = (app) => {
    app.get('/region-info/:region?', handleRegionInfoRequest);
};
