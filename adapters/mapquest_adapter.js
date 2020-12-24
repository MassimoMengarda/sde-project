const fetch = require('node-fetch');

const BASE_URL = 'https://www.mapquestapi.com/staticmap/v5/map?';
const KEY = 'key=msjfZTaaaRwasQi8K3jplvGnZBUvPFA0';
const MAPS_SIZE = 'size=@2x';

//TODO runtime?
const RADIUS_SCALE = 250;

// Function that retrieves the map of country indicated in URL.
const getMap = async (req, res) => {
    // Get the country and location params
    const country = req.params.country;
    const input = req.query.data;

    if (country === undefined) {
        res.status(400);
        res.send('Parameter country is undefined');
        return;
    }

    let locations = undefined;
    try {
        locations = JSON.parse(input);
    } catch(err) {
        res.status(400);
        res.send('Bad input data');
        return;
    }

    const mapCountry = getMapCountry(country);
    if (mapCountry === undefined) {
        res.status(400);
        res.send('Country ' + country + ' is unexpected');
        return;
    }
    
    const mapLocations = getMapLocations(locations, country);
    console.log('Starting fetching Map Quest API...');
    
    // Fetch the data in the html page, concatenating the URL
    const query = BASE_URL +
                KEY + '&' +
                MAPS_SIZE + '&' +
                mapCountry.zoom + '&' + 
                mapCountry.center + mapLocations;
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
// of the map and zoom value for the country concerned
function getMapCountry(country) {
    const result = {};

    // TODO scalable
    if (country === 'italy') {
        result.center = 'center=42.43169019179292,13.122537387489809';
        result.zoom = 'zoom=5';
    } else if (country === 'uk') {
        result.center = 'center=54.56400960664871,-2.179826941380527';
        result.zoom = 'zoom=5';
    } else if (country === 'belgium') {
        result.center = 'center=50.694457836779684,4.657968959260875';
        result.zoom = 'zoom=7';
    } else {
        // TODO better way?
        return undefined;
    }
    return result;
}

function getMapLocations(locations, country) {
    const result = [];

    for (const entry of locations) {
        const location = entry[0];
        const radius = entry[1] / RADIUS_SCALE;
        result.push('&shape=border:ff0000ff|fill:ff000099|radius:' + radius + '|' + location + ',' + country);
    }

    return result;
}

// Export the function to register the endpoint.
exports.register = (app) => {
    app.get('/map/:country?', getMap);
};
