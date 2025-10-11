import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

let port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`server is listening at ${port} `);
});
