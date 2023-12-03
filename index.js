//Install express server
const express = require('express');

const app = express();

app.get('/', (req, res) =>
  res.send(`<h3>Welcome friends!</h3>`),
);

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 8000;
app.listen(port, () => { console.log(`Project is running on port ${port}.`) });