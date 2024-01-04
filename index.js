const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { middlewareReadFiles } = require('./middlewares.cjs');

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.use(cors());
// app.use(morgan('combined'));
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
const francescaPath = '/francesca';
const francescaHtmlPath = './francesca/advent-calendar/';

app.use(francescaPath, express.static(francescaHtmlPath));
app.get(`${francescaPath}/*`, middlewareReadFiles(francescaHtmlPath), (req, res) =>
  res.sendFile('index.html', {root: francescaHtmlPath}),
);

// Livia project
const liviaPath = '/livia';
const liviaHtmlPath = isProd ? `.${liviaPath}/html/` : `.${liviaPath}/html-dev/`;
const liviaTranslatePath = `.${liviaPath}/translate/`;

app.use(liviaPath, express.static(liviaHtmlPath), express.static(liviaTranslatePath));
app.get(`${liviaPath}/*`, middlewareReadFiles(liviaHtmlPath), (req, res) => {
  const requestedPath = `${liviaPath}${req.path}`;
  const canAccess = (res.locals.readedFiles || [])?.includes(requestedPath);
  if (canAccess) {
    res.status(200).sendFile('index.html', { root: liviaHtmlPath });
  } else {
    res.status(404).sendFile('404.html', { root: liviaHtmlPath });
  }
});

// Agnese
app.get('/agnese', (req, res) =>
  res.send(`<h3>Welcome agnese!</h3>`),
);

// Default route
app.get('/', (req, res) =>
  res.send(`<h3>Welcome!</h3>`),
);

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 8000;
app.listen(port, () => { console.log(`Project is running on port ${port}.`) });