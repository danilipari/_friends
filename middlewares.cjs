const fs = require('fs');
const path = require('path');

/**
 * Middleware per leggere i file in una directory
 * @param {string} dirPath - Percorso della directory da leggere
 * @returns {Function} Middleware Express
 */
const middlewareReadFiles = (dirPath) => {
  return (req, res, next) => {
    try {
      const files = [];
      const readDir = (dir) => {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory()) {
            readDir(itemPath);
          } else {
            const relativePath = itemPath.replace(dirPath, '');
            files.push(relativePath);
          }
        });
      };
      
      readDir(dirPath);
      res.locals.readedFiles = files;
      next();
    } catch (error) {
      console.error('Errore nella lettura dei file:', error);
      next(error);
    }
  };
};

module.exports = {
  middlewareReadFiles
};