import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pharmacyRoutes from "./routes/pharmacy.js";
import customerRoutes from "./routes/customer.js";
import debugRoutes from "./routes/debug.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/pharmacy", pharmacyRoutes);
app.use("/customer", customerRoutes);
app.use("/debug", debugRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
