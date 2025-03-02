const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { middlewareReadFiles } = require("./middlewares.cjs");
const path = require("path");
const fs = require("fs");
// const { Vonage } = require("@vonage/server-sdk");
// const vonage = new Vonage(
//   {
//     apiKey: process.env.SECRET_KEY_NEXMO_API,
//     apiSecret: process.env.SECRET_KEY_NEXMO,
//   },
//   {}
// );

// Optional HTTPS
const certs = false;
const https = require("https");

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    "default-src": ["'self'", "https:"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
    "img-src": ["'self'", "https:", "data:"],
    "connect-src": ["'self'", "https:"],
    "style-src": ["'self'", "'unsafe-inline'", "https:"],
    "font-src": ["'self'", "https:"],
    "worker-src": ["'self'", "blob:"]
  },
}));

app.use(cors());
app.set('trust proxy', true);
app.use(morgan('combined'));

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


// FreccePath
const freccePath = ["/lefrecce", "/frecce"];
const freccePathRoot = "./lefrecce/";

app.get(freccePath, middlewareReadFiles(freccePathRoot), (req, res) => {
  const myServerVars = {
    env: process.env.NODE_ENV === 'production'
  };
  const fileName = path.join(freccePathRoot, "index.html");
  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Errore nella lettura del file HTML");
    }

    const serverScript = `<script>window.vueServerData = ${JSON.stringify(myServerVars)};</script>`;
    const modifiedData = data.replace("</head>", `${serverScript}</head>`);

    res.send(modifiedData);
  });
});
// messo sotto per evitare che venga sovrascritto il middlewareReadFiles
app.use(freccePath, express.static(freccePathRoot));

app.post('/api/frecce/travel/recover', async (req, res) => {
  try {
    const response = await fetch("https://www.lefrecce.it/Channels.Website.BFF.WEB/website/travel/recover", {
      method: "POST",
      headers: {
        "Accept": "application/json, application/pdf, text/calendar",
        "Content-Type": "application/json",
        "cache-control": "no-cache",
        "x-requested-with": "Fetch"
      },
      body: JSON.stringify(req.body)
    });
    const result = await response.json();
    res.status(response.status).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/", express.static("./my/"));
app.get("/", (req, res) => {
  res.sendFile('index.html', { root: "./my/" });
});

const port = process.env.PORT || 8000;

if (certs) {
  let options;
  try {
    options = {
      key: fs.readFileSync('./certs/server.key'),
      cert: fs.readFileSync('./certs/server.cert')
    };
  } catch (err) {
    console.error("Errore nella lettura dei certificati:", err);
    process.exit(1);
  }
  https.createServer(options, app).listen(port, () => {
    console.log(`Secure server running in development on port ${port}.`);
  });
} else {
  app.listen(port, () => {
    console.log(`Server running in production on port ${port}.`);
  });
}
