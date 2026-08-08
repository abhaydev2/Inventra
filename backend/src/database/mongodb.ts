import mongoose from "mongoose";
import { MONGODB_URL } from "../configs/constant";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ProductModel } from "../models/product.model";
import { UserModel } from "../models/user.model";

import bcryptjs from "bcryptjs";

const INITIAL_PRODUCTS = [
  // 1. Shoes
  {
    name: "Sporty Running Shoes",
    sku: "SH-RUN-01",
    category: "Shoes",
    price: 4500,
    quantity: 20,
    lowStockThreshold: 5,
    description: "Responsive cushioning for everyday road runs. Lightweight, breathable mesh wrap with durable rubber outsole.",
    salesCount: 15,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60"
  },
  {
    name: "Classic Leather Shoes",
    sku: "SH-LEA-02",
    category: "Shoes",
    price: 6500,
    quantity: 12,
    lowStockThreshold: 3,
    description: "Handcrafted genuine leather oxfords. Elegant design suitable for formal occasions and corporate boardrooms.",
    salesCount: 3,
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=60"
  },
  {
    name: "Casual Canvas Sneakers",
    sku: "SH-CAS-03",
    category: "Shoes",
    price: 3500,
    quantity: 25,
    lowStockThreshold: 5,
    description: "Timeless high-top silhouette in black canvas. Comfortable footbed and vulcanized rubber sole for daily wear.",
    salesCount: 19,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=60"
  },

  // 2. Electronics
  {
    name: "Wireless Bluetooth Headphones",
    sku: "EL-HD-01",
    category: "Electronics",
    price: 8500,
    quantity: 15,
    lowStockThreshold: 5,
    description: "Studio quality audio with active noise cancellation. Ergonomic ear cups and up to 40 hours of playtime.",
    salesCount: 8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60"
  },
  {
    name: "Smart Fitness Band",
    sku: "EL-SW-02",
    category: "Electronics",
    price: 5000,
    quantity: 8,
    lowStockThreshold: 3,
    description: "High-resolution AMOLED display tracking heart rate, sleep metrics, active calories, and daily workouts.",
    salesCount: 12,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=60"
  },
  {
    name: "Flexible LED Desk Lamp",
    sku: "EL-DL-03",
    category: "Electronics",
    price: 1800,
    quantity: 30,
    lowStockThreshold: 5,
    description: "Adjustable brightness levels and color temperatures. Touch control with USB charging port.",
    salesCount: 22,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=60"
  },

  // 3. Stationery
  {
    name: "Premium Hardcover Notebooks",
    sku: "ST-NB-01",
    category: "Stationery",
    price: 850,
    quantity: 40,
    lowStockThreshold: 10,
    description: "120 GSM thick acid-free lined pages. Lay-flat design with durable leatherette hardcover and ribbon marker.",
    salesCount: 25,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop&q=60"
  },
  {
    name: "Fine Tip Gel Pens 10-Pack",
    sku: "ST-GP-02",
    category: "Stationery",
    price: 450,
    quantity: 50,
    lowStockThreshold: 15,
    description: "Smudge-resistant black gel ink with 0.5mm precision tips. Soft rubber grips for fatigue-free writing.",
    salesCount: 30,
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=60"
  },
  {
    name: "Multi-slot Desk Organizer",
    sku: "ST-DO-03",
    category: "Stationery",
    price: 1200,
    quantity: 18,
    lowStockThreshold: 5,
    description: "Sleek metal mesh container. Compartments for files, letters, calculators, notebooks, and writing accessories.",
    salesCount: 14,
    image: "https://images.unsplash.com/photo-1590790313380-4aa1fa7db2d3?w=600&auto=format&fit=crop&q=60"
  },

  // 4. Utensils
  {
    name: "Artisan Ceramic Mug Set",
    sku: "UT-CM-01",
    category: "Utensils",
    price: 1500,
    quantity: 22,
    lowStockThreshold: 10,
    description: "Set of 2 glaze-finished stoneware mugs. Microwave and dishwasher safe, ideal for hot tea and coffee.",
    salesCount: 11,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60"
  },
  {
    name: "Classic Non-stick Fry Pan",
    sku: "UT-NP-02",
    category: "Utensils",
    price: 2800,
    quantity: 12,
    lowStockThreshold: 3,
    description: "Heavy gauge aluminum pan with professional-grade non-stick coating. Induction compatible base.",
    salesCount: 9,
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=60"
  },
  {
    name: "Stainless Steel Cutlery 24-pc",
    sku: "UT-CS-03",
    category: "Utensils",
    price: 3500,
    quantity: 10,
    lowStockThreshold: 3,
    description: "Premium food-grade 18/10 stainless steel mirror-polished cutlery set for 6 diners. Rust-resistant and heavy-duty.",
    salesCount: 4,
    image: "https://images.unsplash.com/photo-1598514983318-29141990e2d8?w=600&auto=format&fit=crop&q=60"
  },

  // 5. Sports
  {
    name: "All-in-One Sports Gear Bag",
    sku: "SP-KB-01",
    category: "Sports",
    price: 3200,
    quantity: 15,
    lowStockThreshold: 4,
    description: "Water-resistant travel duffel with dedicated shoe tunnel, dry-wet pockets, and adjustable shoulder straps.",
    salesCount: 6,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60"
  },
  {
    name: "Standard Size 5 Football",
    sku: "SP-FB-02",
    category: "Sports",
    price: 1800,
    quantity: 25,
    lowStockThreshold: 6,
    description: "Machine-stitched 32-panel structure. Durable TPU skin for excellent flight trajectory and shape retention.",
    salesCount: 17,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=60"
  },
  {
    name: "English Willow Cricket Bat",
    sku: "SP-CB-03",
    category: "Sports",
    price: 9500,
    quantity: 5,
    lowStockThreshold: 2,
    description: "Handcrafted English Willow bat. Large sweet spot with light pickup, fitted with high grip handle wrapping.",
    salesCount: 5,
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop&q=60"
  }
];

