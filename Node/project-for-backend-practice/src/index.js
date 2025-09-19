import dotenv from "dotenv";
import app from "./app.js"
import connectDB from "./db/database.js";

dotenv.config({
  path: "./.env",
});
let port = process.env.port || 8000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`is listening at http://localhost:${port}`);
    });

  }).catch((err) => {
    console.error("Mongo Connection Error", err)
    process.exit(1)
  })