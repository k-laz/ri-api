import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import listingRoutes from "./routes/listings.js";

dotenv.config();
const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(bodyParser.json());
app.use(cors());

// Use Routes
app.use("/users", userRoutes);
app.use("/listings", listingRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
