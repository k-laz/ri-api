import {
  PrismaClient,
  User,
  Listing,
  UserFilter,
  ListingParameters,
} from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Export Prisma Client and models
export { prisma, User, Listing, UserFilter, ListingParameters };
