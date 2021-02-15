const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const utils = require('./utils/utils');

const app = express();

app.use(bodyParser.json({limit: '100mb', extended: true}));
app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
    const API_DOCUMENTATION = 'https://app.swaggerhub.com/apis-docs/MassimoMengarda/SDE-project/1.0.0-oas3#/';
    const THIS_PAGE = `<a href="${API_DOCUMENTATION}">this page<\a>`;
    console.log('Get API documentation');
    res.status(200).send(`Visit ${THIS_PAGE} for the documentation`);
});

// Register paths app paths.
require('./adapters/italy_adapter').register(app);
require('./adapters/belgium_adapter').register(app);
require('./adapters/uk_adapter').register(app);
require('./adapters/mapquest_adapter').register(app);
require('./adapters/chart_adapter').register(app);
require('./adapters/data_collector').register(app);
require('./adapters/database_adapter').register(app);
require('./adapters/information_adapter').register(app);

require('./business_logics/regions_mapper').register(app);
require('./business_logics/dates_mapper').register(app);

require('./processes/map_visualizer').register(app);
require('./processes/chart_visualizer').register(app);

// Start server.
app.listen(utils.PORT, () => console.log(`App listening on port ${utils.PORT}\n`));
