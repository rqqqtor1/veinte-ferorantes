import mongoose from "mongoose";

const URI = process.env.MONGODB_URI || "mongodb+srv://jferorantes:Ziccoproxd1@fer.yxjrlpk.mongodb.net/PartPlus?retryWrites=true&w=majority&appName=FER";

// Connection options for better performance and reliability
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Connect to MongoDB
mongoose.connect(URI, options);

const connection = mongoose.connection;

connection.once("open", () => {
  console.log(" MongoDB Connected successfully");
  console.log(` Database: ${connection.name}`);
});

connection.on("disconnected", () => {
  console.log("📴 MongoDB disconnected");
});

connection.on("error", (error) => {
  console.error(" MongoDB connection error:", error.message);
});

// Handle connection events for better debugging
connection.on('connecting', () => {
  console.log(' Connecting to MongoDB...');
});

connection.on('reconnected', () => {
  console.log(' MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log(' MongoDB connection closed through app termination');
  process.exit(0);
});

export default connection;