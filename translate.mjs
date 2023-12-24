import { readdir, readFile, writeFile, stat } from 'fs';
import { join } from 'path';
import pkg from 'dotenv';

pkg.config({ path: `.env.${process.env.NODE_ENV}` });
const isProd = process.env.PROJECT === 'production';

const htmlPath = `./${process.env.PROJECT}/html`;
const langFilePath = `./${process.env.PROJECT}/translate/it.json`;
const devHtmlPath = `${htmlPath}-dev`;

console.log('translate envs -->', process.env.PROJECT, process.env.NODE_ENV);

const copyFile = (source, target) => {
  readFile(source, (err, data) => {
    if (err) {
      console.error(err);
    } else {
      writeFile(target, data, err => {
        if (err) {
          console.error(err);
        } else {
          console.log(`File ${target} copied.`);
        }
      });
    }
  });
};

const copyDirectory = (source, target) => {
  readdir(source, (err, files) => {
    if (err) {
      console.error(err);
    } else {
      files.forEach(file => {
        const sourcePath = join(source, file);
        const targetPath = join(target, file);
        stat(sourcePath, (err, stats) => {
          if (err) {
            console.error(err);
          } else {
            if (stats.isDirectory()) {
              copyDirectory(sourcePath, targetPath);
            } else {
              copyFile(sourcePath, targetPath);
            }
          }
        });
      });
    }
  });
};

readdir(htmlPath, (err, files) => {
  if (err) {
    console.error(err);
  } else {
    files.forEach(file => {
      const htmlFilePath = join(htmlPath, file);
      const targetHtmlPath = isProd ? htmlFilePath : join(devHtmlPath, file);
      if (isProd || htmlFilePath.includes('/html/')) {
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
                writeFile(targetHtmlPath, newHtml, 'utf-8', err => {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log(`File ${targetHtmlPath} updated.`);
                  }
                });
              }
            });
          }
        });
      } else {
        const sourcePath = htmlFilePath;
        const targetPath = join(devHtmlPath, file);
        stat(sourcePath, (err, stats) => {
          if (err) {
            console.error(err);
          } else {
            if (stats.isDirectory()) {
              copyDirectory(sourcePath, targetPath);
            } else {
              copyFile(sourcePath, targetPath);
            }
          }
        });
      }
    });
  }
});