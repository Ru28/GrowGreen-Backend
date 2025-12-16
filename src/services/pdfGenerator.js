import PDFDocument from "pdfkit";
import fs from "fs";

// ===================== MAIN =====================
export const generateTradeReportPDF = (
  reportData,
  activeTrades = [],
  closedTrades = [],
  res = null // Optional response for streaming
) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true
      });

      let buffers = [];
      
      // For buffer mode
      if (!res) {
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
      } else {
        // For streaming mode
        doc.pipe(res);
        doc.on('end', () => resolve());
      }
      
      doc.on('error', reject);

      // ===================== SIMPLE HEADER =====================
      addSimpleHeader(doc, reportData);
      
      // ===================== METRICS DASHBOARD =====================
      addMetricsDashboard(doc, reportData, activeTrades, closedTrades);
      
      // ===================== ACTIVE TRADES SECTION =====================
      if (activeTrades && activeTrades.length > 0) {
        addSectionHeader(doc, "📈 Active Trades", "#7C3AED", true);
        addActiveTradesTable(doc, activeTrades);
      }
      
      // ===================== CLOSED TRADES SECTION =====================
      if (closedTrades && closedTrades.length > 0) {
        addSectionHeader(doc, "✅ Closed Trades", "#10B981", true);
        addClosedTradesTable(doc, closedTrades);
      }
      
      // ===================== SUMMARY SECTION =====================
      addSummarySection(doc, closedTrades);
      
      // ===================== FOOTER =====================
      addSimpleFooter(doc);

      doc.end();

    } catch (err) {
      console.error("PDF Generation Error:", err);
      reject(err);
    }
  });
};

// ===================== SIMPLE HEADER =====================
const addSimpleHeader = (doc, reportData) => {
  // Background with solid color
  doc.save();
  doc.rect(0, 0, doc.page.width, 150)
     .fill("#16A34A");
  doc.restore();

  // Company Logo/Name
  doc.font("Helvetica-Bold")
     .fontSize(32)
     .fillColor("white")
     .text("GROWGREEN", 50, 50);

  // Report Title
  doc.font("Helvetica")
     .fontSize(18)
     .fillColor("white")
     .opacity(0.9)
     .text("Portfolio Performance Report", 50, 90);

  // Report Date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  
  doc.font("Helvetica")
     .fontSize(11)
     .fillColor("white")
     .opacity(0.8)
     .text(`Generated on: ${formattedDate}`, 50, 115);

  // Since Date
  doc.font("Helvetica")
     .fontSize(11)
     .fillColor("white")
     .opacity(0.8)
     .text("Since 01 Sep 2025", doc.page.width - 150, 115);
     
  // Divider line
  doc.moveTo(50, 140)
     .lineTo(doc.page.width - 50, 140)
     .strokeColor("white")
     .opacity(0.3)
     .stroke();

  doc.moveDown(4);
};

// ===================== METRICS DASHBOARD =====================
const addMetricsDashboard = (doc, reportData, activeTrades, closedTrades) => {
  // Calculate metrics
  const totalTrades = activeTrades.length + closedTrades.length;
  const winTrades = closedTrades.filter(t => (t.profitLossPercentage || 0) > 0).length;
  const lossTrades = closedTrades.filter(t => (t.profitLossPercentage || 0) < 0).length;
  const successRate = closedTrades.length > 0 ? ((winTrades / closedTrades.length) * 100).toFixed(1) : "0.0";
  
  // Dashboard container
  const startY = doc.y;
  const boxWidth = (doc.page.width - 100) / 3;
  
  // Row 1: Key Metrics
  addMetricCard(doc, 50, startY, boxWidth - 10, "📊 Nifty Performance", [
    `Current: ${reportData?.niftyClose || "26,100"}`,
    `Return: ${reportData?.niftyReturn || "6.17%"}`
  ], "#DBEAFE", "#1E40AF");

  addMetricCard(doc, 50 + boxWidth, startY, boxWidth - 10, "💰 Portfolio Value", [
    `Investment: ₹5,00,000`,
    `Current: ₹${formatCurrency(reportData?.currentValue || 502940)}`,
    `Return: ${reportData?.growgreenReturn || "5.88%"}`
  ], "#DCFCE7", "#166534");

  addMetricCard(doc, 50 + (boxWidth * 2), startY, boxWidth - 10, "📈 Trade Statistics", [
    `Total: ${totalTrades}`,
    `Active: ${activeTrades.length}`,
    `Closed: ${closedTrades.length}`
  ], "#FEF3C7", "#92400E");

  // Row 2: Performance Metrics
  addMetricCard(doc, 50, startY + 90, boxWidth - 10, "🎯 Success Rate", [
    `${successRate}%`,
    `Wins: ${winTrades}`,
    `Losses: ${lossTrades}`
  ], "#FCE7F3", "#831843");

  addMetricCard(doc, 50 + boxWidth, startY + 90, boxWidth - 10, "📊 P&L Summary", [
    `Avg Win: ${calculateAvgWin(closedTrades)}%`,
    `Avg Loss: ${calculateAvgLoss(closedTrades)}%`,
    `Win/Loss: ${calculateWinLossRatio(closedTrades)}`
  ], "#E0E7FF", "#3730A3");

  addMetricCard(doc, 50 + (boxWidth * 2), startY + 90, boxWidth - 10, "⚠️ Risk Metrics", [
    `Max Win: ${calculateMaxWin(closedTrades)}%`,
    `Max Loss: ${calculateMaxLoss(closedTrades)}%`,
    `Max DD: ${reportData?.maxDrawdown || "6.00%"}`
  ], "#FFEDD5", "#9A3412");

  doc.y = startY + 200;
};

