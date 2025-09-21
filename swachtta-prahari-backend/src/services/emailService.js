const nodemailer = require("nodemailer");
const logger = require("../config/winston");
const path = require("path");
// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};
// Send incident alert email
const sendIncidentAlert = async (incident, recipients) => {
  try {
    const transporter = createTransporter();
    const subject = `🚨 ${incident.severity.toUpperCase()} Alert: ${incident.type.replace("_", "")} Detected`;
    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
<h1>Swachhta Prahari Alert</h1>
<p>Environmental Monitoring System</p>
</div>

<div style="padding: 20px; background-color: #f9fafb;">
<div style="background-color: ${getSeverityColor(incident.severity)}; color: white;
padding: 10px; border-radius: 5px; margin-bottom: 20px;">
<h2 style="margin: 0;">${incident.severity.toUpperCase()} SEVERITY
INCIDENT</h2>
</div>
<table style="width: 100%; border-collapse: collapse;">
<tr>
<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight:
bold;">Incident ID:</td>
<td style="padding: 8px; border-bottom: 1px solid
#e5e7eb;">${incident.incidentId}</td>
</tr>
<tr>
<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight:
bold;">Type:</td>
<td style="padding: 8px; border-bottom: 1px solid
#e5e7eb;">${incident.type.replace("_", " ").toUpperCase()}</td>
</tr>
<tr>
<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight:
bold;">Location:</td>
<td style="padding: 8px; border-bottom: 1px solid
#e5e7eb;">${incident.location.zone} - ${incident.location.specific}</td>
</tr>
<tr>
<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight:
bold;">Camera:</td>
<td style="padding: 8px; border-bottom: 1px solid
#e5e7eb;">${incident.camera.cameraId} (${incident.camera.name})</td>
</tr>
<tr>
<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight:
bold;">Detected At:</td>
<td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(
      incident.createdAt,
    ).toLocaleString()}</td>
</tr>
<tr>
<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight:
bold;">Confidence:</td>
<td style="padding: 8px; border-bottom: 1px solid
#e5e7eb;">${Math.round(incident.aiDetection.confidence * 100)}%</td>
</tr>
</table>
<div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left:
4px solid #f59e0b; border-radius: 5px;">
<p style="margin: 0; font-weight: bold;">Action Required:</p>
<p style="margin: 5px 0 0 0;">Please review this incident and take appropriate action
through the Swachhta Prahari dashboard.</p>
</div>
</div>
<div style="background-color: #374151; color: white; padding: 15px; text-align: center;
font-size: 12px;">
<p>This is an automated alert from the Swachhta Prahari Environmental Monitoring
System</p>
<p>UPSIDA - HDFC Parivartan Partnership | KratiTech Pvt Ltd</p>
</div>
</div>
`;
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: recipients.join(", "),
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
    logger.info(`Incident alert email sent for ${incident.incidentId} to ${recipients.length}
recipients`);
  } catch (error) {
    logger.error("Send incident alert error:", error);
    throw error;
  }
};
// Send daily report email
const sendReportEmail = async (report, recipients, attachmentPath) => {
  try {
    const transporter = createTransporter();
    const subject = `📊 Swachhta Prahari ${report.type.toUpperCase()} Report - ${new Date(
      report.period.startDate,
    ).toLocaleDateString()}`;
    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
<h1>Swachhta Prahari Report</h1>
<p>Environmental Monitoring System</p>
</div>
<div style="padding: 20px; background-color: #f9fafb;">
<h2>Report Summary</h2>
<p><strong>Period:</strong> ${new Date(report.period.startDate).toLocaleDateString()} to ${new Date(
      report.period.endDate,
    ).toLocaleDateString()}</p>
<p><strong>Report Type:</strong> ${report.type.toUpperCase()}</p>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
<div style="background-color: white; padding: 15px; border-radius: 8px; box-shadow:
0 1px 3px rgba(0,0,0,0.1);">
<h3 style="color: #ef4444; margin: 0 0 10px 0;">Total Incidents</h3>
<p style="font-size: 24px; font-weight: bold; margin:
0;">${report.summary.totalIncidents}</p>
</div>
<div style="background-color: white; padding: 15px; border-radius: 8px; box-shadow:
0 1px 3px rgba(0,0,0,0.1);">
<h3 style="color: #22c55e; margin: 0 0 10px 0;">Resolved</h3>
<p style="font-size: 24px; font-weight: bold; margin:
0;">${report.summary.resolvedIncidents}</p>
</div>
<div style="background-color: white; padding: 15px; border-radius: 8px; box-shadow:
0 1px 3px rgba(0,0,0,0.1);">
<h3 style="color: #f59e0b; margin: 0 0 10px 0;">Avg Response Time</h3>
<p style="font-size: 24px; font-weight: bold; margin:
0;">${report.summary.averageResponseTime} min</p>
</div>
<div style="background-color: white; padding: 15px; border-radius: 8px; box-shadow:
0 1px 3px rgba(0,0,0,0.1);">
<h3 style="color: #3b82f6; margin: 0 0 10px 0;">Cleanliness Index</h3>
<p style="font-size: 24px; font-weight: bold; margin:
0;">${Math.round(report.summary.cleanlinessIndex.overall)}%</p>
</div>
</div>
<p style="margin-top: 20px;">Please find the detailed report attached. For real-time
monitoring and incident management, please access the Swachhta Prahari dashboard.</p>
</div>

<div style="background-color: #374151; color: white; padding: 15px; text-align: center;
font-size: 12px;">
<p>Generated automatically by Swachhta Prahari System</p>
<p>UPSIDA - HDFC Parivartan Partnership | KratiTech Pvt Ltd</p>
</div>
</div>
`;
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: recipients.join(", "),
      subject,
      html,
      attachments: attachmentPath
        ? [
            {
              filename: path.basename(attachmentPath),
              path: attachmentPath,
            },
          ]
        : [],
    };
    await transporter.sendMail(mailOptions);
    logger.info(`Report email sent for ${report.reportId} to ${recipients.length} recipients`);
  } catch (error) {
    logger.error("Send report email error:", error);
    throw error;
  }
};
// Helper function for severity colors
const getSeverityColor = (severity) => {
  const colors = {
    low: "#22c55e",
    medium: "#f59e0b",
    high: "#ef4444",
    critical: "#7c2d12",
  };
  return colors[severity] || "#6b7280";
};
module.exports = {
  sendIncidentAlert,
  sendReportEmail,
};
