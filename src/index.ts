// src/index.ts
import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import {
  Listing,
  ListingParameters,
  UserFilter,
  User,
} from "./db/models/index.js";
import { ListingCreationAttributes } from "./db/models/Listing.js";
import { ListingParametersCreationAttributes } from "./db/models/ListingParameters.js";
import admin from "./firebaseAdmin.js"; // Import Firebase Admin SDK

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());

// Middleware to verify Firebase ID tokens
const authenticateFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid };
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

const authorizeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const firebaseUId = req.user?.uid;
  console.log(firebaseUId);
  try {
    const user: User | null = await User.findOne({
      where: { firebaseUId: firebaseUId },
    });

    if (user && user.role === "admin") {
      next(); // User is admin, proceed to the next middleware
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Function to sync Firebase user with PostgreSQL
const syncFirebaseUser = async (firebaseUid: string, email: string) => {
  let user = await User.findOne({ where: { firebaseUId: firebaseUid } });

  if (!user) {
    user = await User.create({ firebaseUid, email });
  } else {
    await user.update({ email });
  }

  return user;
};

app.get("/users/me", authenticateFirebaseToken, async (req: Request, res) => {
  try {
    // Get the Firebase user ID from the token
    const firebaseUId = req.user?.uid;

    // Find the user profile based on the Firebase user ID
    const user = await User.findOne({
      where: { firebaseUId: firebaseUId },
      include: [UserFilter, Listing],
    });

    // If user profile is not found, return a 404 response
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user profile
    res.status(200).json(user);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
});

app.post(
  "/users/add",
  authenticateFirebaseToken,
  async (req: Request, res: Response) => {
    // Get firebaseUid and email from the verified token
    const firebaseUId = req.user?.uid;

    // TODO: should probably not send email, just fetch it from databse based on the firebase uid
    const { email } = req.body;

    // Check if the required fields are provided
    if (!firebaseUId || !email) {
      return res
        .status(400)
        .json({ error: "Missing required fields: firebaseUid, email" });
    }

    try {
      // Check if a user with the same firebaseUid already exists
      const existingUser = await User.findOne({
        where: { firebaseUId: firebaseUId },
      });

      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Create a new user
      const newUser = await User.create({ firebaseUId, email });

      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error adding user:", error);
      res
        .status(500)
        .json({ error: "An error occurred while adding the user" });
    }
  }
);

// TODO
app.post(
  "/listings/add/bulk",
  authenticateFirebaseToken,
  authorizeAdmin,
  async (req: Request, res: Response) => {
    console.log("INSIDE THE");
    try {
      const listings: Listing[] = req.body;
      console.log(listings);
      for (let i = 0; i < 3; i++) {
        console.log("Block statement execution no." + i);
      }
    } catch (error) {
      console.error("Error adding listings in bulk:", error);
      res
        .status(500)
        .json({ error: "An error occurred while adding listings" });
    }
  }
);

// Add listing and associate it with a user
app.post("/listings/associate", async (req: Request, res: Response) => {
  try {
    const { title, link, pub_date }: ListingCreationAttributes = req.body;
    const { ...parameters }: ListingParametersCreationAttributes = req.body;

    // Check if all required fields are provided
    if (!title || !link || !pub_date || !parameters) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Sync Firebase user with PostgreSQL
    const user = await syncFirebaseUser(req.body.firebaseUId, req.body.email);

    // Create listing parameters if they don't exist
    const listingParameters = await ListingParameters.create(parameters);

    // Create the new listing
    const newListing = await Listing.create({
      title,
      link,
      pub_date,
    });

    newListing.upsertParameters(listingParameters);

    // Associate the listing with the user
    await user.addListing(newListing);

    res
      .status(201)
      .json({ user: user, listing: newListing, parameters: listingParameters });
  } catch (error) {
    console.error("Error associating listing:", error);
    res
      .status(500)
      .json({ error: "An error occurred while associating the listing" });
  }
});

// Get user filter
app.get("/users/me/filter", authenticateFirebaseToken, async (req, res) => {
  let user = await User.findOne({ where: { firebaseUId: req.user?.uid } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const userFilter = await UserFilter.findOne({ where: { UserId: user.id } });
  if (!userFilter) {
    return res.status(404).json({ error: "Filter not found" });
  }
  res.json(userFilter);
});

// Update user filter
app.put("/users/me/filter", authenticateFirebaseToken, async (req, res) => {
  let user = await User.findOne({ where: { firebaseUId: req.user?.uid } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const filterData: Partial<UserFilter> = req.body;
  let userFilter = await UserFilter.findOne({
    where: { UserId: user.id },
  });

  if (userFilter) {
    await userFilter.update(filterData);
  } else {
    userFilter = await UserFilter.create({ ...filterData, UserId: user.id });
  }

  res
    .status(200)
    .json({ message: "Filter updated successfully", filter: userFilter });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
