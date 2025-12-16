import PDFDocument from "pdfkit";
import fs from "fs";

// ===================== MAIN =====================
export const generateTradeReportPDF = (
  reportData,
  activeTrades = [],
  closedTrades = [],
  res = null
) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true
      });

      let buffers = [];

      if (!res) {
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
      } else {
        doc.pipe(res);
        doc.on("end", resolve);
      }

      doc.on("error", reject);

      drawHeader(doc, reportData);
      drawTopSummary(doc, reportData, activeTrades, closedTrades);
      drawActiveTrades(doc, activeTrades);
      drawClosedTrades(doc, closedTrades);
      drawFooter(doc);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// ===================== HEADER =====================
const drawHeader = (doc, reportData) => {
  doc.rect(0, 0, doc.page.width, 70).fill("#16A34A");

  doc
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(`GrowGreen PnL Update – ${reportData?.date || "08/12/2025"}`, 40, 25);

  doc.moveDown(2);
};

// ===================== TOP SUMMARY =====================
const drawTopSummary = (doc, reportData, activeTrades, closedTrades) => {
  const startY = 90;
  const boxW = 170;
  const boxH = 55;

  drawBox(doc, 40, startY, boxW, boxH, "#E5F0FF", [
    `Nifty Close: ${reportData?.niftyClose || "25960"}`,
    `Nifty Return: ${reportData?.niftyReturn || "6.17%"}`
  ]);

  drawBox(doc, 215, startY, boxW, boxH, "#FFF4E5", [
    `Investment: ₹5,00,000`,
    `Current Value: ₹${formatCurrency(reportData?.currentValue || 502940)}`
  ]);

  drawBox(doc, 390, startY, boxW, boxH, "#E7F8EE", [
    `GrowGreen Return`,
    `${reportData?.growgreenReturn || "5.88%"}`
  ]);

  const totalTrades = activeTrades.length + closedTrades.length;
  const win = closedTrades.filter(t => t.profitLossPercentage > 0).length;
  const loss = closedTrades.filter(t => t.profitLossPercentage < 0).length;

  drawBox(doc, 40, startY + 70, boxW, boxH, "#F3F4F6", [
    `Total Trades: ${totalTrades}`,
    `Success Rate: ${((win / (closedTrades.length || 1)) * 100).toFixed(0)}%`
  ]);

  drawBox(doc, 215, startY + 70, boxW, boxH, "#DCFCE7", [
    `Win Trades: ${win}`,
    `Max Win: ${calculateMaxWin(closedTrades)}%`
  ]);

  drawBox(doc, 390, startY + 70, boxW, boxH, "#FEE2E2", [
    `Loss Trades: ${loss}`,
    `Max Loss: ${calculateMaxLoss(closedTrades)}%`
  ]);

  doc.moveDown(6);
};

// ===================== ACTIVE TRADES =====================
const drawActiveTrades = (doc, trades) => {
  if (!trades.length) return;

  sectionTitle(doc, "Active Trades");

  drawTable(
    doc,
    ["Stock", "Entry Date", "Entry", "Close", "Qty", "P&L (₹)", "P&L %", "Status"],
    trades.map(t => [
      t.stock,
      formatDate(t.entryDate),
      t.entryPrice,
      t.closePrice,
      (t.quantity || 0).toFixed(2),
      t.profitLossRupees,
      t.profitLossPercentage,
      "HELD"
    ])
  );
};

// ===================== CLOSED TRADES =====================
const drawClosedTrades = (doc, trades) => {
  if (!trades.length) return;

  sectionTitle(doc, "Closed Trades");

  drawTable(
    doc,
    ["Stock", "Entry", "Exit", "Entry Px", "Exit Px", "Investment", "P&L (₹)", "P&L %"],
    trades.map(t => [
      t.stock,
      formatDate(t.entryDate),
      formatDate(t.exitDate),
      t.entryPrice,
      t.exitPrice,
      formatCurrency(t.investment),
      t.profitLossRupees,
      t.profitLossPercentage
    ])
  );
};

