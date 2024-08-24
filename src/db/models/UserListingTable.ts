import { DataTypes, Model } from "sequelize";
import sequelize from "./initSequalize.js";

// Junction model for many-to-many relationship
class UserListingTable extends Model {
  public UserId!: number;
  public ListingId!: number;
}

UserListingTable.init(
  {
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
    },
    ListingId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Listings",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "UserListingTable",
    tableName: "UserListingTable",
    timestamps: true,
  }
);

export default UserListingTable;
