import ActiveTrade from "../models/activeTradeSchema.js";
import CloseTrade from "../models/closeTradeSchema.js";
import ReportData from "../models/reportDataSchema.js";
import { generateTradeReportPDF } from "../services/pdfGenerator.js";


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

export const downloadReportPDF = async(req, res) => {
    try {
        const reportData = await ReportData.findOne();
        const activeTrades = await ActiveTrade.find();
        const closedTrades = await CloseTrade.find().sort({exitDate: -1});

        if(!reportData){
            return res.status(404).json({
                success: false,
                message: "Report data not found, Please set up Metrix first"
            });
        }

        // Format data for PDF
        const formattedReportData = {
            niftyClose: reportData.niftyClose || "26,100",
            currentValue: reportData.currentValue || 502940,
            niftyReturn: reportData.niftyReturn || "6.17%",
            growgreenReturn: reportData.growgreenReturn || "5.88%",
            maxDrawdown: reportData.maxDrawdown || "6.00%"
        };

        // Format trades (adjust field names based on your schema)
        const formatTrade = (trade, type) => ({
            stock: trade.stockName || trade.stock || "N/A",
            entryDate: trade.entryDate || trade.buyDate || trade.createdAt,
            entryPrice: trade.entryPrice || trade.buyPrice || 0,
            investment: trade.investment || trade.amount || 100000,
            closePrice: trade.currentPrice || trade.closePrice || 0,
            exitDate: trade.exitDate || trade.sellDate,
            exitPrice: trade.exitPrice || trade.sellPrice || 0,
            quantity: trade.quantity || trade.qty || 0,
            profitLossRupees: trade.profitLoss || trade.pnl || 0,
            profitLossPercentage: trade.profitLossPercentage || trade.pnlPercentage || 0,
            status: type === 'active' ? "Active" : "Closed"
        });

        const formattedActiveTrades = activeTrades.map(t => formatTrade(t, 'active'));
        const formattedClosedTrades = closedTrades.map(t => formatTrade(t, 'closed'));

        console.log(`Generating PDF: ${formattedActiveTrades.length} active, ${formattedClosedTrades.length} closed trades`);

        // Set headers
        const fileName = `GrowGreen_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`
        });

        // Generate and stream PDF
        await generateTradeReportPDF(
            formattedReportData,
            formattedActiveTrades,
            formattedClosedTrades,
            res
        );

    } catch(error) {
        console.error("Error generating report:", error);
        res.status(500).json({
            success: false,
            message: "Error generating PDF report",
            error: error.message
        });
    }
};