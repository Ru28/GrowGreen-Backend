import ActiveTrade from "../models/activeTradeSchema.js";
import CloseTrade from "../models/closeTradeSchema.js";


export const setCloseTrade = async (req, res) => {
  try {
    console.log("setCloseTrade API Call");

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id parameter missing",
      });
    }

    const {
      stock,
      entryDate,
      entryPrice,
      investment,
      exitPrice,
      exitDate,
      quantity,
      profitLossRupees,
      profitLossPercentage,
      status,
    } = req.body;

    // Validate required fields safely
    const requiredFields = {
      stock,
      entryDate,
      entryPrice,
      investment,
      exitPrice,
      exitDate,
      quantity,
      profitLossRupees,
      profitLossPercentage,
      status,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({
          success: false,
          message: `${key} is required`,
        });
      }
    }

    // Validate status
    if (status.toUpperCase() !== "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "status must be CLOSED",
      });
    }

    // Delete active trade (must await!)
    const deletedActiveTrade = await ActiveTrade.findByIdAndDelete(id);

    if (!deletedActiveTrade) {
      return res.status(404).json({
        success: false,
        message: "Active trade record not found",
      });
    }

    // Save in CloseTrade collection
    const closedTrade = new CloseTrade({
      stock,
      entryDate,
      entryPrice: Number(entryPrice).toFixed(2),
      investment: Number(investment).toFixed(2),
      exitDate,
      exitPrice: Number(exitPrice).toFixed(2),
      quantity: Number(quantity),
      profitLossRupees: Number(profitLossRupees).toFixed(2),
      profitLossPercentage: Number(profitLossPercentage).toFixed(2),
      status,
    });

    await closedTrade.save();

    return res.status(201).json({
      success: true,
      data: closedTrade,
      message: "Trade moved to closed trades successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};


export const updateCloseTrade = async (req, res) => {
    try{
        const {id} = req.params;
        const {updatedTrade} = req.body;
        if(!id){
            return res.status(400).json({success:false,message:"id params required"});
        }

        if(!updatedTrade){
            return res.status(400).json({success:false,message: "updatedTrade required"});
        }

        // Validate status field
        if (updatedTrade.status !== "CLOSED") {
            return res.status(400).json({
                success: false,
                message: "trade status should be CLOSED"
            });
        }

        const updatedTradeData = await CloseTrade.findByIdAndUpdate(id,updatedTrade,
            {new: true}
        );

        if(!updatedTradeData){
            return res.status(404).json({success:false, message: "closeTrade record not updated"});
        }        

        return res.status(200).json({success: false, data: updatedTradeData, message:"Trade updated successfully"})

    }
    catch(error){
        console.error("Update Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const deleteCloseTrade = async (req, res) =>{
     try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "id parameter is required"
            });
        }

        // Correct usage: pass filter object { _id: id }
        const deletedTrade = await CloseTrade.findOneAndDelete(id);

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
}