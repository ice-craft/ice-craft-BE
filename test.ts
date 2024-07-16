import express from "express";

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  console.log(process.cwd());
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server app listening on port ${port}`);
});
