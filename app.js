const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Configuration et routes de votre application
// Exemple :
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});