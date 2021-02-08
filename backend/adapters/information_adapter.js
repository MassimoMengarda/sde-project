const fetch = require('node-fetch');
const regions = require('../utils/regions');

const COUNTRIES_BASE_URL = 'https://countries-cities.p.rapidapi.com/location/country/';
const WIKI_BASE_URL = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates&titles=';

const COUNTRIES_KEY = '2e0b2c19b3mshf16fe5d8d69f47dp17e29ejsnabd62970f152'; // TODO move to better file

// Function to handle requests of information about the selected region.
const handleRegionInfoRequest = async (req, res) => {
    const region = req.params.region;

    if (!regions.isValidRegion(region)) {
        res.status(400);
        res.send('Region ' + region + ' not expected');
        return;
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
        'area' : stats.area.split('.')[0],
        'population' : stats.population,
        'coordinates' : coords
    }

    res.status(200);
    res.send(result);
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
        console.log('Wikipedia fetch error: Location ' + region + ' not found');
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
                        'x-rapidapi-key': COUNTRIES_KEY,
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

// Export the function to register the endpoint.
exports.register = (app) => {
    app.get('/get-region-info/:region?', handleRegionInfoRequest);
};
