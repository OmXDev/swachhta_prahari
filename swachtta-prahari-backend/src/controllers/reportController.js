const Report = require("../models/Report");
const Incident = require("../models/Incident");
const Camera = require("../models/Camera");
const logger = require("../config/winston");
const { generatePDFReport, generateExcelReport } = require("../services/reportService");
const { sendReportEmail } = require("../services/emailService");
const moment = require("moment");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const seedReport = require("../seedReport");

function getBase64Image(filePath) {
  const file = fs.readFileSync(filePath);
  const ext = path.extname(filePath).substring(1); // jpg / png
  return `data:image/${ext};base64,${file.toString("base64")}`;
}

const generateReport = async (req, res) => {
  try {
    const { type, format } = req.body;

    if (type !== "daily" || format !== "pdf") {
      return res.status(400).json({
        success: false,
        message: "Only daily PDF reports are supported for now.",
      });
    }

    // Paths to assets
    // Convert images to base64
    const logoBase64 = getBase64Image(path.join(__dirname, "../../public/uploads/images/logo.jpg"));

    const summaryBase64 = getBase64Image(
      path.join(__dirname, "../../public/uploads/images/dump1.jpg"),
    );

    // Main content HTML
    const htmlContent = `
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        margin: 40px;
        line-height: 1.6;
        color: #2C3E50;
      }

      h1, h2, h3 {
        color: #2C3E50;
        margin-bottom: 10px;
      }

      /* Header section with logo + reporting period */
      .header {
        margin-bottom: 40px;
      }
      .header-top {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 20px;
      }
      .header-top img {
        width: 120px; /* enlarged logo */
        margin-right: 15px;
      }
      .reporting-period {
        font-size: 12px;
        color: #555;
      }

      .header-details h1 {
        font-size: 26px;
        font-weight: bold;
        margin-bottom: 15px;
      }
      .header-details p {
        margin: 4px 0;
        font-size: 14px;
      }

      /* Section styling */
      .section {
        margin-top: 40px;
      }

      /* Table styling */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        font-size: 14px;
      }
      table, th, td {
        border: 1px solid #999;
      }
      th {
        background: #f3f3f3;
        text-transform: uppercase;
      }
      th, td {
        padding: 10px;
        text-align: left;
      }

      ul, ol {
        margin: 10px 0 10px 20px;
      }

      /* Footer styling */
      .footer {
        margin-top: 50px;
        font-style: italic;
        border-top: 1px solid #ddd;
        padding-top: 15px;
      }

      /* Summary image */
      .summary-image {
        display: block;
        margin: 20px auto;
        max-width: 80%;
      }
    </style>
  </head>
  <body>
    <!-- Header -->
    <div class="header">
      <div class="header-top">
        <img src="${logoBase64}" alt="UPSIDA Logo"/>
        <div class="reporting-period">
          Reporting Period: September 7, 2025, 00:00 to 23:59 HRS
        </div>
      </div>

      <div class="header-details">
        <h1>Daily Environmental & Cleanliness Incident Report: Camera 8</h1>
        <p><strong>Project:</strong> ${seedReport.project}</p>
        <p><strong>Date of Report:</strong> ${seedReport.dateOfReport}</p>
        <p><strong>Site:</strong> ${seedReport.site}</p>
        <p><strong>Prepared For:</strong> ${seedReport.preparedFor}</p>
        <p><strong>Prepared By:</strong> ${seedReport.preparedBy}</p>
      </div>
    </div>

    <!-- Executive Summary -->
    <div class="section">
      <img src="${summaryBase64}" alt="Summary Illustration" class="summary-image"/>
      <h2>1.0 Executive Summary</h2>
      <p>${seedReport.executiveSummary}</p>
    </div>

    <!-- Incident Logs -->
    <div class="section">
      <h2>2.0 Detailed Incident Logs</h2>
      <table>
        <thead>
          <tr>
            <th>Incident ID</th>
            <th>Timestamp</th>
            <th>Camera ID</th>
            <th>Event Type</th>
            <th>Details</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          ${seedReport.incidents
            .map(
              (inc) => `
            <tr>
              <td>${inc.id}</td>
              <td>${inc.timestamp}</td>
              <td>${inc.cameraId}</td>
              <td>${inc.eventType}</td>
              <td>${inc.details}</td>
              <td>${inc.severity}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Analytics -->
    <div class="section">
      <h2>3.0 Analytics Overview & Recommendations</h2>
      <p>${seedReport.analyticsLogs}</p>
      <h3>Daily Trends</h3>
      <ul>${seedReport.analytics.trends.map((t) => `<li>${t}</li>`).join("")}</ul>
      <h3>Incident Analysis</h3>
      <ul>${seedReport.analytics.analysis.map((a) => `<li>${a}</li>`).join("")}</ul>
      <h3>Recommended Next Steps</h3>
      <ol>${seedReport.analytics.recommendations.map((r) => `<li>${r}</li>`).join("")}</ol>
    </div>

    <!-- Conclusion -->
    <div class="section footer">
      <h2>4.0 Conclusion</h2>
      <p>${seedReport.conclusion}</p>
    </div>
  </body>
</html>
`;

    // Puppeteer PDF generation
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const filename = `Daily_Report_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, "..", "reports", filename);

    if (!fs.existsSync(path.join(__dirname, "..", "reports"))) {
      fs.mkdirSync(path.join(__dirname, "..", "reports"));
    }

    await page.pdf({
      path: filepath,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      footerTemplate: "<div></div>",
      margin: { top: "10px", bottom: "60px", left: "40px", right: "40px" },
    });

    await browser.close();

    // Save metadata
    const report = new Report({
      type: "daily",
      project: seedReport.project,
      site: seedReport.site,
      preparedFor: seedReport.preparedFor,
      preparedBy: seedReport.preparedBy,
      period: {
        startDate: new Date("2025-09-07T00:00:00Z"),
        endDate: new Date("2025-09-07T23:59:59Z"),
      },
      executiveSummary: seedReport.executiveSummary,
      incidents: seedReport.incidents.map((i) => ({
        incidentId: i.id,
        timestamp: i.timestamp,
        cameraId: i.cameraId,
        eventType: i.eventType,
        locationDetails: i.details,
        severity: i.severity,
      })),
      analytics: seedReport.analytics,
      conclusion: seedReport.conclusion,
      fileInfo: {
        filename,
        path: filepath,
        format: "pdf",
        size: fs.statSync(filepath).size,
      },
      generatedBy: req.user ? req.user._id : undefined,
    });

    await report.save();

    res.json({
      success: true,
      message: "Report generated",
      reportId: report.reportId,
    });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getReports = async (req, res) => {
  try {
    const { type, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const reports = await Report.find(filter)
      .populate("generatedBy", "name username")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reports, // <-- frontend expects this
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          count: reports.length,
          totalRecords: total,
          pageSize: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

// Download report
const downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report || !report.fileInfo.path) {
      return res.status(404).json({
        success: false,
        message: "Report file not found",
      });
    }
    const filePath = report.fileInfo.path;
    const fileName = report.fileInfo.filename;
    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error("Report download error:", err);
        res.status(500).json({
          success: false,
          message: "Failed to download report",
        });
      }
    });
  } catch (error) {
    logger.error("Download report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download report",
    });
  }
};
// Helper functions
const calculateAverageResponseTime = (incidents) => {
  const resolvedIncidents = incidents.filter(
    (i) => i.status === "resolved" && i.response.resolvedAt,
  );
  if (resolvedIncidents.length === 0) return 0;
  const totalTime = resolvedIncidents.reduce((sum, incident) => {
    const responseTime =
      (new Date(incident.response.resolvedAt) - new Date(incident.createdAt)) / (1000 * 60);
    return sum + responseTime;
  }, 0);
  return Math.round(totalTime / resolvedIncidents.length);
};
const calculateCleanlinessIndex = async (startDate, endDate) => {
  const zoneIncidents = await Incident.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$location.zone",
        count: { $sum: 1 },
        avgSeverity: {
          $avg: {
            $switch: {
              branches: [
                { case: { $eq: ["$severity", "low"] }, then: 1 },
                { case: { $eq: ["$severity", "medium"] }, then: 2 },
                { case: { $eq: ["$severity", "high"] }, then: 3 },
                { case: { $eq: ["$severity", "critical"] }, then: 4 },
              ],
              default: 1,
            },
          },
        },
      },
    },
  ]);
  const zoneIndexes = {};
  ["A", "B", "C", "D"].forEach((zone) => {
    const zoneData = zoneIncidents.find((z) => z._id === zone);
    if (zoneData) {
      const impact = (zoneData.count * zoneData.avgSeverity) / 10;
      zoneIndexes[zone] = Math.max(60, Math.round(100 - impact));
    } else {
      zoneIndexes[zone] = 95;
    }
  });
  const overall = Object.values(zoneIndexes).reduce((a, b) => a + b, 0) / 4;
  return {
    overall: Math.round(overall),
    byZone: zoneIndexes,
  };
};
module.exports = {
  generateReport,
  getReports,
  downloadReport,
};
