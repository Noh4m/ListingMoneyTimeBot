const express = require("express");
const { getDataAndRefresh } = require("./index");
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/scrape", (req, res) => {
    getDataAndRefresh(res);
});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});