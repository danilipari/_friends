const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { middlewareReadFiles } = require("./middlewares.cjs");
// const { Vonage } = require("@vonage/server-sdk");
// const vonage = new Vonage(
//   {
//     apiKey: process.env.SECRET_KEY_NEXMO_API,
//     apiSecret: process.env.SECRET_KEY_NEXMO,
//   },
//   {}
// );

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const ssl = false;
const util = require('util');
const fs = require('fs');
const https = require('https');

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
// app.use(morgan('combined'));

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

app.use(freccePath, express.static(freccePathRoot));
app.get(`${freccePath}`, middlewareReadFiles(freccePathRoot), (req, res) => {
  const fileName = `index.html`;
  res.sendFile(fileName, { root: freccePathRoot });
});

app.post('/frecce/travel/recover', async (req, res) => {
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

// Default route
app.get("/", (req, res) => {
  const reqString = util.inspect(req, { showHidden: false, depth: 1 });
  const userAgent = req.get('User-Agent');
  const ip = req.ip;

  const htmlEle = `<!DOCTYPE html>
  <html lang="it">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dani Lipari</title>
    <style>
      /* Reset di base */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      /* Stile generale */
      body {
        background-color: #0d0d0d;
        font-family: 'Helvetica', Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        color: rgb(255, 136, 0);
      }
      
      /* Contenitore centrale */
      .container {
        background-color: rgba(0, 0, 0, 0.85);
        padding: 40px;
        border: 2px solid rgb(255, 136, 0);
        border-radius: 10px;
        box-shadow: 0 0 20px rgb(255, 136, 0);
        text-align: center;
        width: 90%;
        max-width: 600px;
      }
      
      /* Titolo con effetto neon più sobrio */
      h1 {
        font-size: 3em;
        margin-bottom: 20px;
      }
      
      /* Animazione neon pulita e leggera */
      @keyframes neonPulse {
        0% {
          text-shadow: 0 0 8px rgba(255, 136, 0, 0.8), 0 0 16px rgba(255, 136, 0, 0.8);
        }
        50% {
          text-shadow: 0 0 12px rgba(255, 136, 0, 1), 0 0 24px rgba(255, 136, 0, 1);
        }
        100% {
          text-shadow: 0 0 8px rgba(255, 136, 0, 0.8), 0 0 16px rgba(255, 136, 0, 0.8);
        }
      }
      
      /* Introduzione migliorata */
      p {
        font-size: 1.2em;
        margin-bottom: 30px;
        line-height: 1.5;
      }
      
      /* Stile per il link a GitHub (bianco) */
      a.github-link {
        display: inline-block;
        padding: 10px 20px;
        border: 2px solid #fff;
        border-radius: 5px;
        color: #fff;
        text-decoration: none;
        transition: all 0.3s ease-in-out;
      }
      
      a.github-link:hover {
        background-color: #fff;
        color: #0d0d0d;
        transform: scale(1.05);
      }
      
      /* Stile per il link a LinkedIn (blu) */
      a.linkedin-link {
        display: inline-block;
        padding: 10px 20px;
        border: 2px solid #0077B5;
        border-radius: 5px;
        color: #0077B5;
        text-decoration: none;
        transition: all 0.3s ease-in-out;
        margin-left: 10px;
      }
      
      a.linkedin-link:hover {
        background-color: #0077B5;
        color: #fff;
        transform: scale(1.05);
      }
      
      /* Footer */
      footer {
        margin-top: 20px;
        font-size: 0.9em;
        opacity: 0.8;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>I'm Dani Lipari</h1>
      <p>Swiss Team Lead - Full Stack Developer - Web3 - Blockchain - Node.js - Angular - Vue - Ionic - Flutter</p>
      <p>IP: <strong>${ip}</strong></p>
      <p>UserAgent: <strong>${userAgent}</strong></p>
      <a class="github-link" href="https://github.com/danilipari" target="_blank">Visit my GitHub</a>
      <a class="linkedin-link" href="https://www.linkedin.com/in/dani-lipari-developer/" target="_blank">Visit my LinkedIn</a>
      <footer>
        <p>&copy; <span id="currentYear"></span> DL</p>
      </footer>
    </div>
    <script>
      document.getElementById('currentYear').textContent = new Date().getFullYear();
    </script>
  </body>
  </html>`;
  res.send(htmlEle);
});

const port = process.env.PORT || 8000;

if (ssl) {
  let options;
  try {
    options = {
      key: fs.readFileSync('./ssl/server.key'),
      cert: fs.readFileSync('./ssl/server.cert')
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
