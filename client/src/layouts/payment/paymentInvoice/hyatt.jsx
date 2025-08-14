import { useRef, useEffect } from "react";
// import { useLocation } from "react-router-dom"
import { jsPDF } from "jspdf";
import { get } from "lodash";
import { useLocation } from "react-router-dom";
// import hyattLogo from "../../../images/hyattLogo.png";
// import pcalogo from "../../../images/pca-logo-new.png";

export default function InvoiceHyatt() {
  const pdfRef = useRef(null);
  let isSubmit = true;

  const { state } = useLocation();
  let data = get(state, "data");

  const handleDownload = () => {
    const content = pdfRef.current;
    // const doc = new jsPDF()
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const name = `receipt-${get(data, "licensePlate", "")}.pdf`;

    if (content) {
      doc.html(content, {
        callback: function (doc) {
          doc.save(name);
        },
        html2canvas: { scale: 0.429888 }, // change the scale to whatever number you need
        margin: [5, 0, 0, 0],

        // orientation: "portrait",
        // format: "a4",
      });
    }
    isSubmit = false;
  };

  useEffect(() => {
    // handleDownload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const styles = {
    background: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px",
      border: "1px solid #ccc",
    },
    background2: {
      backgroundColor: "#d1d3dd",
      position: "relative",
      padding: "10px",
      textAlign: "left",
      // eslint-disable-next-line no-dupe-keys
      position: "relative",
      height: "100%",
    },
    image: {
      maxWidth: "100%",
      width: "200px",
      maxHeight: "100%",
    },
    text: {
      color: "#666886",
      fontWeight: "bold",
      fontSize: "25px",
      fontFamily: "Quicksand,Arial, sans-serif",
      marginTop: "10px",
    },
    ticket: {
      fontWeight: "bold",
      color: "#666886",
      fontSize: "190px",
      marginTop: "-60px",
      marginBottom: "-60px",
    },
    pcalogo: {
      width: "45px",
      position: "absolute",
      bottom: "20px",
      right: "15px",
    },

    "@media (max-width: 412px)": {
      h1: {
        fontSize: "30px",
      },
      h6: {
        fontSize: "14px",
        marginLeft: "10px",
      },
      span: {
        fontSize: "100px",
      },
      img: {
        width: "70px",
        bottom: "5px",
        right: "10px",
      },
    },
  };
  return (
    <div>
      <div
        style={{
          width: "540px",
          maxWidth: "100%",
          marginLeft: "0px",
          marginRight: "20px",
          background: "#fff",
          color: "#000",
          border: "3px solid rgb(0, 153, 255)",
          padding: "20px 20px",
          boxSizing: "border-box",
          fontFamily:
            "Verdana, Geneva, Tahoma, sans-serif; font-weight: normal; border: 3px solid rgb(0, 153, 255)",
          borderImage: "linear-gradient(75deg, #00a1ff, #b200ff) 1",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div ref={pdfRef}>
            <title>Hyatt Disney Shuttle</title>
            {/* <meta charset="utf-8" /> */}
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <div style={styles.background}>
              <img
                src="../../../images/hyattlogo.png"
                alt="Hyatt Regency"
                style={styles.image}
                onLoad={handleDownload}
              />
              <h1 style={styles.text}>Date : {get(data, "date", "")}</h1>
              <h1 style={styles.text}># of Tickets</h1>
              <span style={styles.ticket}>{get(data, "noOfPasses", "")}</span>
            </div>
            <div style={styles.background2}>
              <div style={{ marginBottom: "20px" }}>
                <h6>Rider Last Name : {get(data, "lastName", "")}</h6>
                <h6>Rider Email : {get(data, "email", "")}</h6>
                {/* <h6>Rider Phone Number : {get(data, "mobile", "")}</h6> */}
                <h6>Transaction ID : {get(data, "transactionId", "")}</h6>
                <h6>Total: ${get(data, "total", "")}</h6>
              </div>
              <div style={{}}>
                <span
                  style={{
                    opacity: "0.6",
                    fontWeight: "bold",
                    fontSize: "12px",
                    position: "absolute",
                    right: "10px",
                    bottom: "50px",
                  }}
                >
                  Powered by
                </span>
                <img
                  src="../../../images/pca-logo-new.png"
                  alt="Parking Company Of America"
                  style={styles.pcalogo}
                />
              </div>
              <div
                style={{
                  opacity: "0.7",
                  fontWeight: "bold",
                  fontSize: "10px",
                  marginTop: "30px",
                  bottom: "10px",
                  textAlign: "center",
                }}
              >
                <span>*YOU MAY BE ASKED TO VERIFY IDENTITY*</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}