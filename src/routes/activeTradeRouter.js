import express from "express";
import { deleteActiveTrade, setActiveTrade, updateActiveTrade } from "../controllers/activeTradeController.js";


const activeTradeRoute = express.Router();

activeTradeRoute.post("/setActiveTrade",setActiveTrade);
activeTradeRoute.delete("/deleteActiveTrade/:id",deleteActiveTrade);
activeTradeRoute.put("/updateActiveTrade/:id",updateActiveTrade);

export default activeTradeRoute;