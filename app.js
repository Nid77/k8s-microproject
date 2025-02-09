const express = require("express");
const app = express();
const port = 3000;
const started = new Date();  // Enregistre l'heure de démarrage de l'application

const fs = require("node:fs");

app.get("/", (req, res) => {
  res.send("Hello, Kubernetes!");
  const name = process.env.USER_NAME || "name unset";
  const content = `Hello, ${name}! \n`;
  fs.writeFile("./out.log", content, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("File written successfully");
    }
  });
});

app.get('/healthz', (req, res) => {
  const duration = (new Date() - started) / 1000;  
  if (duration > 10) {
    res.status(500).send(`error: ${duration}`); 
  } else {
    res.status(200).send('ok');
  }
});


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
