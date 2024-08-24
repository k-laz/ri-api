import { Model, DataTypes } from "sequelize";
import sequelize from "./initSequalize.js";
import Listing from "./Listing.js";
import UserFilter from "./UserFilter.js";
import UserListingTable from "./UserListingTable.js";

class User extends Model {
  declare id: number;
  public firebaseUId!: string;
  public email!: string;
  public role!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance method to add or edit a filter
  public async upsertFilter(
    filterData: Partial<UserFilter>
  ): Promise<UserFilter> {
    let filter = await UserFilter.findOne({
      where: { UserId: this.id },
    });

    if (filter) {
      await filter.update(filterData);
    } else {
      filter = await UserFilter.create({
        ...filterData,
        UserId: this.id,
      });
    }

    return filter;
  }

  public async addListing(listing: Listing): Promise<Listing> {
    await UserListingTable.create({
      UserId: this.id,
      ListingId: listing.id,
    });

    return listing;
  }

  public async getAllListings(): Promise<Listing[]> {
    const listings = await Listing.findAll({
      include: [
        {
          model: User,
          through: {
            where: { UserId: this.id },
          },
        },
      ],
    });

    return listings;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firebaseUId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

export default User;
