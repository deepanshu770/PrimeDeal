import { faker } from "@faker-js/faker/locale/en_IN";
import { PrismaClient, Unit } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PrimeDeal database with Indian dataset...");

  // ------------------ ADMINS ------------------
  await prisma.user.createMany({
    data: [
      {
        fullname: "Ravi Sharma",
        email: "admin1@primedeal.in",
        phoneNumber: "9876543210",
        passwordHash: "hashed_admin_password",
        admin: true,
      },
      {
        fullname: "Priya Mehta",
        email: "admin2@primedeal.in",
        phoneNumber: "9998887776",
        passwordHash: "hashed_admin_password",
        admin: true,
      },
      {
        fullname: "Arjun Patel",
        email: "admin3@primedeal.in",
        phoneNumber: "9822334455",
        passwordHash: "hashed_admin_password",
        admin: true,
      },
    ],
  });
  console.log("👑 Admins created: 3");

  // ------------------ USERS + ADDRESSES ------------------
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        fullname: faker.person.fullName(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number(),
        passwordHash: "hashed_user_password",
        addresses: {
          createMany: {
            data: [
              {
                addressLine1: faker.location.streetAddress(),
                addressLine2: faker.location.secondaryAddress(),
                city: "Bhopal",
                state: "Madhya Pradesh",
                postalCode: faker.location.zipCode("4620##"),
                country: "India",
                latitude: 23.2599 + Math.random() * 0.02,
                longitude: 77.4126 + Math.random() * 0.02,
                isDefault: true,
              },
              {
                addressLine1: faker.location.streetAddress(),
                city: "Bhopal",
                state: "Madhya Pradesh",
                postalCode: faker.location.zipCode("4620##"),
                country: "India",
                latitude: 23.2599 + Math.random() * 0.02,
                longitude: 77.4126 + Math.random() * 0.02,
                isDefault: false,
              },
            ],
          },
        },
      },
    });
    users.push(user);
  }
  console.log("👤 Users created:", users.length, "with addresses in Bhopal");

  // ------------------ CATEGORIES ------------------
  const categories = await prisma.category.createMany({
    data: [
      { name: "Groceries", description: "Daily essentials and staples" },
      { name: "Snacks & Beverages", description: "Chips, biscuits, drinks" },
      { name: "Personal Care", description: "Soaps, shampoos, hygiene" },
      { name: "Household", description: "Cleaners, detergents, tools" },
      { name: "Dairy & Bakery", description: "Milk, butter, cheese, bread" },
      { name: "Baby & Health", description: "Baby food, health supplements" },
    ],
  });
  const allCategories = await prisma.category.findMany();
  console.log("🏷️ Categories created:", allCategories.length);

  // ------------------ SHOPS ------------------
  const shopNames = [
    "Fresh Basket Bhopal",
    "SuperMart TT Nagar",
    "SmartShop Arera Colony",
    "DailyNeeds MP Nagar",
    "Prime Grocery Habibganj",
    "QuickKart New Market",
  ];

  const shops = [];
  for (const [i, name] of shopNames.entries()) {
    const shop = await prisma.shop.create({
      data: {
        userId: (i % 3) + 1,
        storeName: name,
        description: "Your trusted local grocery store in Bhopal",
        storeBanner: `https://placehold.co/600x200?text=${encodeURIComponent(name)}`,
        city: "Bhopal",
        address: faker.location.streetAddress(),
        latitude: 23.2599 + Math.random() * 0.02,
        longitude: 77.4126 + Math.random() * 0.02,
        deliveryTime: faker.number.int({ min: 20, max: 45 }),
      },
    });
    shops.push(shop);
  }
  console.log("🏬 Shops created in Bhopal:", shops.length);

  // ------------------ PRODUCTS ------------------
  const baseProducts = [
    ["Amul Butter", "Amul", "Creamy salted butter", "https://m.media-amazon.com/images/I/81PnTbA3p2L._SL1500_.jpg"],
    ["Britannia Bread", "Britannia", "Soft & fresh bread", "https://m.media-amazon.com/images/I/71hDg+PytqL._SL1500_.jpg"],
    ["Mother Dairy Milk", "Mother Dairy", "Toned milk rich in calcium", "https://m.media-amazon.com/images/I/61WW8g5Q7VL._SL1500_.jpg"],
    ["Parle-G Biscuits", "Parle", "Classic glucose biscuits", "https://m.media-amazon.com/images/I/61Xzj4wzK7L._SL1000_.jpg"],
    ["Tata Salt", "Tata", "Iodized crystal salt", "https://m.media-amazon.com/images/I/51ZqYvO3TqL._SL1000_.jpg"],
    ["Fortune Sunflower Oil", "Fortune", "Refined cooking oil", "https://m.media-amazon.com/images/I/71wX4QvGZpL._SL1500_.jpg"],
    ["Lays Chips", "Lays", "Crispy salted potato chips", "https://m.media-amazon.com/images/I/81oXrK5Z4jL._SL1500_.jpg"],
    ["Colgate Toothpaste", "Colgate", "Strong teeth protection", "https://m.media-amazon.com/images/I/81BbHibJwZL._SL1500_.jpg"],
    ["Dove Shampoo", "Dove", "Moisturizing shampoo", "https://m.media-amazon.com/images/I/61EhA0CfpDL._SL1500_.jpg"],
    ["Surf Excel Detergent", "Surf Excel", "Powerful stain remover", "https://m.media-amazon.com/images/I/81y0yO8yFVL._SL1500_.jpg"],
  ];

  const products = [];
  for (let i = 0; i < 100; i++) {
    const base = faker.helpers.arrayElement(baseProducts);
    const cat = faker.helpers.arrayElement(allCategories);
    products.push({
      name: `${base[0]} ${faker.number.int({ min: 200, max: 1000 })}${faker.helpers.arrayElement(["g", "ml"])}`,
      brand: base[1],
      description: base[2],
      image: base[3],
      netQty: faker.helpers.arrayElement(["250g", "500g", "1L", "2L"]),
      categoryId: cat.id,
    });
  }
  await prisma.product.createMany({ data: products });
  const allProducts = await prisma.product.findMany();
  console.log("📦 Products created:", allProducts.length);

  // ------------------ SHOP INVENTORY ------------------
  const unitOptions = [Unit.g, Unit.kg, Unit.ml, Unit.l, Unit.pcs, Unit.pack, Unit.box, Unit.bottle];
  const inventoryData = [];
  const usedPairs = new Set<string>();

  while (inventoryData.length < 200) {
    const shop = faker.helpers.arrayElement(shops);
    const product = faker.helpers.arrayElement(allProducts);
    const key = `${shop.id}-${product.id}`;
    if (usedPairs.has(key)) continue;
    usedPairs.add(key);

    inventoryData.push({
      shopId: shop.id,
      productId: product.id,
      price: faker.number.float({ min: 10, max: 600}),
      quantity: faker.number.int({ min: 5, max: 150 }),
      netQty: faker.number.float({ min: 0.25, max: 5 }),
      unit: faker.helpers.arrayElement(unitOptions),
      isAvailable: true,
    });
  }

  await prisma.shopInventory.createMany({ data: inventoryData });
  console.log("🧾 ShopInventories created:", inventoryData.length);

  console.log("✅ Indian database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
