// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// PMS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useState, useEffect } from "react";
import CreateSlack from "./components/CreateSlack";
import StackTable from "./components/SlackTable";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getSlack } from "store/slice/slack/slackSlice";
import { setSlacks } from "store/slice/slack/slackSlice";
import { setPlaceIdForSlacks } from "store/slice/slack/slackSlice";

function Slack() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const [slackData, setSlackData] = useState([]);
  const placesData = useSelector((state) => state.places?.selectedPlace);
  const { slacks, placeId: slacksPlaceId } = useSelector((state) => state.slacks);
  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");

  const handleGetSlacks = () => {
    dispatch(getSlack(placeId))
      .unwrap()
      .then((res) => {
        console.log("slack response:", res);
        if (res?.success) {
          console.log("res====>", res);
          setSlackData(res?.slacks);
          dispatch(setSlacks(res?.slacks));
          dispatch(setPlaceIdForSlacks(placeId));
        }
      })
      .catch((err) => {
        console.error("Error getting slacks:", err);
      });
  };

  useEffect(() => {
    if (!slacksPlaceId) {
      handleGetSlacks();
      return;
    }

    if (slacksPlaceId !== placeId) {
      handleGetSlacks();
    } else if (slacks && slacks.length) {
      setSlackData(slacks);
    }
  }, [placesData?._id]);

  const updateData = () => {
    handleGetSlacks();
  };

  return (
    <MDBox>
      <MDBox pt={2} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={1}
                mt={-2}
                py={1}
                px={1}
                variant="gradient"
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
                  Slack
                </MDTypography>

                <MDButton
                  variant="outlined"
                  size="small"
                  onClick={() => setDialogOpen(true)}
                >
                  Create
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                <StackTable
                  slackData={slackData}
                  updateParentData={updateData}
                />
                <CreateSlack
                  dialogOpen={dialogOpen}
                  onClose={() => setDialogOpen(false)}
                  updateParentData={updateData}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

export default Slack;
