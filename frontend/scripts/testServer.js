// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");
const port = 1234;
const app = express();

const buildFolder = "dist";
app.use(express.static(path.join(__dirname, "..", buildFolder)));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", buildFolder, "static/index.html"), (err) => {
    if (err) {
      console.log(err);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
