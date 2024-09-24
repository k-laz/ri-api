/*
  Warnings:

  - Changed the type of `parking` on the `ListingParameters` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ListingParameters" DROP COLUMN "parking",
ADD COLUMN     "parking" INTEGER NOT NULL;
