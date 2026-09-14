/**
 * Creates (or updates the password for) an admin user with a securely
 * hashed password, so the login page can authenticate against it.
 *
 * Usage:
 *   node scripts/seedAdmin.js <username> <password>
 *
 * Example:
 *   node scripts/seedAdmin.js admin "S3cure-Passw0rd!"
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const [username, password] = process.argv.slice(2);

  if (!username || !password) {
    console.error("Usage: node scripts/seedAdmin.js <username> <password>");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { username },
    update: { password: hashed },
    create: { username, password: hashed },
  });

  console.log(`Admin user ready: ${admin.username} (id: ${admin.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
