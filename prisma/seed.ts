import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
 {
    email: "admin@saloonama.lk",
    firstName: "Admin",
    lastName: "Ama",
    password: "$2a$12$HXwobrI/2W2Gnc9nWAQGYeEh4ZCyIFC5p7SjEOZTNAhhM.8I3gT6G",
    role: "ADMIN",
    privileges: ["READ", "WRITE", "DELETE" ]
 }
  
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();