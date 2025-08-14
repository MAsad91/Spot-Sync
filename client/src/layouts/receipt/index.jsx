import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getReceiptData } from "store/slice/public/publicSlice";
import { useDispatch } from "react-redux";
import { Backdrop } from "@mui/material";
import htmlToPdf from "html-to-pdf-js";
import { ceil, get } from "lodash";
import { useMediaQuery } from "@mui/material";

export default function Invoice(props) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pdfRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState({ licensePlates: [] });

  const receiptNumber = new URLSearchParams(location?.search).get("id");
  const isMobile = useMediaQuery("(max-width:600px)");
  const isSmallMobile = useMediaQuery("(max-height:700px");
  const isMediumMobile = useMediaQuery("(min-height:701px) and (max-height:820px");
  const isLargeMobile = useMediaQuery("(min-height:821px)");

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
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handelDownloadReceipt = (data) => {
    const content = pdfRef.current;
    content.style.transform = "scale(1.3)";
    if (isMobile) {
      if (isSmallMobile) {
        content.style.margin = "0px"
        content.style.height = "120vh"
      } else if (isMediumMobile || isLargeMobile) {
        content.style.margin = isMediumMobile ? "100px" : "10px"
        content.style.height = "100vh"
      } else {
        content.style.margin = "100px"
        content.style.height = "90vh"

      }
    } else {
      content.style.transform = "scale(1.3)";
    }
    htmlToPdf()
      .from(content)
      .save(`receipt-${data.serialNumber || "unknown"}.pdf`)
      .then(() => {
        content.style.transform = "none";
        content.style.height = "100vh";
      });
  };

  const brandLogo = (brandName, fallbackUrl) => {
    const fileName = brandName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "");
    console.log("fileName ===>", fileName);
    const filePath = `/assets/brandLogo/${fileName}.jpeg`;
    console.log("filePath ===>", filePath);
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
      <div
        ref={pdfRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          margin: "100px",
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Parking Ticket</title>
      <style>
        hr {
            border: none; /* Remove default border */
            height: 3px; /* Set the height of the line */
            background-color: ${receiptData.receiptColor ?? "#f44336"
              }; /* Set the color of the line */
        }
    </style>
    </head>
    <body
      style="
        font-family: Arial, sans-serif;"
    >
      <div
        style="
          background-color: white;
          border: 3px solid ${receiptData.receiptColor ?? "#f44336"};;
          border-radius: 10px;
          width: 350px;
          padding: 20px;
        "
      >
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          "
        >
          <div style="text-align: center; font-size: 14px">
            <p style="margin: 0; font-weight: 700">${receiptData.brandName || ""
              }</p>
            <p style="margin: 0; font-size:10px">${receiptData.brandAddress || ""
              }</p>
            <p style="margin: 0;font-size:12px">${receiptData.brandMobile || ""
              }</p>
          </div>
          <div>
          <div>
          ${receiptData.brandName && receiptData.brandLogo
                ? `<img height="auto" width="100px" style="" src="${brandLogo(
                  receiptData.brandName,
                  receiptData.brandLogo
                )}" alt="${receiptData.brandName}" />`
                : ""
              }
        </div>
          </div>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 30px">
          <div
            style="
              text-align: center;
              margin: 0 auto;
              border: 3px solid ${receiptData.receiptColor ?? "#f44336"};;
              border-radius: 10px;
              padding: 5px 30px;
              display: inline-block;
            "
          >
            <p style="margin: 0; font-size: 12px; display: block">
              ${receiptData?.isPass ? "# of Tickets" : "License Plate"}
            </p>
            <h2 style="margin: 0; font-size: 24px; display: block; color:${receiptData.receiptColor ?? "#f44336"
              };">${receiptData?.isPass ? receiptData?.noOfPasses : receiptData?.licensePlates?.map(
                (item) => item.licensePlateNumber
              )}</h2>
          </div>
        </div>
        ${receiptData?.spaceNumber && receiptData?.spaceNumber !== ""
                ? `<div style="display: flex; justify-content: center; margin-top: 15px">
          <div
          style="
              text-align: center;
              margin: 0 auto;
             
              padding: 5px 30px;
              display: inline-block;
            "
          >
          <p style="margin: 0; font-size: 12px; display: block; font-weight:bold; ">
              Space Number
            </p>
            <h2 style="margin: 0; font-size: 15px; display: block; color:${receiptData.receiptColor ?? "#f44336"
                };">${receiptData?.spaceNumber}</h2>
          </div>
          </div>`
                : ""
              }
        <div style="text-align: center; margin: 20px">
          <div style="display: flex; justify-content: center">
            <div style="text-align: left">
              <div style="display: flex; align-items: center">
                <p style="margin-right: 10px; font-weight: 700; display: inline">
                  From
                </p>
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <div style="display: inline-block; text-align: center">
                    <p style="margin: 5px auto; font-size: 14px">${receiptData.startDate
              }</p>
                  </div>
                </div>
              </div>
            </div>
  
            <div style="text-align: right">
              <div style="display: flex; align-items: center">
                <p style="margin: 10px; font-weight: 700; display: inline">To</p>
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <div style="display: inline-block; text-align: center">
                    <p style="margin: 5px auto; font-size: 14px">${receiptData.endDate
              }</p>
                 </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style="text-align: left; margin-bottom: 30px; margin-top: 30px">
        <div style="margin: 5px 0; align-items: center; display: flex;">
        <img
              src="assets/icons/receipt-icon.png"
              alt="receipt icon"
              style="height: 20px; width: 20px; margin-right: 5px"
            />
            <p style="font-size:18px">
            #${receiptData.transientNumber}
          </p>
            </div>
          
          <div style="margin: 5px 0; align-items: center; display: flex;">
          <img
              src="assets/icons/location-icon.png"
              alt="location icon"
              style="height: 20px; width: 20px; margin-right: 5px"
            />
            <p style="font-size:13px" >
            ${receiptData.placeAddress}
            </p>
          </div>
  
        
        </div>
        <div style="text-align: right; margin: 10px; margin-top: 40px">
          <p style="margin-top: 0; margin-bottom: 5px">
            Price: $${receiptData.isValidationApplied
                ? get(
                  receiptData,
                  "withoutDiscountBaseRate",
                  receiptData.baseRate
                )
                : receiptData.baseRate
              }
          </p>
          <p style="margin-top: 0; margin-bottom: 5px">
            Service Fee: $${receiptData?.updatedServiceFee || 0}
          </p>
        
          ${receiptData.tax && receiptData.tax > 0
                ? `  <p style="margin-top: 0; margin-bottom: 5px">
            State Tax:  $${ceil(receiptData.tax, 2)}
          </p>`
                : ""
              }
          ${receiptData.cityTax && receiptData.cityTax > 0
                ? `<p style="margin-top: 0; margin-bottom: 5px">
              City Tax: $${ceil(receiptData.cityTax, 2)}
            </p>`
                : ""
              }
          ${receiptData.countyTax && receiptData.countyTax > 0
                ? `<p style="margin-top: 0; margin-bottom: 5px">
              County Tax: $${ceil(receiptData.countyTax, 2)}
            </p>`
                : ""
              }
          ${receiptData.isValidationApplied
                ? `
          <p style="margin-top: 0; margin-bottom: 5px">
          Discount: -$${receiptData.discount}
        </p>
          `
                : ""
              }
          
         
          <hr style="color:${receiptData.receiptColor ?? "#f44336"};" />
          <p style="margin-top: 5px; margin-bottom: 0; font-weight: 700">
            Paid: $${receiptData.total}
          </p>
        </div>
        <div style="text-align: end; font-size: 12px; margin-top: 30px">
        ${receiptData.isPass ? `
          <p style="margin: 0"><strong>Rider Last Name:</strong> ${receiptData.lastName}</p>
          <p style="margin: 0"><strong>Rider Email:</strong> ${receiptData.email}</p>
          ` : ``}
          <p style="margin: 0"><strong>Txn Id:</strong> ${receiptData.transactionId}</p>
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