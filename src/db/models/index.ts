import sequelize from "./initSequalize.js";
import User from "./User.js";
import UserFilter from "./UserFilter.js";
import Listing from "./Listing.js";
import UserListingTable from "./UserListingTable.js";
import ListingParameters from "./ListingParameters.js";

// ASSOCIATIONS
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

sequelize.sync().then(() => {
  console.log("Database & tables created!");
});

export { sequelize, User, UserFilter, Listing, ListingParameters };
