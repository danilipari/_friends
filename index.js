//Install express server
const express = require('express');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static('./francesca/advent-calendar/'));

app.get('/*', (req, res) =>
  res.sendFile('index.html', {root: './francesca/advent-calendar/'}),
);

// Start the app by listening on the default Heroku port

const port = process.env.PORT || 8000;
app.listen(port, () => { console.log(`Project is running on port ${port}.`) });