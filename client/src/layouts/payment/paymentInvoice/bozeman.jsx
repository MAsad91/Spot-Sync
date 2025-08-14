import { useRef, useEffect, useState } from "react"
import { jsPDF } from "jspdf"
import { get } from "lodash"
import { useLocation } from "react-router-dom"

export default function InvoiceBOZEMAN(props) {
  const pdfRef = useRef(null)
  let isSubmit = true

  const { state } = useLocation()
  let data = get(state, "data", {})

  useEffect(() => {
    handleDownload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        // html2canvas: { scale: 0.2 }, // change the scale to whatever number you need
        html2canvas: { scale: 0.429888 }, // change the scale to whatever number you need
        margin: [5, 0, 0, 0],
      })
    }
    isSubmit = false
  }

  return (
    <div>
      <div ref={pdfRef}>
        <title>Bozeman</title>
        {/* <meta charset="utf-8" /> */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <div
          style={{
            width: "440px",
            maxWidth: "100%",
            maxHeight: "663px",
            // margin: "0 auto",
            marginLeft: "30px",
            background: "#fff",
            fontSize: "16px",
            color: "#000",
            fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
            fontWeight: "normal",
            border: "3px solid rgb(254 118 48)",
            padding: "20px 0px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "28px",
                textAlign: "center",
                marginBottom: "50px",
                fontWeight: "900",
                textTransform: "uppercase",
              }}
            >
              bozeman parking
            </h1>
            <h2
              style={{
                fontSize: "25px",
                textAlign: "center",
                marginBottom: "50px",
              }}
            >
              PARKING RECEIPT
            </h2>
            <p style={{ color: "#666", marginBottom: "30px" }}>
              Txn Id: <span>{get(data, "transactionId", "")}</span>
            </p>
            <table style={{ width: "100%", fontSize: "14px", border: "0" }}>
              <tr>
                <td
                  style={{
                    textAlign: "left", /////
                    color: "#666",
                    border: "0",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
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
                  {get(data, "licensePlate", "")}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    textAlign: "left", /////
                    color: "#666",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
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
                    textAlign: "left", /////
                    color: "#666",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
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
                    textAlign: "left", /////
                    color: "#666",
                    borderBottom: "1px solid #333",
                    padding: "6px 20px",
                  }}
                >
                  Rate:
                </td>
                <td
                  style={{
                    color: "#666",
                    borderBottom: "1px solid #333",
                    textAlign: "right",
                    padding: "6px 20px",
                  }}
                >
                  ${get(data, "baseRate", "")}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    color: "#666",
                    padding: "6px 20px",
                    textAlign: "left", /////
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
            {/* <span>Payments Powered by</span> */}
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
            <h3
              style={{
                fontSize: "16px",
                textAlign: "center",
                marginBottom: "30px",
                textTransform: "capitalize",
              }}
            >
              Thank you and drive safely!
            </h3>
            <a
              // href=""
              href="/#"
              style={{
                fontSize: "12px",
                textAlign: "center",
                color: "#3d6687",
                textDecoration: "none",
                display: "block",
              }}
            >
              www.bozemanparking.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
