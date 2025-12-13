import ActiveTrade from "../models/activeTradeSchema.js";
import ReportData from "../models/reportDataSchema.js";


export const updateReportTradeData = async(req, res)=>{
    try{
        const {niftyClose, niftyFrom, investment,stopLoss} = req.body;
        if(!niftyClose || !niftyFrom || !investment || !stopLoss){
            return res.status(400).json({succes: false, message: "niftyClose, niftyfrom, investment, stopLoss"});
        }

        const findActiveTrades= await ActiveTrade.find();
        let currentValue =findActiveTrades.reduce((acc,activeTrade)=>{
            acc=acc+activeTrade.closePrice;
            return acc;
        },0);

        const niftyReturn = (((parseFloat(niftyClose)-parseFloat(niftyFrom))/parseFloat(niftyFrom))*100).toFixed(2);
        const growGreenReturn = (((parseFloat(investment)-parseFloat(currentValue))/parseFloat(investment))*100).toFixed(2);
        

        let findAndUpdateReportData= await ReportData.findOne();

        if(!findAndUpdateReportData){
            findAndUpdateReportData = await ReportData.create({
                niftyClose: niftyClose? parseFloat(niftyClose).toFixed(2):0,
                niftyfrom: niftyFrom? parseFloat(niftyFrom).toFixed(2):0,
                niftyReturn: niftyReturn? parseFloat(niftyReturn).toFixed(2):0,
                investment: investment? parseFloat(investment).toFixed(2):0,
                currentValue: currentValue? parseFloat(currentValue).toFixed(2):0,
                growGreenReturn: growGreenReturn? parseFloat(growGreenReturn).toFixed(2):0,
                stopLoss: stopLoss? parseFloat(stopLoss).toFixed(2):0,
            })
        }
        else{
            // Update existing document
            findAndUpdateReportData.niftyClose = niftyClose? parseFloat(niftyClose).toFixed(2): findAndUpdateReportData.niftyClose;
            findAndUpdateReportData.niftyFrom = niftyFrom? parseFloat(niftyFrom).toFixed(2): findAndUpdateReportData.niftyFrom;
            findAndUpdateReportData.niftyReturn = niftyReturn? niftyReturn:findAndUpdateReportData.niftyReturn;
            findAndUpdateReportData.investment = investment? parseFloat(investment).toFixed(2): findAndUpdateReportData.investment;
            findAndUpdateReportData.currentValue = parseFloat(currentValue).toFixed(2);
            findAndUpdateReportData.growGreenReturn = growGreenReturn? growGreenReturn: findAndUpdateReportData.growGreenReturn;
            findAndUpdateReportData.stopLoss = parseFloat(stopLoss);
            
            await findAndUpdateReportData.save();
        }

        return res.status(200).json({succes: true,data: findAndUpdateReportData, message:"update the report data successfully"});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({succes:false, message:"Internal server error" ,error})
    }
}