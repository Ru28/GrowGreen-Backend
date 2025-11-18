import mongoose from "mongoose";

const ReportDataSchema= new mongoose.Schema({
    niftyClose : {type: Number, required: true,set: v => parseFloat(Number(v).toFixed(2))},
    niftyfrom : {type: Number, required: true,set: v=> parseFloat(Number(v).toFixed(2))},
    niftyReturn: {type: Number, required: true,set: v => parseFloat(Number(v).toFixed(2))},
    investment: {type: Number, required: true, set: v => parseFloat(Number(v).toFixed(2))},
    currentValue: {type: Number, required: true, set: v => parseFloat(Number(v).toFixed(2))},
    growGreenReturn: {type: Number, required: true, set: v => parseFloat(Number(v).toFixed(2))}
});

const ReportData= mongoose.model("ReportData",ReportDataSchema);

export default ReportData;