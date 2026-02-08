import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const URL = process.env.MONGO_URI;

console.log("DEBUG MONGO_URI =", URL); 

const connectDB = async () => {
    try {
        await mongoose.connect(URL);
        console.log('MongoDB Connected successfully');
    } catch (error) {
        console.log(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;