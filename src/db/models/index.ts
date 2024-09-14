import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables based on the environment (dev or prod)
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.prod" });
} else {
  dotenv.config({ path: ".env.dev" });
}

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME!, // Database name
  process.env.DB_USER!, // Database user
  process.env.DB_PASSWORD!, // Database password
  {
    host: process.env.DB_HOST, // Database host (RDS endpoint or localhost)
    dialect: "postgres", // Using PostgreSQL as the dialect
    logging: console.log, // Enable logging
    // If using SSL for RDS, you can uncomment and configure SSL options
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   },
    // },
  }
);

// Define Models
const User = sequelize.define("User", {
  // Define your model attributes (e.g., id, name, etc.)
});

const UserFilter = sequelize.define("UserFilter", {
  // Define your model attributes (e.g., id, filter_name, etc.)
});

const Listing = sequelize.define("Listing", {
  // Define your model attributes (e.g., id, listing_name, etc.)
});

const UserListingTable = sequelize.define("UserListingTable", {
  // Define any association table attributes if needed
});

const ListingParameters = sequelize.define("ListingParameters", {
  // Define your model attributes (e.g., id, parameter_name, etc.)
});

// Set Up Associations
User.hasOne(UserFilter, {
  foreignKey: "UserId",
});
UserFilter.belongsTo(User, {
  foreignKey: "UserId",
});

User.belongsToMany(Listing, {
  through: UserListingTable,
  foreignKey: "UserId",
});
Listing.belongsToMany(User, {
  through: UserListingTable,
  foreignKey: "ListingId",
});

Listing.hasOne(ListingParameters, {
  foreignKey: "ListingId",
});
ListingParameters.belongsTo(Listing, {
  foreignKey: "ListingId",
});

// Sync the database and log success or errors
sequelize
  .sync()
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });

// Export everything if needed elsewhere
export { sequelize, User, UserFilter, Listing, ListingParameters };
