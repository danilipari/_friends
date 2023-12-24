import { readdir, readFile, writeFile } from 'fs';
import { join } from 'path';

const htmlPath = './livia/html';
const langFilePath = './livia/translate/it.json';

readdir(htmlPath, (err, files) => {
  if (err) {
    console.error(err);
  } else {
    files.forEach(file => {
      const htmlFilePath = join(htmlPath, file);
      readFile(htmlFilePath, 'utf-8', (err, html) => {
        if (err) {
          console.error(err);
        } else {
          readFile(langFilePath, 'utf-8', (err, lang) => {
            if (err) {
              console.error(err);
            } else {
              const data = JSON.parse(lang);
              const newHtml = html.replace(/{{(\w+)}}/g, (match, key) => {
                return data[key] || match;
              });
              writeFile(htmlFilePath, newHtml, 'utf-8', err => {
                if (err) {
                  console.error(err);
                } else {
                  console.log(`File ${htmlFilePath} updated.`);
                }
              });
            }
          });
        }
      });
    });
  }
});