// ===================== TABLE =====================
// ===================== TABLE =====================
const drawTable = (doc, headers, rows) => {
  const startY = doc.y;
  const rowHeight = 22;
  const padding = 4;

  // Fixed column layout (A4 safe)
  const columns = [
    { width: 90, align: "left" },   // Stock
    { width: 80, align: "center" }, // Entry Date
    { width: 80, align: "center" }, // Exit / Entry Px
    { width: 70, align: "right" },  // Entry
    { width: 70, align: "right" },  // Close
    { width: 80, align: "right" },  // Qty / Investment
    { width: 70, align: "right" },  // P&L ₹
    { width: 60, align: "right" },  // P&L %
  ];

  const tableX = 40;

  /* ================= HEADER (WRAPPED) ================= */
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#4F46E5");

  let x = tableX;
  let headerHeights = [];

  headers.forEach((h, i) => {
    const hHeight = doc.heightOfString(h, {
      width: columns[i].width - padding * 2,
      align: columns[i].align
    });

    headerHeights.push(hHeight);

    doc.text(h, x + padding, startY + padding, {
      width: columns[i].width - padding * 2,
      align: columns[i].align
    });

    x += columns[i].width;
  });

  // Dynamic header height
  const headerRowHeight = Math.max(...headerHeights) + padding * 2;

  // Header underline
  doc
    .moveTo(tableX, startY + headerRowHeight)
    .lineTo(
      tableX + columns.reduce((s, c) => s + c.width, 0),
      startY + headerRowHeight
    )
    .stroke();

  /* ================= ROWS ================= */
  doc.font("Helvetica").fontSize(9);
  let y = startY + headerRowHeight + 4;

  rows.forEach(row => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }

    x = tableX;

    row.forEach((cell, colIndex) => {
      let color = "#111827";

      // P&L coloring
      if (colIndex >= row.length - 2 && typeof cell === "number") {
        color = cell > 0 ? "#166534" : cell < 0 ? "#991B1B" : "#111827";
      }

      doc
        .fillColor(color)
        .text(
          typeof cell === "number" ? formatNumber(cell) : cell,
          x + padding,
          y + padding,
          {
            width: columns[colIndex].width - padding * 2,
            align: columns[colIndex].align
          }
        );

      x += columns[colIndex].width;
    });

    // Row separator
    doc
      .moveTo(tableX, y + rowHeight)
      .lineTo(
        tableX + columns.reduce((s, c) => s + c.width, 0),
        y + rowHeight
      )
      .strokeColor("#E5E7EB")
      .stroke();

    y += rowHeight;
  });

  doc.y = y + 10;
};



// ===================== FOOTER =====================
const drawFooter = doc => {
  const pages = doc.bufferedPageRange().count;
  for (let i = 0; i < pages; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor("#6B7280")
      .text(
        "Disclaimer: This report is for educational purposes only. Market investments are subject to risk.",
        40,
        doc.page.height - 40
      );
  }
};

// ===================== UI HELPERS =====================
const drawBox = (doc, x, y, w, h, bg, lines) => {
  doc.rect(x, y, w, h).fill(bg);
  doc.fillColor("#111").fontSize(10);
  lines.forEach((l, i) => doc.text(l, x + 8, y + 8 + i * 16));
};

const sectionTitle = (doc, title) => {
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#4F46E5");
  doc.text(title, 30);
  doc.moveDown(0.5);
};

// ===================== FORMATTERS =====================
const formatDate = d =>
  d ? new Date(d).toLocaleDateString("en-IN") : "-";

const formatCurrency = n =>
  new Intl.NumberFormat("en-IN").format(Math.round(n || 0));

const formatNumber = n =>
  Number(n).toFixed(2);

const calculateMaxWin = trades =>
  Math.max(0, ...trades.map(t => t.profitLossPercentage || 0)).toFixed(2);

const calculateMaxLoss = trades =>
  Math.abs(Math.min(0, ...trades.map(t => t.profitLossPercentage || 0))).toFixed(2);
