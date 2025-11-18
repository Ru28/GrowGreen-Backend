import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import activeTradeRoute from "./src/routes/activeTradeRouter.js";
import closeTradeRoute from "./src/routes/closeTradeRouter.js";
import allTradesRoute from "./src/routes/allTradeRouter.js";

dotenv.config();

const app= express();
const PORT = process.env.PORT || 5050;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((error) => console.error("❌ MongoDB Connection Error:", error));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.send("MongoDB Atlas connection successful!");
});

app.use("/api/activeTrade",activeTradeRoute);
app.use("/api/closeTrade",closeTradeRoute);
app.use("/api/getTrades",allTradesRoute);


app.listen(PORT,()=>{
    console.log(`🚀 Server running on port ${PORT}`);
});