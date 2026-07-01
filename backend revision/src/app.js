import express from "express"
import { userRoute } from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import noteRouter from "./routes/note.route.js";
const app = express();

app.use(express.json())

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next()
})






app.get('/', (req, res) => {
    res.send("backend Revision started")
})

app.use("/users", userRoute)

app.use("/api/v1/auth", authRouter)

app.use("/api/v1", noteRouter)
app.use((err, req, res, next) => {

    console.error(err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });

});

export default app