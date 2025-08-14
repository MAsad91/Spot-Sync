import { useEffect, useRef, useState } from "react";
import moment from "moment";
import { amountToShow } from "global/functions";
import { jsPDF } from "jspdf";
import { capitalizeFirstLetter } from "global/functions";
import { useLocation, useNavigate } from "react-router-dom";
import { getReceiptData } from "store/slice/public/publicSlice";
import { useDispatch } from "react-redux";
import { Backdrop } from "@mui/material";
import { isEmpty } from "lodash";

export default function Invoice(props) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pdfRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState({ licensePlates: [] });

  const receiptNumber = new URLSearchParams(location?.search).get("id");

  useEffect(() => {
    if (!receiptNumber) {
      navigate("/");
    } else {
      handleGetReceiptData();
    }
  }, [receiptNumber]);

  async function handleGetReceiptData() {
    try {
      setLoading(true);
      const res = await dispatch(getReceiptData(receiptNumber)).unwrap();
      if (res.success) {
        setReceiptData(res.receiptData);
        setTimeout(() => {
          handelDownloadReceipt(res.receiptData);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const licensePlatesRows = Array.isArray(receiptData.licensePlates)
    ? receiptData.licensePlates
        .map((plate) => {
          return `
        <tr>
          <td>${plate.licensePlateNumber}</td>
          <td>${plate.assignName || "-"}</td>
          <td>$${amountToShow(plate.price)}</td>
          <td>${plate.quantity || 1}</td>
          <td>$${amountToShow(plate.price)}</td>
        </tr>
      `;
        })
        .join("")
    : "";

  const handelDownloadReceipt = (data) => {
    const content = pdfRef.current;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.html(content, {
      callback: function (doc) {
        doc.save(`receipt-${data.serialNumber || "unknown"}.pdf`);
      },
      x: 10,
      y: 10,
      width: 190,
      windowWidth: content.scrollWidth,
    });
  };

  const brandLogo = (brandName, fallbackUrl) => {
    const fileName = brandName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "");

    const filePath = `/assets/brandLogo/${fileName}.jpeg`;

    // Check if the image exists in the public folder
    const image = new Image();
    image.src = filePath;
    image.onerror = () => {
      image.src = fallbackUrl;
    };
    return image.src;
  };

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        Loading ...
      </Backdrop>
      <div ref={pdfRef}>
        <div
          dangerouslySetInnerHTML={{
            __html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Document</title>
              <style>
                body {
                  margin-left: 50px;
                  margin-right: 50px;
                }
                h1, h4 {
                  padding-left: 5pt;
                  text-indent: 0pt;
                  text-align: left;
                }
                tr:nth-child(even) {
                  background-color: #f2f2f2;
                }
                th, td {
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
                @media only screen and (max-width: 768px) {
                  body {
                    margin-left: 10px;
                    margin-right: 10px;
                  }
                  .flex-container {
                    display: flex;
                    flex-direction: column;
                  }
                  .flex-item {
                    margin-bottom: 10px;
                  }
                  .lasttable table {
                    margin-left: 0;
                    width: 100%;
                  }
                  .lasttable table td {
                    text-align: left;
                  }
                }
              </style>
            </head>
            <body>
              <div style="padding: 20px">
                <div class="flex-container" style="display: flex; justify-content: space-between">
                  <div class="flex-item">
                    ${
                      receiptData.brandName && receiptData.brandLogo
                        ? `<img height="auto" width="150px" src="${brandLogo(
                            receiptData.brandName,
                            receiptData.brandLogo
                          )}" alt="${receiptData.brandName}" />`
                        : ""
                    }
                  </div>
                  <div class="flex-item">
                    <ul>
                      <li>${receiptData.brandName || ""}</li>
                      <li>${receiptData.brandAddress || ""}</li>
                      <li>${receiptData.brandMobile || ""}</li>
                    </ul>
                  </div>
                </div>
                <div style="margin-top: 10px; display: flex; justify-content: space-between">
                  <div>
                    <div style="margin-left: -3px; margin-bottom: 7px;">
                      <h1 style="display: inline; margin-right:5px; vertical-align: middle;">${capitalizeFirstLetter(
                        receiptData.type
                      )}</h1>
                      <h3 style="display: inline; vertical-align: middle; font-weight: lighter; color: black;">#${
                        receiptData.serialNumber
                      }</h3>
                    </div>
                    ${
                      receiptData.subscriptionNumber
                        ? `<li> Subscription No: ${receiptData.subscriptionNumber}</li>`
                        : receiptData.transientNumber
                        ? `<li> Transient No: ${receiptData.transientNumber}</li>`
                        : ""
                    }
                    ${
                      receiptData.type === "receipt"
                        ? `<li>Transaction ID: ${
                            receiptData.transactionId || "-"
                          }</li>${
                            receiptData.isValidationApplied
                              ? `<li>Validation Code: ${
                                  receiptData.validationCode || "-"
                                }</li>`
                              : ""
                          }`
                        : ""
                    }
                    <li>Payment terms: ${
                      receiptData.autoRenew ? "Auto Renew" : "Single Payment"
                    }</li>
                    <li>Start date: ${receiptData.startDate}</li>
                    <li>End date: ${receiptData.endDate}</li>
                    ${
                      receiptData.type === "receipt"
                        ? `<li>Payment date: ${
                            moment(receiptData.paymentDate).format(
                              "MM/DD/YYYY hh:mm A"
                            ) || "-"
                          }</li>`
                        : ""
                    }
                    <li>Parking Location: ${receiptData.placeAddress}</li>
                    ${
                      receiptData.subscriptionNumber
                        ? `<li>Description of Services Rendered: ${receiptData.subscriptionType} parking subscription for ${receiptData.startDate} to ${receiptData.endDate}</li>`
                        : ""
                    }
                  </div>
                  <div>
                    <p style="text-indent: 0pt; text-align: right; font-weight: bold">Bill to:</p>
                    <ul>
                      ${
                        receiptData.companyName
                          ? `<li>${receiptData.companyName}</li>`
                          : ""
                      }
                      ${
                        receiptData.parkerName
                          ? `<li>${receiptData.parkerName}</li>`
                          : ""
                      }
                      ${
                        receiptData.parkerEmail
                          ? `<li>${receiptData.parkerEmail}</li>`
                          : receiptData.parkerMobile
                          ? `<li>${receiptData.parkerMobile}</li>`
                          : ""
                      }
                    </ul>
                  </div>
                </div>
                <div style="margin-top: 30px">
                  <table style="border-collapse: collapse; border-spacing: 0; width: 100%; border: 1px solid #ddd;">
                    <tr>
                      <th>LICENSE PLATE</th>
                      <th>${
                        receiptData.subscriptionNumber ? "ASSIGNED NAME" : ""
                      }</th>
                      <th>PRICE</th>
                      <th>QTY</th>
                      <th>SUBTOTAL</th>
                    </tr>
                    ${licensePlatesRows}
                  </table>
                  <div class="lasttable">
                    <table style="border-collapse: collapse; margin-left: 62.5%" cellspacing="0">
                      <tbody>
                        <tr>
                          <td style="border: none; padding-top: 6pt; padding-right: 16pt; text-align: right;">Subtotal</td>
                          <td style="width: 62pt; border: none; padding-top: 6pt; padding-right: 2pt; text-align: right; font-weight: bold;">$${
                            receiptData.baseRate
                          }</td>
                        </tr>
                        <tr>
                          <td style="width: 103pt; padding-right: 16pt">Service Fee</td>
                          <td style="width: 62pt; font-weight: bold">$${
                            receiptData?.updatedServiceFee || 0
                          }</td>
                        </tr>
                        ${
                          receiptData.tax && receiptData.tax > 0
                            ? `
                        <tr>
                        <td style="width: 103pt; padding-right: 16pt">State Tax</td>
                        <td style="width: 62pt; font-weight: bold">$${receiptData.tax}</td>
                        `
                            : ""
                        }
                        ${
                          receiptData.cityTax && receiptData.cityTax > 0
                            ? `
                          <tr>
                          <td style="width: 103pt; padding-right: 16pt">City Tax</td>
                          <td style="width: 62pt; font-weight: bold">$${receiptData.cityTax}</td>
                          `
                            : ""
                        }
                        ${
                          receiptData.countyTax && receiptData.countyTax > 0
                            ? `
                            <tr>
                            <td style="width: 103pt; padding-right: 16pt">County Tax</td>
                            <td style="width: 62pt; font-weight: bold">$${receiptData.countyTax}</td>
                            `
                            : ""
                        }
                        ${
                          receiptData.isValidationApplied
                            ? `<tr><td style="width: 103pt; padding-right: 16pt">Discount (${receiptData.discountPercentage}%)</td><td style="width: 62pt; font-weight: bold">-$${receiptData.discount}</td></tr>`
                            : ""
                        }
                        <tr>
                          <td style="width: 103pt; font-weight: bold; padding-right: 16pt">${
                            receiptData.type === "receipt"
                              ? "Total"
                              : "Total due"
                          }</td>
                          <td style="width: 62pt; font-weight: bold">$${
                            receiptData.total
                          }</td>
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
    </>
  );
}
