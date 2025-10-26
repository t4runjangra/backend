import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`)
        console.log(
            `\nMongoDB is Connected! DB host: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("MONGO DB Connection Error", error);
        process.exit(1)

    }
}

export default connectDB