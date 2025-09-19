import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB)
        console.log("MongoDB is connected");
    } catch (error) {
        console.error("MongoDB connection error", error)
        process.exit(1)
    }
}

export default connectDB    