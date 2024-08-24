import { Model, DataTypes } from "sequelize";
import sequelize from "./initSequalize.js";

class UserFilter extends Model {
  declare id: number;
  declare UserId: number;
  public price_limit!: number | null;
  public move_in_date!: Date | null;
  public num_beds!: number[] | null;
  public num_baths!: number[] | null;
  public num_parking!: number[] | null;
  public furnished!: boolean | null;
  public pet_friendly!: boolean | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserFilter.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 5000,
      },
    },
    furnished: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    pet_friendly: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    num_beds: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    num_baths: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    num_parking: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    move_in_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "UserFilter",
  }
);
export default UserFilter;
