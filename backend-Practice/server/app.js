import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/main-web-page/main.html"));
});



app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login/index.login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/signup/index.signup.html'));
});


export default app;
