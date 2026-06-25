import mongoose from "mongoose";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)

        console.log(
            `\n MongoDB is connected! DB host : ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("Mongo DB Error ", error)
        process.exit(1)
    }
}

export default connectDB