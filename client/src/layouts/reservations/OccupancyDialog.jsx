import React from "react";
import MDDialog from "components/MDDialog";
import { DialogContent, Grid, Box, Typography } from "@mui/material";

import CarRed from "assets/images/cars/CarRed.svg";
import CarYellow from "assets/images/cars/CarYellow.svg";
import CarGreen from "assets/images/cars/CarOrange.svg";
import CarBlue from "assets/images/cars/CarWhite.svg";
import EmptySlot from "assets/images/cars/empty.svg";
import AccessibleIcon from "@mui/icons-material/Accessible";

const OccupancyDialog = (props) => {
  const { dialogOpen, onClose, data } = props;
  const { numberOfSpaces, occupancy } = data;

  const carImages = [CarRed, CarYellow, CarGreen, CarBlue];
  const parkingSpots = Array.from({ length: numberOfSpaces }, (_, index) => ({
    id: `Spot ${index + 1}`,
    occupied: index < occupancy,
    accessible: (index + 1) % 10 === 0,
    carImage: carImages[index % carImages.length],
  }));

  return (
    <MDDialog
      dialogTitle="Parking Lot Occupancy"
      open={dialogOpen}
      dialogClose={onClose}
      closeIcon={true}
      maxWidth="100%"
      fullScreen={true}
      borderRadius={false}
    >
      <DialogContent>
        <Box sx={{ p: 3, textAlign: "center", overflowX: "hidden" }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={5}>
              <Grid container spacing={2}>
                {parkingSpots.slice(0, numberOfSpaces / 2).map((spot) => (
                  <Grid item key={spot.id} xs={6} sm={4} md={4}>
                    <Box
                      sx={{
                        height: 80,
                        width: 120,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 2,
                        bgcolor: spot.occupied ? "#fff" : "grey.200",
                        position: "relative",
                        textAlign: "center",
                        border: "2px dashed #ccc",
                        overflow: "hidden",
                      }}
                    >
                      {spot.occupied ? (
                        <img
                          src={spot.carImage}
                          alt="Car"
                          style={{
                            width: "auto",
                            height: "60px",
                            transform: "rotate(90deg)",
                          }}
                        />
                      ) : spot.accessible ? (
                        <AccessibleIcon fontSize="large" />
                      ) : (
                        <img
                          src={EmptySlot}
                          alt="Empty Slot"
                          style={{
                            width: "30px",
                            height: "30px",
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} md={2}>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  border: "4px dashed grey",
                  padding: "10px",
                  bgcolor: "grey.200",
                }}
              >
                <Typography variant="h5" sx={{ color: "white" }}>
                  {`Occupancy ${occupancy || 0}/${numberOfSpaces || 0}`}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Grid container spacing={2}>
                {parkingSpots.slice(numberOfSpaces / 2).map((spot) => (
                  <Grid item key={spot.id} xs={6} sm={4} md={4}>
                    <Box
                      sx={{
                        height: 80,
                        width: 120,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 2,
                        bgcolor: spot.occupied ? "#fff" : "grey.200",
                        position: "relative",
                        textAlign: "center",
                        border: "2px dashed #ccc",
                        overflow: "hidden",
                      }}
                    >
                      {spot.occupied ? (
                        <img
                          src={spot.carImage}
                          alt="Car"
                          style={{
                            width: "auto",
                            height: "60px",
                            transform: "rotate(90deg)",
                          }}
                        />
                      ) : spot.accessible ? (
                        <AccessibleIcon fontSize="large" />
                      ) : (
                        <img
                          src={EmptySlot}
                          alt="Empty Slot"
                          style={{
                            width: "30px",
                            height: "30px",
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </MDDialog>
  );
};

export default OccupancyDialog;
