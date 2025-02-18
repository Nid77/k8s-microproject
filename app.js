const express = require("express");
const app = express();
const port = 3000;
const dataDir = '/data';

const fs = require("node:fs");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

app.get("/", (req, res) => {
  res.send("Hello, Kubernetes!");
  const name = process.env.USER_NAME || "name unset";
  const podName = process.env.HOSTNAME || "unknown";
  const content = `Hello, ${name}! \n`;
  const file = `out-${podName}.log`;
  fs.writeFile(`${dataDir}/${file}`, content, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`File ${file} written successfully`);
    }
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
