import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
// import { Divider } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import GenerateQrCode from "./TComponents/GenerateQrCode";
import { useMaterialUIController } from "context";
import { useCallback, useEffect, useMemo, useState } from "react";
import QRCodeCard from "./Card";
import { getQRCodes } from "store/slice/qrCode/qrCodeSlice";
import { debounce, map } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import NoDataOverlay from "components/Common/NoDataOverlay";

function GenerateQRCode() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const QRCodeList = useSelector((state) => state.qrCodes.qrCodeList || []);
  const roleModule = useSelector((state) => state.users?.meInfo?.roleId?.modules);

  const getQRCodeData = useCallback(async () => {
    dispatch(getQRCodes());
  }, [dispatch]);

  const debounceFn = useMemo(
    () => debounce(getQRCodeData, 1000),
    [getQRCodeData]
  );

  useEffect(() => {
    debounceFn();
  }, [debounceFn]);
  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox>
          <MDBox pt={2} pb={3}>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <MDBox
                  mx={1}
                  mt={2}
                  py={1}
                  px={1}
                  bgColor={sidenavColor}
                  borderRadius="lg"
                  coloredShadow={sidenavColor}
                  className="d-flex align-items-center gap-2"
                >
                  <MDTypography
                    variant="h6"
                    color="white"
                    className="flex-grow-1"
                  >
                    QR Code
                  </MDTypography>
                  {roleModule?.QRCode_add &&
                    <MDButton
                      variant="outlined"
                      size="small"
                      onClick={() => setDialogOpen(true)}
                    >
                      Create QR CODE
                    </MDButton>
                  }
                </MDBox>

                <MDBox pt={2}>
                  <GenerateQrCode
                    dialogOpen={dialogOpen}
                    onClose={() => {
                      setDialogOpen(false);
                    }}
                  />
                  {QRCodeList.length === 0 ? (
                    <MDBox pt={4}>
                      <NoDataOverlay />
                    </MDBox>
                  ) : (
                    <>
                      <Grid container spacing={2}>
                        {map(QRCodeList ?? [], (item, index) => (
                          <>
                            <Grid item xs={12} md={12}>
                              <QRCodeCard
                                updateParentData={getQRCodeData}
                                item={item}
                              />
                              {/* <Divider dark /> */}
                            </Grid>
                          </>
                        ))}
                      </Grid>
                    </>
                  )}
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
        </MDBox>
      </DashboardLayout>
    </>
  );
}

export default GenerateQRCode;
