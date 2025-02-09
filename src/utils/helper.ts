import { Listing, prisma, UserFilter } from "../models/index.js";

export async function filterListing(listing: Listing, userFilter: UserFilter) {
  try {
    const conditions: any[] = [];

    // Add price filter if provided
    if (userFilter.max_price != null) {
      conditions.push({
        price: {
          lte: userFilter.max_price,
        },
      });
    }

    if (userFilter.min_price != null) {
      conditions.push({
        price: {
          gte: userFilter.min_price,
        },
      });
    }

    // Add move-in date filter if provided
    if (userFilter.move_in_date != null) {
      conditions.push({
        availability: {
          gte: userFilter.move_in_date,
        },
      });
    }

    // Add beds filter if provided and has values
    if (userFilter.num_beds?.length > 0) {
      conditions.push({
        OR: [{ num_beds: { in: userFilter.num_beds } }, { num_beds: null }],
      });
    }

    // Add baths filter if provided and has values
    if (userFilter.num_baths?.length > 0) {
      conditions.push({
        OR: [{ num_baths: { in: userFilter.num_baths } }, { num_baths: null }],
      });
    }

    // Add parking filter if provided and has values
    if (userFilter.num_parking?.length > 0) {
      conditions.push({
        OR: [{ parking: { in: userFilter.num_parking } }, { parking: null }],
      });
    }

    // Add furnished filter if provided
    if (userFilter.furnished != null) {
      conditions.push({
        furnished: userFilter.furnished,
      });
    }

    // Add pets filter if provided
    if (userFilter.pets != null) {
      conditions.push({
        pets: userFilter.pets,
      });
    }

    // Only include AND clause if there are conditions
    const where =
      conditions.length > 0
        ? {
            AND: [
              { listingId: listing.id }, // Add the specific listing ID
              ...conditions,
            ],
          }
        : { listingId: listing.id };

    const matchedListing = await prisma.listingParameters.findFirst({
      where,
      include: {
        listing: true,
      },
    });

    return matchedListing;
  } catch (error) {
    console.error("Error filtering listing:", error);
    throw new Error("Error filtering listing");
  }
}

export async function getAllFilteredListings(userFilter: Partial<UserFilter>) {
  try {
    // Build filter conditions dynamically
    const conditions: any[] = [];

    // Add price filter if provided
    if (userFilter.max_price != null) {
      conditions.push({
        price: {
          lte: userFilter.max_price,
        },
      });
    }

    if (userFilter.min_price != null) {
      conditions.push({
        price: {
          gte: userFilter.min_price,
        },
      });
    }

    // Add move-in date filter if provided
    if (userFilter.move_in_date != null) {
      conditions.push({
        availability: {
          gte: userFilter.move_in_date,
        },
      });
    }

    // Add beds filter if provided
    if (userFilter.num_beds?.length != null) {
      conditions.push({
        OR: [{ num_beds: { in: userFilter.num_beds } }, { num_beds: null }],
      });
    }

    // Add baths filter if provided
    if (userFilter.num_baths?.length != null) {
      conditions.push({
        OR: [{ num_baths: { in: userFilter.num_baths } }, { num_baths: null }],
      });
    }

    // Add parking filter if provided
    if (userFilter.num_parking?.length != null) {
      conditions.push({
        OR: [{ parking: { in: userFilter.num_parking } }, { parking: null }],
      });
    }

    // Add furnished filter if provided
    if (userFilter.furnished != null) {
      conditions.push({
        furnished: userFilter.furnished,
      });
    }

    // Add pets filter if provided
    if (userFilter.pets != null) {
      conditions.push({
        pets: userFilter.pets,
      });
    }

    // Only include AND clause if there are conditions
    const where = conditions.length > 0 ? { AND: conditions } : {};

    const listings = await prisma.listingParameters.findMany({
      where,
      include: {
        listing: true,
      },
    });

    return listings;
  } catch (error) {
    console.error("Error fetching filtered listings:", error);
    throw new Error("Error fetching filtered listings");
  }
}
