import { afterAll, beforeAll } from "@jest/globals";
import mongoose from "mongoose";
import { connectToMongoDBTest } from "../src/database/mongodb";


beforeAll(async () => {
    await connectToMongoDBTest();
});

afterAll(async () => {
    await mongoose.connection.close();
});
