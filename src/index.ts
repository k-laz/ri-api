import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import listingRoutes from "./routes/listings.js";

dotenv.config();
const app = express();
const PORT = parseInt(process.env.PORT || "8080", 10);

app.use(bodyParser.json());
app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Allow your frontend's URL
//     methods: ["GET", "POST", "PUT", "DELETE"], // Specify the allowed methods
//     credentials: true, // Allow credentials if necessary (cookies, etc.)
//     allowedHeaders: ["Content-Type", "Authorization"], // Include any custom headers if needed
//   })
// );

app.options("*", cors());

// Use Routes
app.use("/users", userRoutes);
app.use("/listings", listingRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
