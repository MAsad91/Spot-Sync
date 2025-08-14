import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const TransactionPermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Transaction_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Transaction_view: true,
        Transaction_export: true
      }));
    }
  }, [modules, setModules]);
  
  console.log("modules ====>", modules);

  const handleTransactionViewChange = (event) => {
    const isTransactionViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Transaction_view: isTransactionViewEnabled,
      ...(isTransactionViewEnabled
        ? {}
        : { Transaction_export: false }),
    });
  };

  return (
    <>
      <Card sx={{ minWidth: 275, boxShadow: 3 }}>
        <MDBox p={2}>
          <Grid container spacing={1}>
            <Grid item xs={12} container alignItems="center">
              <MDTypography
                color="dark"
                display="block"
                variant="subtitle2"
                fontWeight="bold"
                sx={{ flex: 1 }}
              >
                Transaction Module
              </MDTypography>
              <Tooltip
                title={`${
                  modules.Transaction_view ? "Disable" : "Enable"
                } Transaction module`}
                placement="top"
              >
                <Switch
                  checked={modules.Transaction_view}
                  onChange={handleTransactionViewChange}
                />
              </Tooltip>
            </Grid>
            

          </Grid>
        </MDBox>
      </Card>
    </>
  );
};

export default TransactionPermissionCard;
