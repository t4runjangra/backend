import express from "express"
import cors from "cors"

const app = express()

// basic configs 
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true , limit: "16kb"}))
app.use(express.static("public"))

// cors configuration
app.use(cors({
  origin : process.env.CORS_ORIGIN?.split(",") || "https://localhost:5173",
  credentials:true,
  methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders:["Content-Type","Authorization"]
}))

import healthCheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth-route.js"
app.use("/api/v1/healthcheck",healthCheckRouter)

app.use("/api/v1/auth",authRouter)


app.get("/", (request, response) => {
  response.send("hello");
});

app.get("/tarun",(request, response)=>{
    response.send("Tarun here!")
})
export default app