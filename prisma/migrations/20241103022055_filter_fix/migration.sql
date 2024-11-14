/*
  Warnings:

  - The `num_baths` column on the `UserFilter` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `num_beds` column on the `UserFilter` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `num_parking` column on the `UserFilter` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserFilter" ALTER COLUMN "furnished" DROP NOT NULL,
ALTER COLUMN "gender_preference" DROP NOT NULL,
ALTER COLUMN "gender_preference" SET DATA TYPE TEXT,
ALTER COLUMN "move_in_date" DROP NOT NULL,
DROP COLUMN "num_baths",
ADD COLUMN     "num_baths" DOUBLE PRECISION,
DROP COLUMN "num_beds",
ADD COLUMN     "num_beds" DOUBLE PRECISION,
DROP COLUMN "num_parking",
ADD COLUMN     "num_parking" DOUBLE PRECISION,
ALTER COLUMN "pets" DROP NOT NULL,
ALTER COLUMN "price_limit" DROP NOT NULL,
ALTER COLUMN "price_limit" SET DATA TYPE DOUBLE PRECISION;
