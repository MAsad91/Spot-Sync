import { useState } from "react";
import { Autocomplete, DialogContent, Grid, FormControl } from "@mui/material";
import * as Yup from "yup";
import { Formik } from "formik";
import { DateRangePicker } from "rsuite";
import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import moment from "moment";
import { useMaterialUIController } from "context";
import { useDispatch } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import { createValidation } from "store/slice/validation/validationSlice";

const CreateValidation = (props) => {
  const [controller] = useMaterialUIController();
  const dispatch = useDispatch();
  const { sidenavColor } = controller;
  const { dialogOpen, onClose, rateData, placeId, updateParentData } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const createValidationSchema = Yup.object().shape({
    validationCode: Yup.string().required().label("Validation code"),
    quantity: Yup.string().required().label("Quantity"),
    discount: Yup.number().min(0, "Discount must be at least 0").max(100, "Discount must be at most 100").required().label("Discount"),
    validFrom: Yup.string().required().label("Valid From"),
    validUntil: Yup.string().required().label("Valid Until"),
    rateId: Yup.string().required().label("Rate"),
  });

  const handleCreateValidation = (data) => {
    setIsLoading(true);
    dispatch(createValidation(data))
      .unwrap()
      .then((res) => {
        const success = res?.success;
        setIsLoading(false);
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        if (success) {
          updateParentData();
          onClose();
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setNotification({
          ...notification,
          color: "error",
          title: "Error",
          content: err?.message,
          icon: "warning",
          show: true,
        });
      });
  };

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Creating Validation "
        open={isLoading}
      />
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />
      <MDDialog
        dialogTitle="Create Validation"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              placeId: placeId,
              rateId: "",
              validFrom: "",
              validUntil: "",
              quantity: null,
              discount: null,
              validationCode: "",
            }}
            validationSchema={createValidationSchema}
            onSubmit={(value, action) => {
              handleCreateValidation(value);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <Autocomplete
                      options={rateData}
                      getOptionLabel={(option) =>
                        `${option.displayName} ${
                          option.title ? `(${option.title})` : ""
                        }`
                      }
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div>{option.displayName}</div>
                        </li>
                      )}
                      name="rateId"
                      autoHighlight
                      disableClearable
                      size="small"
                      value={
                        rateData.find(
                          (option) => option._id === props.values.rateId
                        ) || null
                      }
                      getOptionSelected={(option, value) =>
                        option._id === value._id
                      }
                      onChange={(event, value) => {
                        props.setFieldValue("rateId", value ? value._id : "");
                      }}
                      renderInput={(params) => (
                        <MDInput
                          label="Select Rate"
                          fullWidth
                          inputProps={{
                            ...params.inputProps,
                            autoComplete: "new-password",
                          }}
                          value={
                            props.values.rateId
                              ? rateData.find(
                                  (option) => option._id === props.values.rateId
                                )?.title
                              : ""
                          }
                          {...params}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <MDInput
                      name="validationCode"
                      value={props.values.validationCode}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Validation code"
                      error={
                        props.errors.validationCode &&
                        props.touched.validationCode
                          ? true
                          : false
                      }
                      success={
                        props.errors.validationCode &&
                        props.touched.validationCode
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.validationCode &&
                        props.touched.validationCode
                          ? props.errors.validationCode
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={12} lg={12}>
                    <FormControl fullWidth>
                      <DateRangePicker
                        id="dateDuration"
                        placeholder="Valid From - Valid Until"
                        character=" - "
                        size="lg"
                        format="dd-MM-yyyy"
                        showMeridian
                        value={
                          props.values.validFrom && props.values.validUntil
                            ? [
                                new Date(props.values.validFrom),
                                new Date(props.values.validUntil),
                              ]
                            : undefined
                        }
                        ranges={[]}
                        onChange={(value) => {
                          if (value && value.length === 2) {
                            props.setFieldValue(
                              "validFrom",
                              moment(value[0]).startOf("day").utc().format()
                            );
                            props.setFieldValue(
                              "validUntil",
                              moment(value[1]).endOf("day").utc().format()
                            );
                          } else {
                            props.setFieldValue("validFrom", null);
                            props.setFieldValue("validUntil", null);
                          }
                        }}
                        onBlur={props.handleBlur}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <MDInput
                      name="quantity"
                      value={props.values.quantity}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Number Of Codes / Quantity"
                      error={
                        props.errors.quantity && props.touched.quantity
                          ? true
                          : false
                      }
                      success={
                        props.errors.quantity && props.touched.quantity
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.quantity && props.touched.quantity
                          ? props.errors.quantity
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      name="discount"
                      value={props.values.discount}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Discount In Percentage"
                      error={
                        props.errors.discount && props.touched.discount
                          ? true
                          : false
                      }
                      success={
                        props.errors.discount && props.touched.discount
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.discount && props.touched.discount
                          ? props.errors.discount
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} className="text-right">
                    <MDButton
                      color={sidenavColor}
                      variant="contained"
                      type="submit"
                    >
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

export default CreateValidation;
