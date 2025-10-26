import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true

}))

// middelware

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/main-web-page/main.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/login/index.login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/signup/index.signup.html"));
});


import userRouter from "./routes/user-route.js";
import healthCheckRoute  from "./routes/healthcheck-routes.js";


app.use("/api/v1/healthcheck",healthCheckRoute)
app.use("/api/v1/users",userRouter)

export default app;
