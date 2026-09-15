const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


async function fixSubscriber() {
  await prisma.subscriber.update({
    where: { id: "3" }, 
    data: { consented: true }
  });
  console.log("Successfully updated!");
}
fixSubscriber();