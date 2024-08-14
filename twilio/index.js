const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
app.use(cors());
app.use(morgan("combined"));
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"],
      "script-src": ["'self'", "https: data:"],
      "default-src": ["'self'", "https: data:"],
    },
  })
);

const twilioTemplate = {
  it: `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say language="it-IT" voice="alice">Ciao! Questa è una chiamata di test da parte del server di Dani per le chiamate di Twilio. Grazie per aver risposto!</Say>
        </Response>
      `,
  en: `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say language="en-GB" voice="alice">Hello! This is a test call from Dani's server for Twilio calls. Thank you for answering!</Say>
        </Response>
      `,
};

app.post("/:lang", (req, res) => {
  console.log("twilio body -->", req.body);
  const lang = req.params.lang || "it";
  res.set("Content-Type", "text/xml");
  const twiml = twilioTemplate[lang];
  res.send(twiml);
});

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Project is running on port ${port}.`);
});
