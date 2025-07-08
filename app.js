import express from "express";
import "./database.js"
import clientRoutes from "./src/routes/Clientroutes.js";
import reservationRoutes from "./src/routes/Reservationroutes.js"
const app = express();


// Middleware para parsear JSON
app.use(express.json());

const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve("./rqqqtor1-PartPlus-1.0.0-resolved.json"), 'utf8')
)

// Rutas
app.use("/api/clients", clientRoutes);
app.use("api/reservation", reservationRoutes)

export default app;