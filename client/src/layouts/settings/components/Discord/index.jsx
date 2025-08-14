// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// PMS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useState, useEffect } from "react";
import CreateDiscord from "./components/CreateDiscord";
import DiscordTable from "./components/DiscordTable";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getDiscord, setDiscords, setPlaceIdForDiscords } from "store/slice/discord/discordSlice";

function Discord() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const [discordData, setDiscordData] = useState([]);
  const placesData = useSelector((state) => state.places?.selectedPlace);
  const { discords, placeId: discordsPlaceId } = useSelector((state) => state.discord);
  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");

  const handleGetDiscords = () => {
    dispatch(getDiscord(placeId))
      .unwrap()
      .then((res) => {
        console.log("discord response:", res);
        if (res?.success) {
          console.log("res====>", res);
          setDiscordData(res?.discords);
          dispatch(setDiscords(res?.discords));
          dispatch(setPlaceIdForDiscords(placeId));
        }
      })
      .catch((err) => {
        console.error("Error getting discords:", err);
      });
  };

  useEffect(() => {console.log("working", discordsPlaceId, placeId)
    if (!discordsPlaceId) {
      handleGetDiscords();
      return;
    }

    if (discordsPlaceId !== placeId) {
      handleGetDiscords();
    } else if (discords && discords.length) {
      setDiscordData(discords);
    }
  }, [placesData?._id]);

  const updateData = () => {
    handleGetDiscords();
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
                  Discord
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
                <DiscordTable
                  discordData={discordData}
                  updateParentData={updateData}
                />
                <CreateDiscord
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

export default Discord;
