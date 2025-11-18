import express from "express";
import { deleteCloseTrade, setCloseTrade, updateCloseTrade } from "../controllers/closeTradeController.js";
import { connectDB } from "../lib/db.js";

const closeTradeRoute=express.Router();

closeTradeRoute.post("/setCloseTrade/:id",async (req, res) => {
  await connectDB();   // <-- REQUIRED ON VERCEL
  return setCloseTrade(req, res);
});
closeTradeRoute.put("/updateCloseTrade/:id",async (req, res) => {
  await connectDB();   // <-- REQUIRED ON VERCEL
  return updateCloseTrade(req, res);
});
closeTradeRoute.delete("/deleteCloseTrade/:id",async (req, res) => {
  await connectDB();   // <-- REQUIRED ON VERCEL
  return deleteCloseTrade(req, res);
});


export default closeTradeRoute;
