const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

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

switch (process.env.PROJECT) {
  case 'francesca':
    app.use(express.static('./francesca/advent-calendar/'));
    app.get('/*', (req, res) =>
      res.sendFile('index.html', {root: './francesca/advent-calendar/'}),
    );
    break;
  case 'livia':
    app.use(express.static('./livia/html/'));
    app.get('/*', (req, res) =>
      res.sendFile('index.html', {root: './livia/html/'}),
    );
    break;
  default:
    app.get('/', (req, res) =>
      res.send(`<h3>Welcome friends!</h3>`),
    );
    break;
}

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 8000;
app.listen(port, () => { console.log(`Project is running on port ${port}.`) });