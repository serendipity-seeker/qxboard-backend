import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { id: "user1" },
    update: {},
    create: {
      id: "user1"
    }
  });

  const user2 = await prisma.user.upsert({
    where: { id: "user2" },
    update: {},
    create: {
      id: "user2"
    }
  });

  console.log("Created users:", { user1, user2 });

  const assets = [
    {
      name: "CFB",
      issuer: "CFBMEMZOIDEXQAUXYYSZIURADQLAPWPMNJXQSNVQZAHYVOPYUKKJBJUCTVJL"
    },
    {
      name: "QFT",
      issuer: "TFUYVBXYIYBVTEMJHAJGEJOOZHJBQFVQLTBBKMEHPEVIZFXZRPEYFUWGTIWG"
    },
    {
      name: "QWALLET",
      issuer: "QWALLETSGQVAGBHUCVVXWZXMBKQBPQQSHRYKZGEJWFVNUFCEDDPRMKTAUVHA"
    },
    {
      name: "QCAP",
      issuer: "QCAPWMYRSHLBJHSTTZQVCIBARVOASKDENASAKNOBRGPFWWKRCUVUAXYEZVOG"
    },
    {
      name: "VSTB001",
      issuer: "VALISTURNWYFQAMVLAKJVOKJQKKBXZZFEASEYCAGNCFMZARJEMMFSESEFOWM"
    },
    {
      name: "QX",
      issuer: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB"
    },
    {
      name: "RANDOM",
      issuer: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB"
    },
    {
      name: "QUTIL",
      issuer: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB"
    },
    {
      name: "QTRY",
      issuer: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB"
    },
    {
      name: "MLM",
      issuer: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB"
    },
    {
      name: "QPOOL",
      issuer: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB"
    },
    {
      name: "QEARN",
      issuer: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB"
    },
    {
      name: "QVAULT",
      issuer: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB"
    },
    {
      name: "MSVAULT",
      issuer: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB"
    }
  ];

  // Create sample assets
  const createdAssets = [];
  for (const asset of assets) {
    const createdAsset = await prisma.asset.create({
      data: {
        name: asset.name,
        issuer: asset.issuer
      }
    });
    createdAssets.push(createdAsset);
  }

  console.log("Created assets:", createdAssets);

  // Create sample trades
  const trade1 = await prisma.trade.upsert({
    where: { id: 1 },
    update: {},
    create: {
      maker: user1.id,
      taker: user2.id,
      price: BigInt(1000),
      amount: BigInt(5),
      tick: 100,
      assetID: createdAssets[0].id,
      txHash: randomUUID()
    }
  });

  const trade2 = await prisma.trade.upsert({
    where: { id: 2 },
    update: {},
    create: {
      maker: user2.id,
      taker: user1.id,
      price: BigInt(2000),
      amount: BigInt(10),
      tick: 101,
      assetID: createdAssets[1].id,
      txHash: randomUUID()
    }
  });

  console.log("Created trades:", { trade1, trade2 });

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
