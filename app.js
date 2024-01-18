const express = require("express");
const path = require("path");
const app = new express();
app.use("/node_modules", express.static(path.join(__dirname, "/node_modules")));
app.use(express.static(path.join(__dirname, "/public")));
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
