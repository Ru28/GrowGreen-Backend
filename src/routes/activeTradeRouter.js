import express from "express";
import { deleteActiveTrade, setActiveTrade, updateActiveTrade } from "../controllers/activeTradeController.js";
import { connectDB } from "../lib/db.js";


const activeTradeRoute = express.Router();

activeTradeRoute.post("/setActiveTrade",async (req, res) => {
  await connectDB();   // <-- REQUIRED ON VERCEL
  return setActiveTrade(req, res);
});
activeTradeRoute.delete("/deleteActiveTrade/:id",async (req, res) => {
  await connectDB();   // <-- REQUIRED ON VERCEL
  return deleteActiveTrade(req, res);
});
activeTradeRoute.put("/updateActiveTrade/:id",async (req, res) => {
  await connectDB();   // <-- REQUIRED ON VERCEL
  return updateActiveTrade(req, res);
});

export default activeTradeRoute;