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

// Francesca project
app.use('/francesca', express.static('./francesca/advent-calendar/'));
app.get('/francesca/*', (req, res) =>
  res.sendFile('index.html', {root: './francesca/advent-calendar/'}),
);

// Livia project
app.use('/livia', express.static('./livia/html/'));
app.get('/livia/*', (req, res) =>
  res.sendFile('index.html', {root: './livia/html/'}),
);

// Default route
app.get('/', (req, res) =>
  res.send(`<h3>Welcome!</h3>`),
);

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 8000;
app.listen(port, () => { console.log(`Project ${process.env.PROJECT} is running on port ${port}.`) });