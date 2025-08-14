import { Autocomplete, Chip, DialogContent, Grid } from "@mui/material";

import { Formik } from "formik";

import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import MDInput from "components/MDInput";
import GooglePlacePicker from "components/MDPlacePicker/GooglePlacePicker";

import { createPlaceValidationSchema } from "services/validation";
import { useMaterialUIController } from "context";
import { useState } from "react";
import { createPlace } from "store/slice/places/placeSlice";
import { useDispatch } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import { getPlaces } from "store/slice/places/placeSlice";

const CreatePlace = (props) => {
  const dispatch = useDispatch();
  const { dialogOpen, onClose, brandList } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handleCreatePlace = (placeData) => {
    setIsLoading(true);
    dispatch(createPlace(placeData))
      .unwrap()
      .then(async (res) => {
        console.log("place creation response:", res);
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
          console.log("res=>");
          await dispatch(getPlaces());
          onClose();
        }
      })
      .catch((err) => {
        console.error("Error creating place:", err);
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
        text="Creating Place "
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
        dialogTitle="Create New Place"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              google: { formatted_address: "" },
              parkingCode: "",
              spaces: null,
              statementDescriptor: "",
              lotName: "",
              brandId: null,
            }}
            validationSchema={createPlaceValidationSchema}
            onSubmit={(value, action) => {
              console.log("values", value);
              handleCreatePlace(value);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={brandList || []}
                      disableClearable={false}
                      getOptionLabel={(option) => `${option?.shortBrandName}`}
                      value={
                        brandList.find(
                          (brand) => brand._id === props.values.brandId
                        ) || null
                      }
                      onChange={(e, value) =>
                        props.setFieldValue("brandId", value?._id || "")
                      }
                      renderTags={(value, getTagProps) => (
                        <Chip
                          key={value?._id}
                          variant="contained"
                          label={value?.firstName}
                          {...getTagProps({ index: 0 })}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div>
                            <strong>{`${option?.shortBrandName} `}</strong>
                            <br />
                            <span style={{ color: "#888" }}>
                              {option?.brandName}
                            </span>
                          </div>
                        </li>
                      )}
                      renderInput={(params) => (
                        <MDInput
                          {...params}
                          label="Select Brand"
                          error={
                            props.errors.brandId && props.touched.brandId
                              ? true
                              : false
                          }
                          helperText={
                            props.errors.brandId && props.touched.brandId
                              ? props.errors.brandId
                              : null
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="parkingCode"
                      value={props.values.parkingCode}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Parking Code"
                      error={
                        props.errors.parkingCode && props.touched.parkingCode
                          ? true
                          : false
                      }
                      success={
                        props.errors.parkingCode && props.touched.parkingCode
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.parkingCode && props.touched.parkingCode
                          ? props.errors.parkingCode
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <GooglePlacePicker
                      label="Address"
                      name="google"
                      values={props.values?.google?.formatted_address}
                      errors={props.errors}
                      touched={props.touched}
                      setFieldValue={props.setFieldValue}
                      handleBlur={props.handleBlur}
                      handleChange={props.handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="lotName"
                      value={props.values.lotName}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Lot Name"
                      error={
                        props.errors.lotName && props.touched.lotName
                          ? true
                          : false
                      }
                      success={
                        props.errors.lotName && props.touched.lotName
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.lotName && props.touched.lotName
                          ? props.errors.lotName
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="spaces"
                      type="number"
                      value={props.values.spaces}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Number of spaces"
                      error={
                        props.errors.spaces && props.touched.spaces
                          ? true
                          : false
                      }
                      success={
                        props.errors.spaces && props.touched.spaces
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.spaces && props.touched.spaces
                          ? props.errors.spaces
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      name="statementDescriptor"
                      value={props.values.statementDescriptor}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Statement Descriptor"
                      error={
                        props.errors.statementDescriptor &&
                        props.touched.statementDescriptor
                          ? true
                          : false
                      }
                      success={
                        props.errors.statementDescriptor &&
                        props.touched.statementDescriptor
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.statementDescriptor &&
                        props.touched.statementDescriptor
                          ? props.errors.statementDescriptor
                          : null
                      }
                    />
                  </Grid>

                  <Grid item xs={12} className="text-right">
                    <MDButton
                      color={sidenavColor}
                      variant="gradient"
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

export default CreatePlace;
