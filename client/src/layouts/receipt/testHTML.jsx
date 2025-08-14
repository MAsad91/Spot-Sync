import React, { useRef } from "react";
// import htmlToPdf from "html-to-pdf-js";
import { Button } from "@mui/material";
import jsPDF from "jspdf";

const ReservationRatesTable = () => {
  const pdfRef = useRef(null);

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

  const params = {
    fileHeader: "",
    workSpace: "",
    lotName: "",
  };
  const data = {
    startDate: "08/21/2024",
    endDate: "08/21/2024 23:59:59",
    total: 28726,
    serviceFee: 2350,
    totals: {
      "5 hrs @ $10": {
        count: 1,
        rateFor: "2 Hour",
        amount: 1000,
        totalSum: 1000,
      },
      "1 hr @ $4": {
        count: 2,
        rateFor: "2 Hour",
        amount: 400,
        totalSum: 800,
      },
      "Free Parking": {
        count: 6,
        rateFor: "2 Hour",
        amount: 0,
        totalSum: 0,
      },
      "1 hr @ $2.5": {
        count: 9,
        rateFor: "2 Hour",
        amount: 250,
        totalSum: 2250,
      },
      "3 hrs @ $5": {
        count: 32,
        rateFor: "2 Hour",
        amount: 500,
        totalSum: 16000,
      },
      "5 hrs @ $7": {
        count: 1,
        rateFor: "2 Hour",
        amount: 700,
        totalSum: 700,
      },
      "Overnight @ $20 (Good until 9:00 AM Next Day)": {
        count: 2,
        rateFor: "2 Hour",
        amount: 2000,
        totalSum: 4000,
      },
    },
    sums: {
      "5 hrs @ $10": 1000,
      "1 hr @ $4": 800,
      "Free Parking": 0,
      "1 hr @ $2.5": 2250,
      "3 hrs @ $5": 16000,
      "5 hrs @ $7": 700,
      "Overnight @ $20 (Good until 9:00 AM Next Day)": 4000,
    },
    totalReservation: 53,
    data: [
      {
        time: "00:00",
        totalCount: 1,
        totalRevenue: 1113,
        totalServiceFee: 50,
        percentage: "3.87",
        rates: {
          "5 hrs @ $10": {
            count: 1,
            amount: 1000,
            rateFor: "2 Hour",
          },
        },
        revenuePercent: "100.00",
      },
      {
        time: "01:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "02:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "03:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "04:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "05:00",
        totalCount: 2,
        totalRevenue: 954,
        totalServiceFee: 100,
        percentage: "3.32",
        rates: {
          "1 hr @ $4": {
            count: 2,
            amount: 400,
            rateFor: "2 Hour",
          },
        },
        revenuePercent: "46.15",
      },
      {
        time: "06:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "07:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "08:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "09:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "10:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "11:00",
        totalCount: 2,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {
          "Free Parking": {
            count: 2,
            amount: 0,
            rateFor: "2 Hour",
          },
        },
        revenuePercent: "0.00",
      },
      {
        time: "12:00",
        totalCount: 1,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {
          "Free Parking": {
            count: 1,
            amount: 0,
            rateFor: "2 Hour",
          },
        },
        revenuePercent: "0.00",
      },
      {
        time: "13:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "14:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "15:00",
        totalCount: 2,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {
          "Free Parking": {
            count: 2,
            amount: 0,
            rateFor: "2 Hour",
          },
        },
        revenuePercent: "0.00",
      },
      {
        time: "16:00",
        totalCount: 1,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {
          "Free Parking": {
            count: 1,
            amount: 0,
            rateFor: "2 Hour",
          },
        },
        revenuePercent: "0.00",
      },
      {
        time: "17:00",
        totalCount: 5,
        totalRevenue: 2597,
        totalServiceFee: 250,
        percentage: "9.04",
        rates: {
          "1 hr @ $2.5": {
            count: 2,
            amount: 250,
            rateFor: "2 Hour",
          },
          "3 hrs @ $5": {
            count: 2,
            amount: 500,
            rateFor: "2 Hour",
          },
          "5 hrs @ $7": {
            count: 1,
            amount: 700,
            rateFor: "2 Hour",
          },
        },
        revenuePercent: "55.68",
      },
      {
        time: "18:00",
        totalCount: 17,
        totalRevenue: 12561,
        totalServiceFee: 850,
        percentage: "43.73",
        rates: {
          "1 hr @ $2.5": {
            count: 2,
            amount: 250,
            rateFor: "2 Hour",
          },
          "3 hrs @ $5": {
            count: 13,
            amount: 500,
            rateFor: "2 Hour",
          },
          "Overnight @ $20 (Good until 9:00 AM Next Day)": {
            count: 2,
            amount: 2000,
            rateFor: "2 Hour",
          },
        },
        revenuePercent: "72.92",
      },
      {
        time: "19:00",
        totalCount: 13,
        totalRevenue: 7314,
        totalServiceFee: 650,
        percentage: "25.46",
        rates: {
          "3 hrs @ $5": {
            count: 12,
            amount: 500,
            rateFor: "2 Hour",
          },
          "1 hr @ $2.5": {
            count: 1,
            amount: 250,
            rateFor: "2 Hour",
          },
        },
        revenuePercent: "29.81",
      },
      {
        time: "20:00",
        totalCount: 7,
        totalRevenue: 3286,
        totalServiceFee: 350,
        percentage: "11.44",
        rates: {
          "1 hr @ $2.5": {
            count: 3,
            amount: 250,
            rateFor: "2 Hour",
          },
          "3 hrs @ $5": {
            count: 4,
            amount: 500,
            rateFor: "2 Hour",
          },
        },
        revenuePercent: "11.81",
      },
      {
        time: "21:00",
        totalCount: 2,
        totalRevenue: 901,
        totalServiceFee: 100,
        percentage: "3.14",
        rates: {
          "3 hrs @ $5": {
            count: 1,
            amount: 500,
            rateFor: "2 Hour",
          },
          "1 hr @ $2.5": {
            count: 1,
            amount: 250,
            rateFor: "2 Hour",
          },
        },
        revenuePercent: "3.14",
      },
      {
        time: "22:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
      {
        time: "23:00",
        totalCount: 0,
        totalRevenue: 0,
        totalServiceFee: 0,
        percentage: "0.00",
        rates: {},
        revenuePercent: 0,
      },
    ],
  };
  
  return (
    <div ref={pdfRef}>
      <div style={{ width: "2460px", maxWidth: "100%", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
          {params.fileHeader && params.fileHeader !== ""
            ? `${params.fileHeader} ${data.startDate}`
            : `${params.workSpace} Revenue Summary ${data.startDate}`}
        </h1>
        <div style={{ width: "50%", float: "left" }}>
          <h6
            style={{
              margin: 0,
              padding: 0,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "14px",
            }}
          >
            Location: {params.lotName}
          </h6>
        </div>
        <div style={{ width: "50%", textAlign: "right", float: "left" }}>
          <h6
            style={{
              margin: "0 0 15px 0",
              padding: 0,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "14px",
            }}
          >
            Transaction Type: All
          </h6>
        </div>
        <div style={{ width: "100%", float: "left", marginTop: "40px" }}>
          <table
            cellPadding="0"
            cellSpacing="0"
            style={{
              border: "1px solid #000",
              width: "100%",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            <thead>
              <tr>
                <th style={{ borderRight: "1px solid #000" }}>Rate</th>
                {data.data.map((hour, index) => (
                  <th key={index}>{hour.time}</th>
                ))}
                <th style={{ borderLeft: "1px solid #000" }}>
                  Total Reservations
                </th>
                <th>Gross Revenue by Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(data.totals).map((key) => (
                <tr key={key}>
                  <td style={{ borderRight: "1px solid #000" }}>{key}</td>
                  {data.data.map((item, idx) => (
                    <td key={idx}>
                      {item.rates[key] && item.rates[key].count
                        ? item.rates[key].count
                        : 0}
                    </td>
                  ))}
                  <td style={{ borderLeft: "1px solid #000" }}>
                    {data.totals[key].count}
                  </td>
                  <td>${data.totals[key].totalSum.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td
                  style={{
                    borderRight: "1px solid #000",
                    borderTop: "1px solid #000",
                  }}
                >
                  Total Reservations
                </td>
                {data.data.map((item, idx) => (
                  <td key={idx} style={{ borderTop: "1px solid #000" }}>
                    {Number(item.totalCount).toFixed(2)}
                  </td>
                ))}
                <td
                  style={{
                    borderLeft: "1px solid #000",
                    borderTop: "1px solid #000",
                  }}
                >
                  {data.totalReservation}
                </td>
                <td style={{ borderTop: "1px solid #000" }}></td>
              </tr>
              <tr>
                <td style={{ borderRight: "1px solid #000" }}>
                  % of Total Reservations
                </td>
                {data.data.map((item, idx) => (
                  <td key={idx}>{Number(item.percentage).toFixed(2)}%</td>
                ))}
                <td style={{ borderLeft: "1px solid #000" }}></td>
              </tr>
              <tr>
                <td
                  style={{
                    borderRight: "1px solid #000",
                    borderTop: "1px solid #000",
                  }}
                >
                  Total Revenue
                </td>
                {data.data.map((item, idx) => (
                  <td key={idx} style={{ borderTop: "1px solid #000" }}>
                    ${Number(item.totalRevenue).toFixed(2)}
                  </td>
                ))}
                <td
                  style={{
                    borderLeft: "1px solid #000",
                    borderTop: "1px solid #000",
                  }}
                ></td>
                <td style={{ borderTop: "1px solid #000" }}>
                  ${data.total.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    borderRight: "1px solid #000",
                    borderTop: "1px solid #000",
                  }}
                >
                  % of Total $ Value
                </td>
                {data.data.map((item, idx) => (
                  <td key={idx} style={{ borderTop: "1px solid #000" }}>
                    {Number(item.revenuePercent).toFixed(2)}%
                  </td>
                ))}
                <td style={{ borderLeft: "1px solid #000" }}></td>
                <td style={{ borderTop: "1px solid #000" }}></td>
              </tr>
              <tr>
                <td
                  style={{
                    borderRight: "1px solid #000",
                    borderTop: "1px solid #000",
                  }}
                >
                  Total Service Fee
                </td>
                {data.data.map((item, idx) => (
                  <td key={idx} style={{ borderTop: "1px solid #000" }}>
                    ${Number(item.totalServiceFee).toFixed(2)}
                  </td>
                ))}
                <td
                  style={{
                    borderLeft: "1px solid #000",
                    borderTop: "1px solid #000",
                  }}
                ></td>
                <td style={{ borderTop: "1px solid #000" }}>
                  ${data.serviceFee.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    borderRight: "1px solid #000",
                    borderTop: "1px solid #000",
                  }}
                >
                  Total Revenue - Service Fee
                </td>
                {data.data.map((item, idx) => (
                  <td key={idx} style={{ borderTop: "1px solid #000" }}>
                    $
                    {(
                      Number(item.totalRevenue) - Number(item.totalServiceFee)
                    ).toFixed(2)}
                  </td>
                ))}
                <td
                  style={{
                    borderLeft: "1px solid #000",
                    borderTop: "1px solid #000",
                  }}
                ></td>
                <td style={{ borderTop: "1px solid #000" }}>
                  ${(data.total - data.serviceFee).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <Button sx={{ mt: 5 }} variant="contained" size="large" onClick={handelDownloadReceipt}>
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReservationRatesTable;
