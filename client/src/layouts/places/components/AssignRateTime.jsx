import { Chip, DialogContent, Grid } from "@mui/material";

import { Formik } from "formik";

import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";

import { createPlaceValidationSchema } from "services/validation";
import MDBox from "components/MDBox";
import { map } from "lodash";

const AssignRateTime = (props) => {
  const { dialogOpen, onClose } = props;

  const rateTypeList = [
    {
      label: "Slack",
    },
    {
      label: "Ballpare",
    },
    {
      label: "SMS Number",
    },
    {
      label: "Flow Type",
    },
    {
      label: "Payment Gateway",
    },
    {
      label: "Default Message",
    },
  ];
  return (
    <>
      <MDDialog
        dialogTitle="Setting"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              address: "",
              parking_code: "",
              number_of_spaces: "",
            }}
            validationSchema={createPlaceValidationSchema}
            onSubmit={(value, action) => {
              console.log("values", value);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <MDBox className="d-flex align-items-center justify-content-around gap-2 flex-wrap">
                      {map(rateTypeList, (item, index) => (
                        <Chip
                          key={index}
                          label={item.label}
                          variant="outlined"
                          clickable
                        />
                      ))}
                    </MDBox>
                  </Grid>

                  <Grid item xs={12}>
                    <MDInput
                      name="parking_code"
                      value={props.values.parking_code}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Parking Code"
                      error={
                        props.errors.parking_code && props.touched.parking_code
                          ? true
                          : false
                      }
                      success={
                        props.errors.parking_code && props.touched.parking_code
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.parking_code && props.touched.parking_code
                          ? props.errors.parking_code
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      name="number_of_spaces"
                      value={props.values.number_of_spaces}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Number of spaces"
                      error={
                        props.errors.number_of_spaces &&
                        props.touched.number_of_spaces
                          ? true
                          : false
                      }
                      success={
                        props.errors.number_of_spaces &&
                        props.touched.number_of_spaces
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.number_of_spaces &&
                        props.touched.number_of_spaces
                          ? props.errors.number_of_spaces
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} className="text-right">
                    <MDButton variant="gradient" color="info" type="submit">
                      Save
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

export default AssignRateTime;
