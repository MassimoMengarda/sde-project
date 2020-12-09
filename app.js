const express = require('express');

const PORT = 80

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ msg: 'Hello world' });
});

require('./adapters/france_adapter').register(app);
// require('./services/assignments').register(app);

app.listen(PORT, () => console.log('App listening on port ' + PORT));