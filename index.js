const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const { middlewareReadFiles } = require("./middlewares.cjs");
// const { Vonage } = require('@vonage/server-sdk');

// const vonage = new Vonage({
//   apiKey: process.env.SECRET_KEY_NEXMO_API,
//   apiSecret: process.env.SECRET_KEY_NEXMO
// }, {});

const isProd = process.env.NODE_ENV === "production";

const app = express();
app.use(cors());
// app.use(morgan('combined'));
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

// Livia project
// const liviaPath = "/livia";
// const liviaHtmlPath = isProd
//   ? `.${liviaPath}/html/`
//   : `.${liviaPath}/html-dev/`;
// const liviaTranslatePath = `.${liviaPath}/translate/`;

// app.use(
//   liviaPath,
//   express.static(liviaHtmlPath),
//   express.static(liviaTranslatePath)
// );
// app.get(`${liviaPath}/*`, middlewareReadFiles(liviaHtmlPath), (req, res) => {
//   const requestedPath = `${liviaPath}${req.path}`;
//   const canAccess = (res.locals.readedFiles || [])?.includes(requestedPath);
//   if (canAccess) {
//     res.status(200).sendFile("index.html", { root: liviaHtmlPath });
//   } else {
//     res.status(404).sendFile("404.html", { root: liviaHtmlPath });
//   }
// });

// Agnese
// app.get("/agnese", (req, res) => {
//   res.send(`
//     <iframe src="https://www.edusogno.com" width="100%" height="100%">
//       <p>Il tuo browser non supporta gli iframe.</p>
//     </iframe>
//   `);
// });

// Send SMS
// app.get("/gaetana-sms", (req, res) => {
//   const from = "BROTHERS";
//   const to = `39${process.env.SMS_PHONE}`;
//   const text = `Con l'augurio e la certezza che i prossimi anni siano i più avventurosi della tua vita! Hai 1000€ di COUPON da riscattare a tuo piacimento su qualsiasi volo e/o albergo! Buon viaggio!`;

//   vonage.sms.send({
//     to: to,
//     from: from,
//     text: text,
//   }).then(response => {
//     console.log('Message sent successfully');
//     console.log(response);
//     if (response.messages[0]['status'] === "0") {
//       console.log("Message sent successfully.");
//     }
//   }).catch(error => {
//     console.log('There was an error sending the messages.');
//     console.error(error);
//   });


//   res.status(200).json('Sms inviato con successo!!');
// });

// const gaetanaPath = "/gaetana";
// const gaetanaPathRoot = "./gaetana/";

// app.use(gaetanaPath, express.static(gaetanaPathRoot));
// app.get(
//   `${gaetanaPath}`,
//   middlewareReadFiles(gaetanaPathRoot),
//   (req, res) => {
//     const fileName = `index.html`;
//     res.sendFile(fileName, { root: gaetanaPathRoot });
//   }
// );

// https://www.lefrecce.it/Channels.Website.BFF.WEB/website/travel/recover

const freccePath = "/lefrecce";
const freccePathRoot = "./lefrecce/";

app.use(freccePath, express.static(freccePathRoot));
app.get(
  `${freccePath}`,
  middlewareReadFiles(freccePathRoot),
  (req, res) => {
    const fileName = `index.html`;
    res.sendFile(fileName, { root: freccePathRoot });
  }
);

// Default route
app.get("/", (req, res) => res.send(`<h3>Welcome!</h3>`));

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Project is running on port ${port}.`);
});
