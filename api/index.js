const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const distPath = path.join(process.cwd(), 'dist');

app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.ttf')) {
      res.setHeader('Content-Type', 'font/ttf');
    } else if (filePath.endsWith('.woff')) {
      res.setHeader('Content-Type', 'font/woff');
    } else if (filePath.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    } else if (filePath.endsWith('.eot')) {
      res.setHeader('Content-Type', 'application/vnd.ms-fontobject');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    // Garante que o navegador não barre os assets por política de CORS local
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

module.exports = app;
