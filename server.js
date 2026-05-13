const express = require("express");
const path = require("path");
const webhook = require("./routes/webhook");
const { setCredentials } = require("./credentialsManager");

const cors = require("cors");
const auth = require("./routes/auth");
const data = require("./routes/data");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/webhook", webhook);
app.use("/api/auth", auth);
app.use("/api/data", data);

app.post("/api/credentials", (req, res) => {
  const { accessToken, phoneId } = req.body;
  if (!accessToken || !phoneId) {
    return res.status(400).json({ error: "Missing tokens" });
  }
  setCredentials(accessToken, phoneId);
  res.status(200).json({ success: true });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Bot server running on port 3000");
  console.log("Visit http://localhost:3000 to setup your Facebook dynamic credentials.");
});
