import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "./initSequalize.js";

// Define the attributes for the Listing model
interface ListingParametersAttributes {
  id: number;
  price: number;
  move_in_date: Date;
  num_baths: number;
  num_beds: number;
  furnished: boolean;
  ListingId: number;
}

// Define the creation attributes for the Listing model
// Making id optional since it will be auto-incremented by the database
export interface ListingParametersCreationAttributes
  extends Optional<ListingParametersAttributes, "id" | "ListingId"> {}

class ListingParameters
  extends Model<
    ListingParametersAttributes,
    ListingParametersCreationAttributes
  >
  implements ListingParametersAttributes
{
  declare id: number;
  public price!: number;
  public move_in_date!: Date;
  public num_baths!: number;
  public num_beds!: number;
  public furnished!: boolean;
  declare ListingId: number;
}

ListingParameters.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    price: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    move_in_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    num_baths: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    num_beds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    furnished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ListingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ListingParameters",
  }
);

export default ListingParameters;
