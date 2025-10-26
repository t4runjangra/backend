import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
dotenv.config({
  path: "./.env",
});

let port = process.env.PORT || 8000;


connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`server is listening at ${port} `);
    });

  }).catch((err)=>{
    console.log("Mongo Db connection error", err);
    
  })