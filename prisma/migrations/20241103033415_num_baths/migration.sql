/*
  Warnings:

  - The `num_baths` column on the `UserFilter` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `num_beds` column on the `UserFilter` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `num_parking` column on the `UserFilter` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserFilter" DROP COLUMN "num_baths",
ADD COLUMN     "num_baths" INTEGER[],
DROP COLUMN "num_beds",
ADD COLUMN     "num_beds" INTEGER[],
DROP COLUMN "num_parking",
ADD COLUMN     "num_parking" INTEGER[];
