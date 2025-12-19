import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pharmacyRoutes from "../routes/pharmacy.js";
import customerRoutes from "../routes/customer.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/pharmacy", pharmacyRoutes);
app.use("/customer", customerRoutes);

export default app;   
