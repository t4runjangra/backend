import express from "express"
import { userRoute } from "./routes/user.routes.js";
import authRoute from "./routes/auth.routes.js";
import router from "./routes/auth.routes.js";
const app = express();

app.use(express.json())

app.use("/users", userRoute)

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next()
})

app.use("/api/v1/auth", router)
app.get('/', (req, res) => {
    res.send("backend Revision started")
})

export default app