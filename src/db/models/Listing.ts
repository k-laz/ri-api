import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "./initSequalize.js";
import ListingParameters, {
  ListingParametersCreationAttributes,
} from "./ListingParameters.js";

// Define the attributes for the Listing model
interface ListingAttributes {
  id: number;
  title: string;
  link: string;
  pub_date: Date;
}

// Define the creation attributes for the Listing model
// Making id optional since it will be auto-incremented by the database
export interface ListingCreationAttributes
  extends Optional<ListingAttributes, "id"> {}

// Define the Listing model class
class Listing
  extends Model<ListingAttributes, ListingCreationAttributes>
  implements ListingAttributes
{
  declare id: number;
  public title!: string;
  public link!: string;
  public pub_date!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association method for ListingParameters
  public async upsertParameters(
    parameterData: Partial<ListingParameters>
  ): Promise<ListingParameters> {
    let parameters = await ListingParameters.findOne({
      where: { ListingId: this.id },
    });

    if (parameters) {
      await parameters.update(parameterData);
    } else {
      parameters = await ListingParameters.create({
        ...parameterData,
        ListingId: this.id,
      } as ListingParametersCreationAttributes);
    }

    return parameters;
  }

  // Method to upsert parameters
  // public async upsertParameters(
  //   parameterData: Partial<ListingParametersCreationAttributes>
  // ): Promise<ListingParameters> {
  //   // Use Sequelize association methods to simplify the process
  //   const parameters = await this.getParameters();
  //   if (parameters) {
  //     await parameters.update(parameterData);
  //     return parameters;
  //   } else {
  //     return await this.createParameters(parameterData);
  //   }
  // }

  // public async setParameters(
  //   parameters: ListingParametersCreationAttributes
  // ): Promise<ListingParameters> {
  //   const params = await ListingParameters.create({
  //     ...parameters,
  //     id: this.id,
  //   });
  //   return params;
  // }
}

// Initialize the Listing model
Listing.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pub_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Listing",
    tableName: "Listings", // Explicitly set table name if different from model name
    timestamps: true, // Enable timestamps if not already enabled
  }
);

export default Listing;
