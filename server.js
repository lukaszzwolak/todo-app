const express = require("express");
const app = express();

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...");
});

app.use((req, res) => {
  res.status(404).send({ message: "Not Found..." });
});
