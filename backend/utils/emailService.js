const nodemailer = require('nodemailer');
const path = require('path');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send agreement email with PDF attachment
async function sendAgreementEmail(tenantEmail, tenantName, pdfPath, houseNumber) {
  try {
    const mailOptions = {
      from: `"511 HOMES" <${process.env.EMAIL_USER}>`,
      to: tenantEmail,
      subject: `Your Tenancy Agreement - House ${houseNumber} - 511 HOMES`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white;">🏠 511 HOMES</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd;">
            <h2>Dear ${tenantName},</h2>
            <p>Thank you for choosing 511 HOMES. Please find attached your Tenancy Agreement for <strong>House ${houseNumber}</strong>.</p>
            <p>This document contains all the terms and conditions of your tenancy. Please review it carefully and keep a copy for your records.</p>
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review the agreement</li>
              <li>Sign where indicated</li>
              <li>Return a signed copy to the landlord</li>
              <li>First rent payment is due on the 5th of the month</li>
            </ul>
            <p>If you have any questions, please contact us at <strong>0789 735 474</strong>.</p>
            <hr />
            <p style="color: #666; font-size: 12px;">This is an automated message from 511 HOMES Property Management System.</p>
            <p style="color: #666; font-size: 12px;">© 2025 511 HOMES | All Rights Reserved</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Tenancy_Agreement_House_${houseNumber}_${tenantName.replace(/\s/g, '_')}.pdf`,
          path: pdfPath
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendAgreementEmail };