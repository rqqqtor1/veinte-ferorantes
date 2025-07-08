import mongoose from "mongoose"
const URI = "mongodb+srv://jferorantes:Ziccoproxd1@fer.yxjrlpk.mongodb.net/PartPlus?retryWrites=true&w=majority&appName=FER"

mongoose.connect(URI) 

const connection = mongoose.connection;

connection.once("open", () =>{
    console.log("BD is connected");
});

connection.on("disconnected", ()=>{
    console.log("server is connected")
})

connection.on("error", (error)=>{
    console.log("Error found" +  error)
})