const addMetricCard = (doc, x, y, width, title, items, bgColor, textColor) => {
  doc.save();
  // Card background with rounded corners
  doc.roundedRect(x, y, width, 80, 8)
     .fill(bgColor)
     .strokeColor("#E5E7EB")
     .stroke();
  doc.restore();

  // Title
  doc.font("Helvetica-Bold")
     .fontSize(10)
     .fillColor(textColor)
     .text(title, x + 10, y + 10, { width: width - 20 });

  // Items
  doc.font("Helvetica")
     .fontSize(9)
     .fillColor("#374151");
  
  let itemY = y + 30;
  items.forEach(item => {
    doc.text(item, x + 10, itemY, { width: width - 20 });
    itemY += 14;
  });
};

// ===================== TABLE FUNCTIONS =====================
const addActiveTradesTable = (doc, trades) => {
  const headers = ["Stock", "Entry Date", "Entry", "Current", "Investment", "P&L (₹)", "P&L (%)", "Status"];
  const widths = [80, 75, 60, 60, 80, 75, 70, 60];
  
  drawTableHeader(doc, headers, widths);
  
  trades.forEach((trade, index) => {
    const pnlPercent = parseFloat(trade.profitLossPercentage || 0);
    const pnlRupees = parseFloat(trade.profitLossRupees || 0);
    
    const row = [
      trade.stock || "N/A",
      formatDateProperly(trade.entryDate),
      formatNumber(trade.entryPrice),
      formatNumber(trade.closePrice || trade.currentPrice),
      `₹${formatCurrency(trade.investment)}`,
      formatPnlRupees(pnlRupees),
      formatPnlPercent(pnlPercent),
      trade.status || "Active"
    ];
    
    drawTableRow(doc, row, widths, index, pnlPercent);
  });
  
  doc.moveDown(1.5);
};

const addClosedTradesTable = (doc, trades) => {
  const headers = ["Stock", "Entry Date", "Exit Date", "Entry", "Exit", "Investment", "P&L (₹)", "P&L (%)"];
  const widths = [80, 70, 70, 60, 60, 80, 80, 70];
  
  drawTableHeader(doc, headers, widths);
  
  trades.forEach((trade, index) => {
    const pnlPercent = parseFloat(trade.profitLossPercentage || 0);
    const pnlRupees = parseFloat(trade.profitLossRupees || 0);
    
    const row = [
      trade.stock || "N/A",
      formatDateProperly(trade.entryDate),
      formatDateProperly(trade.exitDate),
      formatNumber(trade.entryPrice),
      formatNumber(trade.exitPrice),
      `₹${formatCurrency(trade.investment)}`,
      formatPnlRupees(pnlRupees),
      formatPnlPercent(pnlPercent)
    ];
    
    drawTableRow(doc, row, widths, index, pnlPercent);
  });
  
  doc.moveDown(1.5);
};

const drawTableHeader = (doc, headers, widths) => {
  const startX = 50;
  let x = startX;
  
  // Header background
  doc.save();
  doc.rect(startX, doc.y, doc.page.width - 100, 25)
     .fill("#1E40AF");
  doc.restore();
  
  headers.forEach((header, i) => {
    doc.font("Helvetica-Bold")
       .fontSize(9)
       .fillColor("white")
       .text(header, x + 5, doc.y + 8, { width: widths[i] - 10 });
    x += widths[i];
  });
  
  doc.y += 28;
};

const drawTableRow = (doc, row, widths, index, pnlPercent) => {
  const startX = 50;
  let x = startX;
  
  // Check page break
  if (doc.y > doc.page.height - 100) {
    doc.addPage();
    doc.y = 50;
  }
  
  // Row background
  doc.save();
  doc.rect(startX, doc.y, doc.page.width - 100, 20)
     .fill(index % 2 === 0 ? "#F9FAFB" : "#FFFFFF");
  doc.restore();
  
  // Bottom border
  doc.moveTo(startX, doc.y + 20)
     .lineTo(doc.page.width - 50, doc.y + 20)
     .strokeColor("#E5E7EB")
     .stroke();
  
  row.forEach((cell, i) => {
    // Color P&L columns
    if (i >= 5) { // P&L columns (starting from column 6)
      doc.fillColor(pnlPercent > 0 ? "#065F46" : pnlPercent < 0 ? "#991B1B" : "#374151");
    } else {
      doc.fillColor("#111827");
    }
    
    doc.font("Helvetica")
       .fontSize(9)
       .text(cell, x + 5, doc.y + 5, { 
         width: widths[i] - 10,
         align: i >= 3 ? "right" : "left" // Align numeric columns right
       });
    
    x += widths[i];
  });
  
  doc.y += 22;
};

