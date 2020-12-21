const express = require('express');
const bodyParser = require("body-parser");

const PORT = 8080;
const app = express();
app.use(bodyParser.json({limit: '100mb', extended: true}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ msg: 'Hello world' });
});

// Register paths app paths.
require('./adapters/italy_adapter').register(app);
require('./adapters/belgium_adapter').register(app);
require('./adapters/uk_adapter').register(app);
require('./adapters/mapquest_adapter').register(app);
require('./adapters/data_collector').register(app);
require('./adapters/database_adapter').register(app);

// require('./adapters/wikipedia_adapter').register(app); // TODO remove

require('./business_logics/regions_mapper').register(app);

// Start server.
app.listen(PORT, () => console.log('App listening on port ' + PORT));
