import express from "express";
import "./database.js"
import fs from "fs";
import clientRoutes from "./src/routes/Clientroutes.js";
import reservationRoutes from "./src/routes/Reservationroutes.js"
import path from 'path';
import swaggerUI from 'swagger-ui-express';
const app = express();


// Middleware para parsear JSON
app.use(express.json());

const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve("./rqqqtor1-PartPlus-1.0.0-resolved.json"), 'utf8')
)

// Rutas
app.use("/api/clients", clientRoutes);
app.use("api/reservation", reservationRoutes)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

export default app;