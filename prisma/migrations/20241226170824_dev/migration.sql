-- DropForeignKey
ALTER TABLE "ListingParameters" DROP CONSTRAINT "ListingParameters_listingId_fkey";

-- AddForeignKey
ALTER TABLE "ListingParameters" ADD CONSTRAINT "ListingParameters_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
