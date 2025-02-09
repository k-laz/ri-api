import { prisma } from "./dist/models/index.js";

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to database");
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log("Number of users:", userCount);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
