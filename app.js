const express = require('express');

const PORT = 80

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ msg: 'Hello world' });
});

require('./adapters/italy_adapter').register(app);
require('./adapters/belgium_adapter').register(app);
require('./adapters/uk_adapter').register(app);

app.listen(PORT, () => console.log('App listening on port ' + PORT));