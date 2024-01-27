const express = require("express");
const path = require("path");
const port = 3000;

const app = new express();
app.use("/node_modules", express.static(path.join(__dirname, "/node_modules")));
app.use(express.static(path.join(__dirname, "/public")));
app.listen(port, () => {
  console.log("Server running on port 3000");
});
