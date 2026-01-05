import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from 'dotenv';

config(); // Load environment variables

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  // Create a test campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Holiday Season 2025',
      status: 'ACTIVE',
      startsAt: new Date(),
      endsAt: new Date('2025-12-31'),
      dropOffDeadline: new Date('2025-12-20'),
      dropOffAddress: '123 Main St, Fox River Grove, IL',
    },
  });

  console.log('Created campaign:', campaign);

  // Create a test family
  const family = await prisma.family.create({
    data: {
      alias: 'Test Family',
      campaignId: campaign.id,
    },
  });

  console.log('Created family:', family);

  // Create a test gift
  const gift = await prisma.gift.create({
    data: {
      name: 'LEGO Set',
      description: 'Building blocks for creative play',
      quantity: 1,
      familyId: family.id,
    },
  });

  console.log('Created gift:', gift);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