// ===================== SUMMARY SECTION =====================
const addSummarySection = (doc, closedTrades) => {
  if (closedTrades.length === 0) return;
  
  addSectionHeader(doc, "📋 Performance Summary", "#8B5CF6", false);
  
  const totalPnl = closedTrades.reduce((sum, t) => sum + (parseFloat(t.profitLossRupees) || 0), 0);
  const totalInvestment = closedTrades.reduce((sum, t) => sum + (parseFloat(t.investment) || 0), 0);
  const avgReturn = totalInvestment > 0 ? ((totalPnl / totalInvestment) * 100).toFixed(2) : "0.00";
  
  const summaryY = doc.y;
  
  doc.font("Helvetica-Bold")
     .fontSize(10)
     .fillColor("#374151")
     .text("Total Closed Trades:", 50, summaryY)
     .text("Total Investment:", 200, summaryY)
     .text("Total P&L:", 350, summaryY)
     .text("Average Return:", 500, summaryY);
  
  doc.font("Helvetica")
     .fontSize(10)
     .fillColor("#1F2937")
     .text(`${closedTrades.length}`, 50, summaryY + 15)
     .text(`₹${formatCurrency(totalInvestment)}`, 200, summaryY + 15)
     .text(formatPnlRupees(totalPnl), 350, summaryY + 15)
     .text(formatPnlPercent(parseFloat(avgReturn)), 500, summaryY + 15);
  
  doc.y = summaryY + 40;
};

// ===================== SIMPLE FOOTER =====================
const addSimpleFooter = (doc) => {
  const pageCount = doc.bufferedPageRange().count || 1;
  
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    // Footer text
    doc.font("Helvetica")
       .fontSize(8)
       .fillColor("#6B7280")
       .text("• Active trades show unrealized P&L based on last closing price", 50, doc.page.height - 50);
    
    // Disclaimer
    doc.font("Helvetica")
       .fontSize(8)
       .fillColor("#6B7280")
       .text("Disclaimer: This report is for educational purposes only. Market investments are subject to risks.", 
             50, doc.page.height - 35, { width: 400 });
    
    // Page number
    doc.font("Helvetica")
       .fontSize(8)
       .fillColor("#6B7280")
       .text(`Page ${i + 1} of ${pageCount}`, doc.page.width - 100, doc.page.height - 30, 
             { align: "right" });
  }
  
  doc.switchToPage(0);
};

// ===================== HELPER FUNCTIONS =====================
const addSectionHeader = (doc, text, color, addDivider) => {
  if (addDivider) {
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .strokeColor("#E5E7EB")
       .stroke();
    doc.moveDown(1);
  }
  
  doc.font("Helvetica-Bold")
     .fontSize(14)
     .fillColor(color)
     .text(text, 50, doc.y);
  
  doc.moveDown(0.5);
};

const formatDateProperly = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  } catch {
    return "Invalid Date";
  }
};

const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat("en-IN").format(Math.round(num));
};

const formatNumber = (num) => {
  const n = parseFloat(num) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatPnlRupees = (amount) => {
  const num = parseFloat(amount) || 0;
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.abs(num));
  
  return `${num >= 0 ? "+" : "-"}₹${formatted}`;
};

const formatPnlPercent = (percent) => {
  const num = parseFloat(percent) || 0;
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
};

const calculateAvgWin = (trades) => {
  const winningTrades = trades.filter(t => (t.profitLossPercentage || 0) > 0);
  if (winningTrades.length === 0) return "0.00";
  const avg = winningTrades.reduce((sum, t) => sum + (parseFloat(t.profitLossPercentage) || 0), 0) / winningTrades.length;
  return avg.toFixed(2);
};

const calculateAvgLoss = (trades) => {
  const losingTrades = trades.filter(t => (t.profitLossPercentage || 0) < 0);
  if (losingTrades.length === 0) return "0.00";
  const avg = losingTrades.reduce((sum, t) => sum + (parseFloat(t.profitLossPercentage) || 0), 0) / losingTrades.length;
  return Math.abs(avg).toFixed(2);
};

const calculateWinLossRatio = (trades) => {
  const winningTrades = trades.filter(t => (t.profitLossPercentage || 0) > 0);
  const losingTrades = trades.filter(t => (t.profitLossPercentage || 0) < 0);
  return losingTrades.length > 0 ? (winningTrades.length / losingTrades.length).toFixed(2) : "∞";
};

const calculateMaxWin = (trades) => {
  if (trades.length === 0) return "0.00";
  const max = Math.max(...trades.map(t => parseFloat(t.profitLossPercentage) || 0));
  return max.toFixed(2);
};

const calculateMaxLoss = (trades) => {
  if (trades.length === 0) return "0.00";
  const min = Math.min(...trades.map(t => parseFloat(t.profitLossPercentage) || 0));
  return Math.abs(min).toFixed(2);
};