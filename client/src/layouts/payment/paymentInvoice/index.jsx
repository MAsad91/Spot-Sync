import { useEffect, useState } from "react";
import { get } from "lodash";
import { useNavigate, useLocation } from "react-router-dom";
import { getShortlyData } from "store/slice/payment/paymentSlice";
import { useDispatch } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import { Backdrop, Stack } from "@mui/material";
import MDTypography from "components/MDTypography";

export default function Invoice(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("Please Wait !!");
  const [loading, setLoading] = useState(false);
  const getQueryStringValue = (key) => {
    const params = window.location.pathname.split("/invoice/")[1];
    return params;
  };
  const shortlyId = getQueryStringValue("shortlyId");
  console.log("shortlyId ===>", shortlyId);
  useEffect(() => {
    getReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { state } = useLocation(); // Remove if not using react-router for data passing
  const data = state?.data || {};

  const getReceipt = async () => {
    setLoading(true)
    await dispatch(getShortlyData(shortlyId))
      .unwrap()
      .then((result) => {
        if (result.message === "Payment Already Paid") {
          let brand = get(result, "shortlyData.brand", "SPOTSYNC");
          if (brand === "BOZEMAN") {
            navigate(`/bozemanreceipt`, {
              state: {
                data: data,
              },
            });
          } else if (brand === "SPOTSYNC") {
            navigate(`/payment/spotsyncreceipt`, {
              state: {
                data: data,
              },
            });
          } else if (brand === "SPS") {
            navigate(`/spsreceipt`, {
              state: {
                data: data,
              },
            });
          } else if (brand === "PCA") {
            navigate(`/pcareceipt`, {
              state: {
                data: data,
              },
            });
          } else if (brand === "XPresS") {
            navigate(`/xpressreceipt`, {
              state: {
                data: data,
              },
            });
          } else if (brand === "Hyatt") {
            navigate(`/invoice-hyatt`, {
              state: {
                data: data,
              },
            });
          } else if (brand === "DRIVE HOSPITALITY") {
            navigate(`/drive-hospitality`, {
              state: {
                data: data,
              },
            });
          } else {
            navigate(`/spsreceipt`, {
              state: {
                data: data,
              },
            });
          }
        } else {
          setErrorMessage("Somthing Went Wrong !");
          setLoading(false)
        }
      })
      .catch((err) => {});
  };

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={loading}
    >
      <Stack direction="column" spacing={1} alignItems="center">
        <CircularProgress color="inherit" />
        <MDTypography
          variant="h5"
          sx={{ color: "primary.contrastText" }}
          className="mt-4"
        >
          {errorMessage}
        </MDTypography>
      </Stack>
    </Backdrop>
  );
  // <div className="shortly__loading">{errorMessage}</div>);
}
