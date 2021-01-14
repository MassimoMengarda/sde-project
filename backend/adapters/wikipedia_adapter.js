const fetch = require("node-fetch");

const BASE_URL =
  "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates&titles=";

const getCoordinates = async (req, res) => {
  const location = req.params.location;

  // Fetch the data in the html page.
  var data = await fetch(BASE_URL + location)
    .then((fetch_res) => {
      // Since data is csv, we return it as string.
      return fetch_res.json();
    })
    .then((resJSON) => {
      const pageChild = Object.keys(resJSON.query.pages);
      const coordinatesChild = Object.keys(
        resJSON.query.pages[pageChild].coordinates
      );
      return resJSON.query.pages[pageChild].coordinates[coordinatesChild];
    })
    .catch(() => {
      console.log("Fetch error: Location not found");
      if (data == null) {
        return { error: String("Location not found") };
      }
    });

  res.status(200);
  res.send(data);
  //console.log('Done!');
};

// Export the function to register the endpoint.
exports.register = (app) => {
  app.get("/getCoordinates/:location", getCoordinates);
};
