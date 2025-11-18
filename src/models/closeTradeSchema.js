import mongoose from "mongoose";

const closeTradeSchema = new mongoose.Schema({
    stock: {type: String,required:true},
    entryDate: {type: Date, default: Date.now},
    entryPrice: {type: Number, required: true, set: v => parseFloat(Number(v).toFixed(2)) },
    investment: {type: Number, required: true, set: v => parseFloat(Number(v).toFixed(2)) },
    exitPrice: {type: Number, required: true, set: v => parseFloat(Number(v).toFixed(2)) },
    exitDate: {type: Date, required: true },
    quantity: { 
        type: Number, 
        required: true, 
        validate: {
            validator: Number.isInteger,
            message: `{VALUE} is not an integer value`
        }
    },
    profitLossRupees: {type: Number, required: true, set: v => parseFloat(Number(v).toFixed(2))},
    profitLossPercentage:  {type: Number, required: true, set: v => parseFloat(Number(v).toFixed(2))},
    status: {type: String, required: true}
});

const CloseTrade = mongoose.model("CloseTrade",closeTradeSchema);

export default CloseTrade;