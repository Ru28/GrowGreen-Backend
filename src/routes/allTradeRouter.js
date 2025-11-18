import express from "express";
import { getAllTradeData } from "../controllers/commonGetController.js";
import { connectDB } from "../lib/db.js";

const allTradesRoute = express.Router();

allTradesRoute.get("/getAllTradeData", async (req, res) => {
  await connectDB();   // <-- REQUIRED ON VERCEL
  return getAllTradeData(req, res);
});

export default allTradesRoute;
