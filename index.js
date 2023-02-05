//Install express server
const express = require('express');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static('./advent-calendar/'));

app.get('/*', (req, res) =>
  res.sendFile('index.html', {root: './advent-calendar/'}),
);

// Start the app by listening on the default Heroku port

const port = 8080;
app.listen(port, () => { console.log(`Project is running on port ${port}.`) });