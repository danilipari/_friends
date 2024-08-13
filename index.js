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

// Twilio project
const twilioPath = '/twilio';
const twilioXmlPath = './twilio/';

app.use(twilioPath, express.static(twilioXmlPath));
app.get(`${twilioPath}/*`, middlewareReadFiles(twilioXmlPath), (req, res) =>
  res.sendFile('index.xml', {root: twilioXmlPath}),
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
app.get('/agnese', (req, res) => {
  res.send(`
    <iframe src="https://www.edusogno.com" width="100%" height="100%">
      <p>Il tuo browser non supporta gli iframe.</p>
    </iframe>
  `);
});

app.get('/twilio/demo', (req, res) => {
  res.send(`
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Say>Hello! This is a test call from Twilio Dani App.</Say>
    </Response>
  `);
});

// Default route
app.get('/', (req, res) =>
  res.send(`<h3>Welcome!</h3>`),
);

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 8000;
app.listen(port, () => { console.log(`Project is running on port ${port}.`) });