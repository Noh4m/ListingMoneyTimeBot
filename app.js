const express = require('express');
const app = express();
const puppeteerScript = require('./index'); // Remplacez par le chemin vers votre script Puppeteer

const PORT = process.env.PORT || 3000;

// Configuration et routes de votre application Express
// Exemple :
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  puppeteerScript(); // Exécutez votre script Puppeteer ici
});