import React, { useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useLocation } from "react-router-dom";
import { amountToShow } from "global/functions";
import { dateToShow } from "global/functions";

const InvoiceSpotSync = () => {
  const pdfRef = useRef(null);
  const { state } = useLocation();
  const data = state?.data || {};
  
  useEffect(() => {
    handleDownload();
  }, []);
  
  const handleDownload = () => {
    const content = pdfRef.current;
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    doc.html(content, {
      callback: function (doc) {
        doc.save(`spotsync-receipt-${data.receiptNumber || "unknown"}.pdf`);
      },
      x: 10,
      y: 10,
      width: 190,
      windowWidth: content.scrollWidth,
    });
  };

  const licensePlatesRows = data.licensePlates
    ?.map(
      (plate) =>
        `<tr>
      <td>${plate.licensePlateNumber}</td>
      <td>${plate.assignedName || "-"}</td>
      <td>$${amountToShow(plate.price)}</td>
      <td>${plate.qty || 1}</td>
      <td>$${amountToShow(plate.price)}</td>
    </tr>`
    )
    .join("");

  return (
    <div ref={pdfRef}>
      <div
        dangerouslySetInnerHTML={{
          __html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>SpotSync Receipt</title>
            <style>
              body {
                margin-left: 50px;
                margin-right: 50px;
                font-family: 'Segoe UI', Arial, sans-serif;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 10px;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: bold;
                color: white;
              }
              th {
                padding: 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-weight: bold;
              }
              td {
                padding: 8px;
                border: 1px solid #f5f5f5;
              }
              .total-section {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">🅿️ SpotSync</div>
              <h1>Parking Receipt</h1>
              <p>Smart Parking Management System</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h4>Receipt Information</h4>
              <ul>
                <li><strong>Receipt Number:</strong> ${data.receiptNumber || "N/A"}</li>
                <li><strong>Date:</strong> ${dateToShow(data.paymentData) || "N/A"}</li>
                <li><strong>Customer:</strong> ${data.parkerName || "N/A"}</li>
                <li><strong>Email:</strong> ${data.parkerEmail || "N/A"}</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px">
              <table style="border-collapse: collapse; border-spacing: 0; width: 100%; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <tr>
                  <th>LICENSE PLATE</th>
                  <th>ASSIGNED NAME</th>
                  <th>PRICE</th>
                  <th>QTY</th>
                  <th>SUBTOTAL</th>
                </tr>
                ${licensePlatesRows}
                <tr>
                  <td colspan="4"></td>
                  <td style="font-weight: bold">$${amountToShow(data.baseRate)}</td>
                </tr>
              </table>
              
              <div style="margin-top: 20px;">
                <table style="border-collapse: collapse; margin-left: 62.5%;" cellspacing="0">
                  <tbody>
                    <tr>
                      <td style="border: none; padding-top: 6pt; padding-right: 16pt; text-align: right;">Subtotal</td>
                      <td style="width: 62pt; border: none; padding-top: 6pt; padding-right: 2pt; text-align: right; font-weight: bold;">$${amountToShow(data.baseRate)}</td>
                    </tr>
                    <tr>
                      <td style="width: 103pt; padding-right: 16pt; text-align: right;">Discount</td>
                      <td style="width: 62pt; font-weight: bold">$${data.discount}</td>
                    </tr>
                    <tr>
                      <td style="width: 103pt; padding-right: 16pt">Service Fee</td>
                      <td style="width: 62pt; font-weight: bold">$${amountToShow(data.serviceFee)}</td>
                    </tr>
                    <tr>
                      <td style="width: 103pt; padding-right: 16pt">Tax</td>
                      <td style="width: 62pt; font-weight: bold">$${amountToShow(data.tax)}</td>
                    </tr>
                    <tr class="total-section">
                      <td style="width: 103pt; font-weight: bold; padding-right: 16pt;">Total</td>
                      <td style="width: 62pt; font-weight: bold">$${amountToShow(data.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
              <p>Thank you for using SpotSync!</p>
              <p>Powered by Smart Parking Management Technology</p>
            </div>
          </body>
        </html>
      `,
        }}
      ></div>
    </div>
  );
};

export default InvoiceSpotSync; 