import express from "express";
import { deleteCloseTrade, setCloseTrade, updateCloseTrade } from "../controllers/closeTradeController.js";

const closeTradeRoute=express.Router();

closeTradeRoute.post("/setCloseTrade/:id",setCloseTrade);
closeTradeRoute.put("/updateCloseTrade/:id",updateCloseTrade);
closeTradeRoute.delete("/deleteCloseTrade/:id",deleteCloseTrade);


export default closeTradeRoute;
