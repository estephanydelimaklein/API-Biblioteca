import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI não foi encontrada no arquivo .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Conectado com o MongoDB");
};

export default connectDB;