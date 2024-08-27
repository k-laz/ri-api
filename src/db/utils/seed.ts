import { sequelize, User } from "../models/index.js";
import Listing from "../models/Listing.js";
import generateListingHash from "./hash.js";

async function seed() {
  try {
    const user1 = await User.create({
      email: "example.com",
    });

    const filterData = {
      price_limit: 3000,
      furnished: false,
      min_beds: 2,
      max_beds: 2,
      min_baths: 2,
      max_baths: 2,
      move_in_date: new Date(),
    };

    const filter = await user1.upsertFilter(filterData);
    console.log(user1.toJSON());
    console.log(filter.toJSON());

    const listing = await Listing.create({
      title: "New Listing",
      link: "http://example.com/1234",
      hash: generateListingHash("http://example.com/1234"),
      pub_date: new Date(),
    });

    // Add association
    await user1.addListing(listing);

    if (user1) {
      const listings = await user1.getAllListings();
      console.log("Associated listings:", listings);
    }

    const parameterData = {
      price: 1500,
      move_in_date: new Date(),
      num_baths: 1,
      num_beds: 2,
      furnished: true,
    };

    const listingParameters = await listing.upsertParameters(parameterData);
    console.log("Listing parameters:", listingParameters.toJSON());

    console.log("Mock data created!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await sequelize.close();
  }
}

seed();
