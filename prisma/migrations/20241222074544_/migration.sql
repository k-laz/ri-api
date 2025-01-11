/*
  Warnings:

  - You are about to drop the column `price_limit` on the `UserFilter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserFilter" DROP COLUMN "price_limit",
ADD COLUMN     "max_price" DOUBLE PRECISION,
ADD COLUMN     "min_price" DOUBLE PRECISION;
