-- DropForeignKey
ALTER TABLE "UserFilter" DROP CONSTRAINT "UserFilter_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserFilter" ADD CONSTRAINT "UserFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
