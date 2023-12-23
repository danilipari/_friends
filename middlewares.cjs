const fs = require('fs');

const middlewareReadFiles = (folderPath) => (req, res, next) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.debug("Errore nella lettura della cartella:", err);
      res.locals.readedFiles = [];
    }

    res.locals.readedFiles = files;
    next();
  });
};

module.exports = {
  middlewareReadFiles,
};