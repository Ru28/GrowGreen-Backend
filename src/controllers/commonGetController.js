import ActiveTrade from "../models/activeTradeSchema.js";
import CloseTrade from "../models/closeTradeSchema.js";
import ReportData from "../models/reportDataSchema.js";

export const getAllTradeData = async(req, res)=>{
    try{
        const activeTrades = await ActiveTrade.find();
        const closeTrades = await CloseTrade.find();
        const reportData = await ReportData.find();

        const growGreenData = {
            activeTrades,
            closeTrades,
            reportData
        }
        return res.status(200).json({sucess:true,data:growGreenData, message:"Trade Data fetch successfully"});
    }
    catch(err){
        return res.status(500).json({sucess:false,message:err.message});
    }
}