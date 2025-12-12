import express from "express";
import { connectDB } from "../lib/db.js";
import { updateReportTradeData } from "../controllers/reportTradeController.js";


const reportTradeRouter = express.Router();

reportTradeRouter.post("/updateReportData",async(req, res)=>{
    await connectDB();
    return updateReportTradeData(req,res);
});

export default reportTradeRouter;