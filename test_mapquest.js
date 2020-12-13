const fetch = require("node-fetch");

const BASE_URL = "https://www.mapquestapi.com/staticmap/v5/map?locations=";
const KEY = "&key=msjfZTaaaRwasQi8K3jplvGnZBUvPFA0";
const MAPS_SIZE = "&size=@2x";

// Function that retrieves the map of country indicated in URL.
const getMap = async (req, res) => {
    // Get the country and location params
    let country = req.params.country;
    let location = req.params.location;

    // Set default values (if country param is not equal to any of our countries)
    let center_coordinates = "&center=48.787369023680654,10.038033815985028";
    let zoom = "&zoom=4";

    // Adapt the coordinates of the center of the map
    // and zoom value for the country concerned
    if (country === "italy") {
        center_coordinates = "&center=42.43169019179292,13.122537387489809";
        zoom = "&zoom=5";
    } else if (country === "uk") {
        center_coordinates = "&center=54.56400960664871,-2.179826941380527";
        zoom = "&zoom=5";
        location += ",uk";
    } else if (country === "belgium") {
        center_coordinates = "&center=50.694457836779684,4.657968959260875";
        zoom = "&zoom=7";
    }

    console.log("Starting fetching Map Quest API...");

    // Fetch the data in the html page, concatenating the URL
    var data = await fetch(
        BASE_URL + location + MAPS_SIZE + zoom + center_coordinates + KEY
    ).then((fetch_res) => {
        // .buffer() because we receive an image from fetch function
        return fetch_res.buffer();
    });

    // Set the right content type (without this, the map image is downloaded)
    // and send the data to the client
    console.log('Sending data...');
    res.set("Content-Type", "image/png");
    res.status(200);
    res.send(data);
    console.log("Done!");
};

// Export the function to register the endpoint.
exports.register = (app) => {
    app.get("/getMap/:country/:location", getMap);
};
