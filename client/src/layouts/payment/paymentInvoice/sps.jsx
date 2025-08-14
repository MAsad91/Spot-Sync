import { useRef, useEffect, useState } from "react"
// import { useLocation } from "react-router-dom"
import { jsPDF } from "jspdf"
import { get } from "lodash"
import { useLocation } from "react-router-dom"

export default function InvoiceSPS() {
  const pdfRef = useRef(null)
   let isSubmit = true

  const { state } = useLocation()
  let data = get(state, "data")
  let consolidateReceipt = get(data, "consolidateReceipt", false)
  const handleDownload = () => {
    const content = pdfRef.current
    // const doc = new jsPDF()
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const name = `receipt-${get(data, "licensePlate", "")}.pdf`

    if (content) {
      doc.html(content, {
        callback: function (doc) {
          doc.save(name)
        },
        html2canvas: { scale: 0.429888 }, // change the scale to whatever number you need
        margin: [5, 0, 0, 0],

        // orientation: "portrait",
        // format: "a4",
      })
    }
    isSubmit = false
  }

  useEffect(() => {
    handleDownload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div ref={pdfRef}>
        <title>SPS</title>
        {/* <meta charset="utf-8" /> */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <div
          style={{
            width: "440px",
            maxWidth: "100%",
            marginLeft: "30px",
            // margin: "15px auto 0",
            background: "#fff",
            fontSize: "16px",
            color: "#000",
            fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
            fontWeight: "normal",
            border: "3px solid rgb(0, 153, 255)",
            padding: "20px 20px",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <img
              src="../../../images/spslogo.png"
              alt="logo"
              style={{ marginBottom: "16px", width: "140px" }}
            />
            <h1 style={{ width: "100%", fontSize: "14px", border: 0 }}>
              PARKING RECEIPT
            </h1>
            <p style={{ color: "#666", marginBottom: "30px" }}>
              Txn Id: <span> {get(data, "transactionId", "")}</span>
            </p>
            <table style={{ width: "100%", fontSize: "14px", border: "0" }}>
            <tr>
                <td
                  style={{
                    color: "#666",
                    border: "0",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
                    textAlign: "left",
                  }}
                >
                  Date:
                </td>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    textAlign: "right",
                    padding: "6px 20px"
                  }}
                >
                  {get(data, "RDate", "")}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    color: "#666",
                    border: "0",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
                    textAlign: "left"
                  }}
                >
                  License Plate:
                </td>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    textAlign: "right",
                    padding: "6px 20px",
                  }}
                >
                  {consolidateReceipt ? get(data, "licensePlates", "") : get(data, "licensePlate", "")}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
                    textAlign: "left"
                  }}
                >
                  Start Time:
                </td>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    textAlign: "right",
                    padding: "6px 20px",
                  }}
                >
                  {get(data, "startTime", "")}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
                    textAlign: "left"
                  }}
                >
                  End Time:
                </td>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    textAlign: "right",
                    padding: "6px 20px",
                  }}
                >
                  {get(data, "endTime", "")}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
                    textAlign: "left"
                  }}
                >
                  Rate:
                </td>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    textAlign: "right",
                    padding: "6px 20px"
                  }}
                >
                  ${get(data, "baseRate", "")}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
                    textAlign: "left"
                  }}
                >
                 Taxes & Fees:
                </td>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    textAlign: "right",
                    padding: "6px 20px",
                  }}
                >
                  ${get(data, "taxTotal", "")}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
                    textAlign: "left"
                  }}
                >
                  Service Fee:
                </td>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    textAlign: "right",
                    padding: "6px 20px",
                  }}
                >
                  ${get(data, "fee", "")}
                </td>
              </tr>
               {/* {get(data, "merchantFeePaidBy", "") ==='Customer' &&
              <tr>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
                    textAlign: "left",
                  }}
                >
                Processing Fee:
                </td>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    textAlign: "right",
                    padding: "6px 20px",
                  }}
                >
                  ${get(data, "merchantFee", "")}
                </td>
              </tr>
           } */}

              <tr>
                <td
                  style={{
                    color: "#666",
                    padding: "6px 20px",
                    textAlign: "left"
                  }}
                >
                  Total:
                </td>
                <td
                  style={{
                    color: "#666",
                    textAlign: "right",
                    padding: "6px 20px",
                  }}
                >
                  ${get(data, "total", "")}
                </td>
              </tr>
            </table>
            <p style={{ color: "#666", marginTop: "50px", fontSize: "9px" }}>
              <span>Payments Powered by</span>
            </p>
            <img
              src="../../../images/isbp-logo.png"
              alt="logo"
              style={{
                marginBottom: "50px",
                width: "100px",
                // marginTop: "50px",
              }}
            />
            <a
              href=""
              style={{
                fontSize: "12px",
                textAlign: "center",
                color: "#3d6687",
                textDecoration: "none",
                display: "block",
              }}
            >
              www.shorelineparking.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
