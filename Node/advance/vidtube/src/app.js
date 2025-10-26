import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express()

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials:true
    })
)

// middlewares


app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// import routes 
import healtcheckRouter from './routes/healthcheck-route.js'
import userRouter from "./routes/routes.js"
import { errorHandler } from "./middlewares/error.middleware.js";
import pingRouter from "./routes/ping.js"


//routes
app.use("/api/v1", pingRouter);


app.use("/api/v1/healthcheck",healtcheckRouter)
app.use("/api/v1/users",userRouter)
app.use(errorHandler)
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
})


export {app}