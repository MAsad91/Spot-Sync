import { useRef, useEffect } from "react"
// import { useLocation } from "react-router-dom"
import { jsPDF } from "jspdf"
import { get } from "lodash"
import { useLocation } from "react-router-dom"
import moment from "moment"
export default function InvoiceXPress() {
  const pdfRef = useRef(null)
   let isSubmit = true

  const { state } = useLocation()
  let data = get(state, "data")
  let consolidateReceipt = get(data, "consolidateReceipt", false)
  let isSubscription = get(data, "isSubscription", false)

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

  const getFormattedDate = (input) => {
    const date = moment(input)

    if (date.isValid()) {
        return date.format('LLL'); 
    } else {
        const parsedTime = moment(input, 'h:mmA')
        if (parsedTime.isValid()) {
            return parsedTime.format('LT')
        } else {
            return input
        }
    }
};

  return (
    <div>
      <div ref={pdfRef}>
        <title>Drive Hospitality</title>
        {/* <meta charset="utf-8" /> */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <div
          style={{
            width: "380px",
            maxWidth: "100%",
            marginLeft: "30px",
            // margin: "15px auto 0",
            background: "#fff",
            fontSize: "16px",
            color: "#000",
            fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
            fontWeight: "normal",
            border: "3px solid #FF5F01",
            margin: "20px",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <img
              src="../../../images/dh_logo.jpg"
              alt="logo"
              style={{ width: isSubscription ? "200px" : "220px" }}
            />
            <h1 style={{ width: "100%", fontSize: "21px", border: 0, marginBottom: "16px" }}>
              PARKING RECEIPT
            </h1>
            <p style={{ color: "#666", marginBottom: isSubscription ? "20px" : "30px", fontSize: "14px" }}>
              Txn Id: <span> {get(data, "transactionId", "")}</span>
            </p>
            <table style={{ width: "100%", fontSize: "14px", border: "0" }}>
              <tr>
                <td 
                  style={{
                    display: "flex", width: "100%",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #333"
                  }}
                >
                  <div
                    style={{
                      color: "#666",
                      border: "0",
                      padding: "6px 20px",
                      textAlign: "left"
                    }}
                  >
                    Date:
                  </div>
                  <div
                    style={{
                      color: "#666",
                      textAlign: "right",
                      padding: "6px 20px"
                    }}
                  >
                    {get(data, "RDate", "")}
                  </div>
                </td>
              </tr>

              {get(data, "parkerName", "") !== "" ? (
                <tr>
                  <td 
                    style={{
                      display: "flex", width: "100%",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #333"
                    }}
                  >
                    <div
                      style={{
                        color: "#666",
                        border: "0",
                        padding: "6px 20px",
                        textAlign: "left"
                      }}
                    >
                      Parker Name:
                    </div>
                    <div
                      style={{
                        color: "#666",
                        textAlign: "right",
                        padding: "6px 20px"
                      }}
                    >
                      {get(data, "parkerName", "")}
                    </div>
                  </td>
                </tr>
              ) : null
              }
              
              {get(data, "lotAddress", "") !== "" ? (
                <tr>
                  <td 
                    style={{
                      display: "flex", width: "100%",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #333"
                    }}
                  >
                    <div
                      style={{
                        color: "#666",
                        border: "0",
                        padding: "6px 20px",
                        textAlign: "left"
                      }}
                    >
                      Lot Address:
                    </div>
                    <div
                      style={{
                        color: "#666",
                        textAlign: "right",
                        padding: "6px 20px"
                      }}
                    >
                      {get(data, "lotAddress", "")}
                    </div>
                  </td>
                </tr>
              ) : null
              }

              <tr>
                <td 
                  style={{
                    display: "flex", width: "100%",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #333"
                  }}
                >
                  <div
                    style={{
                      color: "#666",
                      border: "0",
                      padding: "6px 20px",
                      textAlign: "left",
                      position: "relative"
                    }}
                  >
                    <div
                      style={{
                        margin: 0,
                        position: "absolute",
                        top: "calc(50% - 10px)",
                        left: "50%"
                      }}
                    >
                      License Plate(s):
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#666",
                      textAlign: "right",
                      padding: "6px 20px"
                    }}
                  >
                  {consolidateReceipt ?
                    (
                      get(data, "licensePlates", "").split(",").length > 10 ?
                        (
                          <div>
                            Count: {get(data, "licensePlates", "").split(",").length}
                          </div>
                        )
                      :
                      get(data, "licensePlates", "").split(",").map((item, index) => {
                        return (
                          <div key={index}>
                            {item}
                          </div>
                        )
                    }))
                  : get(data, "licensePlate", "")}

                  </div>
                </td>
              </tr>

              <tr>
                <td 
                  style={{
                    display: "flex", width: "100%",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #333"
                  }}
                >
                  <div
                    style={{
                      color: "#666",
                      border: "0",
                      padding: "6px 20px",
                      textAlign: "left"
                    }}
                  >
                    Start Time:
                  </div>
                  <div
                    style={{
                      color: "#666",
                      textAlign: "right",
                      padding: "6px 20px"
                    }}
                  >
                    {getFormattedDate(get(data, "startTime", ""))}
                  </div>
                </td>
              </tr>

              <tr>
                <td 
                  style={{
                    display: "flex", width: "100%",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #333"
                  }}
                >
                  <div
                    style={{
                      color: "#666",
                      border: "0",
                      padding: "6px 20px",
                      textAlign: "left"
                    }}
                  >
                    End Time:
                  </div>
                  <div
                    style={{
                      color: "#666",
                      textAlign: "right",
                      padding: "6px 20px"
                    }}
                  >
                    {getFormattedDate(get(data, "endTime", ""))}
                  </div>
                </td>
              </tr>

              <tr>
                <td 
                  style={{
                    display: "flex", width: "100%",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #333"
                  }}
                >
                  <div
                    style={{
                      color: "#666",
                      border: "0",
                      padding: "6px 20px",
                      textAlign: "left"
                    }}
                  >
                    Rate:
                  </div>
                  <div
                    style={{
                      color: "#666",
                      textAlign: "right",
                      padding: "6px 20px"
                    }}
                  >
                    ${get(data, "baseRate", "")}
                  </div>
                </td>
              </tr>

              <tr>
                <td 
                  style={{
                    display: "flex", width: "100%",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #333"
                  }}
                >
                  <div
                    style={{
                      color: "#666",
                      border: "0",
                      padding: "6px 20px",
                      textAlign: "left"
                    }}
                  >
                    Taxes & Fees:
                  </div>
                  <div
                    style={{
                      color: "#666",
                      textAlign: "right",
                      padding: "6px 20px"
                    }}
                  >
                    ${get(data, "taxTotal", "")}
                  </div>
                </td>
              </tr>

              <tr>
                <td 
                  style={{
                    display: "flex", width: "100%",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #333"
                  }}
                >
                  <div
                    style={{
                      color: "#666",
                      border: "0",
                      padding: "6px 20px",
                      textAlign: "left"
                    }}
                  >
                    Service Fee:
                  </div>
                  <div
                    style={{
                      color: "#666",
                      textAlign: "right",
                      padding: "6px 20px"
                    }}
                  >
                    ${get(data, "fee", "")}
                  </div>
                </td>
              </tr>

              <tr>
                <td 
                  style={{
                    display: "flex", width: "100%",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #333"
                  }}
                >
                  <div
                    style={{
                      color: "#666",
                      border: "0",
                      padding: "6px 20px",
                      textAlign: "left"
                    }}
                  >
                    Total:
                  </div>
                  <div
                    style={{
                      color: "#666",
                      textAlign: "right",
                      padding: "6px 20px"
                    }}
                  >
                    ${get(data, "total", "")}
                  </div>
                </td>
              </tr>
            </table>
            <div
              style={{
                fontWeight: "bold",
                marginTop: isSubscription ? "20px" : "50px",
                marginBottom: "20px"
              }}
            >
              Thank You And Drive Safely!
            </div>
            <a
              href="www.drivehospitality.com"
              style={{
                fontSize: "12px",
                textAlign: "center",
                color: "black",
                textDecoration: "none",
                display: "block",
                marginBottom: "10px"
              }}
            >
              www.drivehospitality.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
