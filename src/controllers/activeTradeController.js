import ActiveTrade from "../models/activeTradeSchema.js";

export const setActiveTrade = async(req, res)=>{
    try{
        console.log("setActiveTrade API Call");
        const {stock, entryDate, entryPrice, investment, closePrice, quantity, profitLossRupees, profitLossPercentage, status} = req.body;
        if(!stock || !entryDate || !entryDate || !entryPrice || !investment || !closePrice || !quantity || !profitLossRupees || !profitLossPercentage || !status){
            return res.status(400).json({success:false, messsage: "stock , entryDate, entryPrice, investment, closePrice, quantity, profitLossRupees, profitLossPercentage, status are required" })
        }
        if(status.toUpperCase()!=='HELD'){
            return res.status(400).json({success:false,messsage:"status is incorrect"});
        }

        const saveTheActiveTrades = new ActiveTrade({
            stock,
            entryDate,
            entryPrice: parseFloat(entryPrice).toFixed(2),
            investment: parseFloat(investment).toFixed(2),
            closePrice: parseFloat(closePrice).toFixed(2),
            quantity,
            profitLossRupees: parseFloat(profitLossRupees).toFixed(2),
            profitLossPercentage: parseFloat(profitLossPercentage).toFixed(2),
            status
        });

        await saveTheActiveTrades.save();
        return res.status(201).json({success: true, data:saveTheActiveTrades,messsage: "Trade Data Store Successfully"});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({success:false,messsage: "internal server error"});
    }
};


export const deleteActiveTrade = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "id parameter is required"
            });
        }

        // Correct usage: pass filter object { _id: id }
        const deletedTrade = await ActiveTrade.findOneAndDelete(id);

        if (!deletedTrade) {
            return res.status(404).json({
                success: false,
                message: "Trade not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Trade ${id} deleted successfully`,
            deletedTrade
        });

    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateActiveTrade = async (req, res) => {
    try {
        const { id } = req.params;
        const { updatedTrade } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "id parameter missing"
            });
        }

        if (!updatedTrade) {
            return res.status(400).json({
                success: false,
                message: "updatedTrade object required"
            });
        }

        // Validate status field
        if (updatedTrade.status !== "HELD") {
            return res.status(400).json({
                success: false,
                message: "trade status should be HELD"
            });
        }

        const updatedTradeData = await ActiveTrade.findByIdAndUpdate(
            id,
            updatedTrade,
            { new: true }    // return updated record
        );

        if (!updatedTradeData) {
            return res.status(404).json({
                success: false,
                message: "Trade not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedTradeData,
            message: "Trade updated successfully"
        });

    } catch (error) {
        console.error("Update Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



