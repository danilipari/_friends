const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(morgan('combined'));
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      'img-src': ['\'self\'', 'https: data:'],
      'script-src': ['\'self\'', 'https: data:'],
      'default-src': ['\'self\'', 'https: data:'],
    },
  }),
);

app.get('/', (req, res) =>
  res.send(`<h3>Welcome friends!</h3>`),
);

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 8000;
app.listen(port, () => { console.log(`Project is running on port ${port}.`) });