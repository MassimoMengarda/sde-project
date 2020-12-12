const fetch = require('node-fetch');

// TODO set in a config file.
const BASE_URL = 'http://localhost:8080';

// Function that fetches all the endpoints and process the data.
const getAllData = async (req, res) => {
    console.log("Fetching all the endpoints")

    // Fetch the endpoints.
    const italyData = await fetchEndPoint('/italy');
    const ukData = await fetchEndPoint('/uk');
    const belgiumData = await fetchEndPoint('/belgium');
    
    // TODO process -> wikipedia and database.
    const result = {
        italy: italyData,
        uk: ukData,
        belgium: belgiumData
    }
    
    // Send the data to the client wih response code 200.
    res.status(200);
    res.send(result);
}

// Function that given the name of an endpoint, it fetches and returns the data.
async function fetchEndPoint(endPoint) {
    const data = await fetch(BASE_URL + endPoint).then(fetch_res => {
        return fetch_res.json();
    });
    return data;
}

// Export the function to register the endpoint.
exports.register = app => {
    app.get('/data', getAllData);
};