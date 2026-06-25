import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./db/index.js";
dotenv.config()
const port = process.env.PORT || 3000;


connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`server is listening at ${port} `);
        });

    }).catch((err) => {
        console.log("Mongo Db connection error", err);

    }) 
 