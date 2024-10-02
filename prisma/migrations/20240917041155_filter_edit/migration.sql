/*
  Warnings:

  - You are about to drop the column `filterName` on the `UserFilter` table. All the data in the column will be lost.
  - Added the required column `pets` to the `ListingParameters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `furnished` to the `UserFilter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `length_of_stay` to the `UserFilter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `move_in_date` to the `UserFilter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pets` to the `UserFilter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_limit` to the `UserFilter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ListingParameters" ADD COLUMN     "pets" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "UserFilter" DROP COLUMN "filterName",
ADD COLUMN     "furnished" BOOLEAN NOT NULL,
ADD COLUMN     "gender_preference" TEXT[],
ADD COLUMN     "length_of_stay" INTEGER NOT NULL,
ADD COLUMN     "move_in_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "num_baths" INTEGER[],
ADD COLUMN     "num_beds" INTEGER[],
ADD COLUMN     "num_parking" INTEGER[],
ADD COLUMN     "pets" BOOLEAN NOT NULL,
ADD COLUMN     "price_limit" INTEGER NOT NULL;
