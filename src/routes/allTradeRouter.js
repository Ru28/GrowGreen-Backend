import express from "express";
import { getAllTradeData } from "../controllers/commonGetController.js";

const allTradesRoute = express.Router();


allTradesRoute.get("/getAllTradeData",getAllTradeData);

export default allTradesRoute;