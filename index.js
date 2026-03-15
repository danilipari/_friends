const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const crypto = require("crypto");
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
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'", "data:"]
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


// Fiscalini
// const fiscaliniPath = "/fiscalini";
// const fiscaliniPathRoot = "./fiscalini/";

// app.use(`${fiscaliniPath}/images`, express.static(`${fiscaliniPathRoot}images/`));

// const fiscaliniVersions = fs.readdirSync(fiscaliniPathRoot).filter(item => {
//   const itemPath = path.join(fiscaliniPathRoot, item);
//   return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
// });

// fiscaliniVersions.forEach(version => {
//   // Skip the images folder from being served as a version
//   if (['images', 'docs'].includes(version) || version.startsWith('_')) return;

//   const versionPath = `${fiscaliniPath}/${version}`;
//   const versionRoot = `${fiscaliniPathRoot}${version}/`;

//   app.use(versionPath, express.static(versionRoot));
//   app.get(versionPath, (req, res) => {
//     res.sendFile('index.html', { root: versionRoot });
//   });

//   // Check for sub-versions (like demo/v1, demo/v2)
//   const subVersions = fs.readdirSync(versionRoot).filter(item => {
//     const itemPath = path.join(versionRoot, item);
//     return fs.statSync(itemPath).isDirectory() && (item.startsWith('v') || item === 'v1' || item === 'v2');
//   });

//   subVersions.forEach(subVersion => {
//     const subVersionPath = `${versionPath}/${subVersion}`;
//     const subVersionRoot = `${versionRoot}${subVersion}/`;

//     app.use(subVersionPath, express.static(subVersionRoot));
//     app.get(subVersionPath, (req, res) => {
//       res.sendFile('index.html', { root: subVersionRoot });
//     });
//   });
// });

// app.use(fiscaliniPath, express.static(fiscaliniPathRoot));
// app.get(fiscaliniPath, (req, res) => {
//   res.sendFile('index.html', { root: fiscaliniPathRoot });
// });

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

// WhatsCRM Extension - Kill Switch
const syncRateLimit = new Map(); // IPs and their request counts for rate limiting
const syncBanList = new Map(); // IPs that are currently banned
const SYNC_RATE_WINDOW = 60 * 1000; // 1 minute
const SYNC_RATE_MAX = 15; // More than 15 requests in 1 minute triggers rate limit
const SYNC_BAN_THRESHOLD = 30; // 30 requests in 1 minute triggers a ban
const SYNC_BAN_DURATION = 15 * 60 * 1000; // 15 minutes

setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of syncRateLimit) {
    if (now - data.start > SYNC_RATE_WINDOW) syncRateLimit.delete(ip);
  }
  for (const [ip, bannedAt] of syncBanList) {
    if (now - bannedAt > SYNC_BAN_DURATION) syncBanList.delete(ip);
  }
}, SYNC_RATE_WINDOW);


app.get("/api/ext/sync", (req, res) => {
  const ip = req.ip;

  if (syncBanList.has(ip)) {
    console.warn(`WhatsCRM: IP ${ip} blocked due to recent ban`);
    return res.status(403).json({ error: "Forbidden" });
  }

  if (process.env.NODE_ENV === "production") {
    const ua = req.headers["user-agent"] || "";
    if (!ua.includes("Chrome/")) {
      console.warn(`WhatsCRM: IP ${ip} blocked due to invalid User-Agent (${ua})`);
      return res.status(403).json({ error: "Forbidden" });
    }

    const extId = req.headers["x-ext-id"];
    if (process.env.WHACR_EXT_ID && extId !== process.env.WHACR_EXT_ID) {
      console.warn(`WhatsCRM: IP ${ip} blocked due to invalid extension ID (${extId})`);
      return res.status(403).json({ error: "Forbidden" });
    }
  }

  const now = Date.now();
  const entry = syncRateLimit.get(ip);

  if (entry && now - entry.start < SYNC_RATE_WINDOW) {
    entry.count++;
    if (entry.count > SYNC_BAN_THRESHOLD) {
      syncBanList.set(ip, now);
      syncRateLimit.delete(ip);
      console.warn(`WhatsCRM: IP ${ip} banned for 15 minutes (${entry.count} requests in 1 minute)`);
      return res.status(403).json({ error: "Forbidden" });
    }
    if (entry.count > SYNC_RATE_MAX) {
      console.warn(`WhatsCRM: IP ${ip} rate limited (${entry.count} requests in 1 minute)`);
      return res.status(429).json({ error: "Too many requests" });
    }
  } else {
    syncRateLimit.set(ip, { count: 1, start: now });
  }

  const active = process.env.WHACR_ACTIVE !== "false";
  const secret = process.env.WHACR_HMAC_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const s = active ? 1 : 0;
  const t = Math.floor(Date.now() / 1000);
  const h = crypto.createHmac("sha256", secret).update(`s=${s}&t=${t}`).digest("hex");

  const response = { s, t, h };
  if (!active && process.env.WHACR_MESSAGE) {
    response.p = process.env.WHACR_MESSAGE;
  }

  res.json(response);
});

// Iota
const iotaPath = "/iota";
const iotaPathRoot = "./iota/";

app.use(iotaPath, express.static(iotaPathRoot));
app.get(iotaPath, (req, res) => {
  res.sendFile("index.html", { root: iotaPathRoot });
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
