import React, { useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useLocation } from "react-router-dom"; // Remove if not using react-router for data passing
import { amountToShow } from "global/functions";
import { dateToShow } from "global/functions";

const InvoiceISBParking = () => {
  const pdfRef = useRef(null);
  const { state } = useLocation(); // Remove if not using react-router for data passing
  const data = state?.data || {}; // Replace with your data source if not using react-router
  useEffect(() => {
    handleDownload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log("data ====>", data);
  const handleDownload = () => {
    const content = pdfRef.current;
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    doc.html(content, {
      callback: function (doc) {
        doc.save(`receipt-${data.receiptNumber || "unknown"}.pdf`);
      },
      x: 10,
      y: 10,
      width: 190, // Adjust width to fit within A4 page size
      windowWidth: content.scrollWidth, // Ensure the rendered content width matches the actual content width
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
    <div
      ref={pdfRef}
      // style={{ visibility: "hidden", height: 0, overflow: "hidden" }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
          </head>
          <style>
        body {
        margin-left: 50px;
        margin-right: 50px;
      }
  
      h1,
      h4 {
        padding-left: 5pt;
        text-indent: 0pt;
        text-align: left;
      }
  
      tr:nth-child(even) {
        background-color: #f2f2f2;
      }
  
      th,
      td {
        text-align: left;
      }
  
      th {
        padding: 16px;
      }
  
      td {
        padding: 8px;
      }
  
      td {
        border-top-style: solid;
        border-top-width: 1pt;
        border-top-color: #f5f5f5;
        border-left-style: solid;
        border-left-width: 1pt;
        border-left-color: #f5f5f5;
        border-right-style: solid;
        border-right-width: 1pt;
        border-right-color: #f5f5f5;
      }
  
      ul li {
        text-align: right;
        list-style: none;
        line-height: 30px;
        font-weight: bold;
      }
  
      li {
        list-style: none;
        text-align: left;
      }
  
      .lasttable table td {
        width: 103pt;
        border: none;
        padding-top: 6pt;
        padding-right: 2pt;
        text-indent: 0pt;
        text-align: right;
      }
  
      .lasttable table tr {
        background: none;
      }
    </style>
    <body>
    <div style="padding: 20px">
      <div style="display: flex; justify-content: space-between">
        <div>
          <img
            height="100"
            width="220"
            src="${data.brandLogo}"
            alt="${data.brandName}"
          />
        </div>
        <div>
          <ul>
            <li>${data.brandName}</li>
            <li>${data.brandAddress}</li>
            <li>${data.brandMobile}</li>
          </ul>
        </div>
      </div>
      <div
        style="margin-top: 10px; display: flex; justify-content: space-between"
      >
        <div>
          <h1>Receipt</h1>
          <li>Receipt No.: ${data.receiptNumber}</li>
          <li>Payment terms: ${
            data.autoRenew ? "Auto Renew" : "Single Payment"
          }</li>
          <li>Start date: ${dateToShow(data.startDate)}</li>
          <li>End date: ${dateToShow(data.endDate)}</li>
          <li>Due date: ${dateToShow(data.nextRenewalDate)}</li>
          <li>Parking Location: ${data.placeAddress}</li>
        </div>
        <div>
          <p style="text-indent: 0pt; text-align: right; font-weight: bold">
            BILL TO:
          </p>
          <ul>
          ${data.companyName ? `<li>${data.companyName}</li>` : ""}
          <li>${data.parkerName}</li>
          <li>${data.parkerEmail}</li>
        </ul>
        </div>
      </div>
      <div style="margin-top: 30px">
        <table
          style="
            border-collapse: collapse;
            border-spacing: 0;
            width: 100%;
            border: 1px solid #ddd;
          "
        >
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
        <div class="lasttable">
          <table
            style="border-collapse: collapse; margin-left: 62.5%"
            cellspacing="0"
          >
            <tbody>
              <tr>
                <td
                  style="
                    border: none;
                    padding-top: 6pt;
                    padding-right: 16pt;
                    text-align: right;
                  "
                >
                  Subtotal
                </td>
                <td
                  style="
                    width: 62pt;
                    border: none;
                    padding-top: 6pt;
                    padding-right: 2pt;
                    text-align: right;
                    font-weight: bold;
                  "
                >
                $${amountToShow(data.baseRate)}
                </td>
              </tr>
              <tr>
                <td
                  style="width: 103pt; padding-right: 16pt; text-align: right"
                >
                  Discount
                </td>
                <td style="width: 62pt; font-weight: bold">$${
                  data.discount
                }</td>
              </tr>
              <tr>
                <td style="width: 103pt; padding-right: 16pt">Service Fee</td>
                <td style="width: 62pt; font-weight: bold">$${
                  amountToShow(data.serviceFee)
                }</td>
              </tr>
              <tr>
                <td style="width: 103pt; padding-right: 16pt">Tax</td>
                <td style="width: 62pt; font-weight: bold">$${amountToShow(data.tax)}</td>
              </tr>
              <tr>
                <td
                  style="width: 103pt; font-weight: bold; padding-right: 16pt"
                >
                  Total
                </td>
                <td style="width: 62pt; font-weight: bold">$${amountToShow(data.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </body>
  </html>
      `,
        }}
      ></div>
    </div>
  );
};

export default InvoiceISBParking;
