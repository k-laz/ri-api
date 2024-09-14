-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firebaseUId" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFilter" (
    "id" SERIAL NOT NULL,
    "filterName" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "link" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pub_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingParameters" (
    "id" SERIAL NOT NULL,
    "price" INTEGER NOT NULL,
    "availability" TIMESTAMP(3) NOT NULL,
    "num_beds" INTEGER NOT NULL,
    "num_baths" INTEGER NOT NULL,
    "furnished" BOOLEAN NOT NULL,
    "parking" BOOLEAN NOT NULL,
    "listingId" INTEGER NOT NULL,

    CONSTRAINT "ListingParameters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUId_key" ON "User"("firebaseUId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserFilter_userId_key" ON "UserFilter"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_link_key" ON "Listing"("link");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_hash_key" ON "Listing"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "ListingParameters_listingId_key" ON "ListingParameters"("listingId");

-- AddForeignKey
ALTER TABLE "UserFilter" ADD CONSTRAINT "UserFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingParameters" ADD CONSTRAINT "ListingParameters_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
