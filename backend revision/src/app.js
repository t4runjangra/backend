import express from "express"
import { userRoute } from "./routes/user.routes.js";
const app = express();

app.use(express.json())

app.use("/users", userRoute)

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next()
})

app.get('/', (req, res) => {
    res.send("backend Revision started")
})

export default app