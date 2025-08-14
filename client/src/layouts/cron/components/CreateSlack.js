import { useState } from "react";
import {
  Autocomplete,
  Chip,
  DialogContent,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from "@mui/material";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";

import { Formik } from "formik";

import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import MDDropDown from "components/MDDropDown";
import { createRateValidation } from "services/validation";
import { generateNumbers } from "services/service";
import moment from "moment";
import { useMaterialUIController } from "context";

const CreateRates = (props) => {
  const [age, setAge] = useState('');
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;

  const handleChange = (event) => {
    setAge(event.target.value);
  };
  const { dialogOpen, onClose } = props;
  const endDayObj = [
    { label: "Sunday" },
    { label: "Monday" },
    { label: "Tuesday" },
    { label: "Wednesday" },
    { label: "Thursday" },
    { label: "Friday" },
    { label: "Saturday" },
    { label: "Next Day" },
    { label: "Same Day" },
    { label: "Day after Tommorow" },
  ];
  return (
    <>
      <MDDialog
        dialogTitle="Create Cron"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              rate_type: [],
              validationType: "",
              display_name: "",
              hours: "",
              end_day: "",
              end_day_time: moment(
                `${moment("01-01-2023", "DD-MM-YYYY").format(
                  "YYYY-MM-DD"
                )}T${moment("11:00 AM", "hh:mm a").format("hh:mm")}`
              ),
              service_fee: "",
              tax: "",
              brand_payout: "",
              isbp_revenue: "",
            }}
            validationSchema={createRateValidation}
            onSubmit={(value, action) => {
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">Select Purpose</InputLabel>
                      <MDDropDown
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={age}
                        label="Select Purpose"
                        onChange={handleChange}
                      >
                        <MenuItem value={1}>Purpose 1</MenuItem>
                        <MenuItem value={1}>Purpose 2</MenuItem>
                        <MenuItem value={1}>Purpose 3</MenuItem>
                      </MDDropDown>
                    </FormControl>
                  </Grid>


                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      {/* <InputLabel id="demo-simple-select-helper-label">Auth Token</InputLabel> */}
                      <MDInput
                        size="small"
                        label="Channel Name"
                        fullWidth
                      />
                    </FormControl>

                  </Grid>
                  <Grid item xs={12}>
                  <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">Work Space</InputLabel>
                      <MDDropDown
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={age}
                        label="Select Purpose"
                        onChange={handleChange}
                      >
                        <MenuItem value={1}>Work 1</MenuItem>
                        <MenuItem value={1}>Work 2</MenuItem>
                        <MenuItem value={1}>Work 3</MenuItem>
                      </MDDropDown>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      {/* <InputLabel id="demo-simple-select-helper-label">Auth Token</InputLabel> */}
                      <MDInput
                        size="small"
                        label="Webhook URL"
                        fullWidth
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} className="text-right">
                    <MDButton color={sidenavColor}  variant="contained" type="submit">
                      Create
                    </MDButton>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default CreateRates;