export const connectToMongoDB = async () => {
  let memoryServer: MongoMemoryServer | undefined;
  let usingInMemory = false;

  try {
    // If explicitly requested via env var, start an in-memory MongoDB
    if (process.env.USE_IN_MEMORY_MONGO === "true") {
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      usingInMemory = true;
      console.log("Connected to in-memory MongoDB successfully");
    } else {
      // Try primary configured MongoDB URL first
      try {
        await mongoose.connect(MONGODB_URL);
        console.log("Connected to MongoDB successfully");
      } catch (err) {
        console.warn("Primary MongoDB connection failed:", err);
        console.warn("Falling back to in-memory MongoDB for development/testing.");
        memoryServer = await MongoMemoryServer.create();
        const uri = memoryServer.getUri();
        await mongoose.connect(uri);
        usingInMemory = true;
        console.log("Connected to in-memory MongoDB successfully");
      }
    }
        
        // Count products matching the new categories
        const currentHiveCount = await ProductModel.countDocuments({
            category: { $in: ["Shoes", "Electronics", "Stationery", "Utensils", "Sports"] }
        });
        
        // Count all products in the database
        const totalCount = await ProductModel.countDocuments();

        // Ensure there is an admin user on every startup. If none exists, create one
        // using env vars or sensible defaults (email: admin@gmail.com, password: admin123).
        try {
          const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
          const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

          let firstAdmin = await UserModel.findOne({ role: "admin" });
          if (!firstAdmin) {
            const userByEmail = await UserModel.findOne({ email: ADMIN_EMAIL });
            if (!userByEmail) {
              const hashed = await bcryptjs.hash(ADMIN_PASSWORD, 10);
              firstAdmin = await UserModel.create({
                firstName: "Admin",
                lastName: "User",
                email: ADMIN_EMAIL,
                username: "admin",
                password: hashed,
                role: "admin"
              } as any);
              console.log(`Default admin created: ${ADMIN_EMAIL}`);
            } else {
              // Promote existing user to admin
              userByEmail.role = "admin";
              await userByEmail.save();
              firstAdmin = userByEmail;
              console.log(`Existing user promoted to admin: ${ADMIN_EMAIL}`);
            }
          }

          const testUser = await UserModel.findOne({ email: "jane@example.com" });
          if (!testUser) {
              const hashed = await bcryptjs.hash("password123", 10);
              await UserModel.create({
                  firstName: "Jane",
                  lastName: "Doe",
                  email: "jane@example.com",
                  username: "janedoe",
                  password: hashed,
                  role: "user",
                  wishlist: []
              } as any);
              console.log("Playwright test user jane@example.com seeded");
          }

          // If database does not contain exactly our 15 categorized products or has legacy categories
          if (currentHiveCount < 15 || totalCount > currentHiveCount) {
            console.log("Database catalog out-of-sync. Clearing and seeding 15 standard products...");
            try {
              await ProductModel.deleteMany({}); // Clear everything first

              const creatorId = firstAdmin ? firstAdmin._id.toString() : "60c72b2f9b1d8e1f88a9e012";

              await ProductModel.create(
                INITIAL_PRODUCTS.map(prod => ({ ...prod, createdBy: creatorId }))
              );
              console.log("Database successfully seeded with 15 multi-category stock models!");
            } catch (err: any) {
              if (err.code === 11000) {
                console.log("Database already seeded by parallel process.");
              } else {
                throw err;
              }
            }
          } else {
            console.log("Database catalog already seeded and synchronized.");
          }
        } catch (err) {
          console.error("Error ensuring admin or seeding products:", err);
          throw err;
        }
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
};

export const connectToMongoDBTest = async () => {
    const testUrl = process.env.MONGODB_TEST_URL || "mongodb://localhost:27017/inventory-db-test";
    try {
        await mongoose.connect(testUrl);
        console.log("Connected to MongoDB Test successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB Test:", error);
        throw error;
    }
};