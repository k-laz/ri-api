import { Listing, prisma } from "../models/index.js";

export async function filterListing(listing: Listing, userFilter: any) {
  try {
    const listings = await prisma.listingParameters.findMany({
      where: {
        AND: [
          {
            price: {
              lte: userFilter.price_limit, // Price <= user's limit
            },
          },
          {
            availability: {
              gte: userFilter.move_in_date, // Available after move-in date
            },
          },
          {
            OR: [
              { num_beds: { in: userFilter.num_beds } }, // Matches beds filter
              { num_beds: null }, // Allow null if bed count isn't specified
            ],
          },
          {
            OR: [
              { num_baths: { in: userFilter.num_baths } }, // Matches baths filter
              { num_baths: null }, // Allow null if bath count isn't specified
            ],
          },
          {
            OR: [
              { parking: { in: userFilter.num_parking } }, // Matches parking filter
              { parking: null }, // Allow null if parking isn't specified
            ],
          },
          {
            furnished: userFilter.furnished, // Matches furnished preference
          },
          {
            pets: userFilter.pets, // Matches pet allowance preference
          },
        ],
      },
      include: {
        listing: true, // Include associated listing details
      },
    });

    return listings;
  } catch (error) {
    console.error("Error fetching filtered listings:", error);
    throw new Error("Error fetching filtered listings");
  }
}

export async function getAllFilteredListings(userFilter: any) {
  try {
    const listings = await prisma.listingParameters.findMany({
      where: {
        AND: [
          {
            price: {
              lte: userFilter.price_limit, // Price <= user's limit
            },
          },
          {
            availability: {
              gte: userFilter.move_in_date, // Available after move-in date
            },
          },
          {
            OR: [
              { num_beds: { in: userFilter.num_beds } }, // Matches beds filter
              { num_beds: null }, // Allow null if bed count isn't specified
            ],
          },
          {
            OR: [
              { num_baths: { in: userFilter.num_baths } }, // Matches baths filter
              { num_baths: null }, // Allow null if bath count isn't specified
            ],
          },
          {
            OR: [
              { parking: { in: userFilter.num_parking } }, // Matches parking filter
              { parking: null }, // Allow null if parking isn't specified
            ],
          },
          {
            furnished: userFilter.furnished, // Matches furnished preference
          },
          {
            pets: userFilter.pets, // Matches pet allowance preference
          },
        ],
      },
      include: {
        listing: true, // Include associated listing details
      },
    });

    return listings;
  } catch (error) {
    console.error("Error fetching filtered listings:", error);
    throw new Error("Error fetching filtered listings");
  }
}
