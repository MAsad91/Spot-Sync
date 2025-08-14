import {
  DialogContent,
  Grid,
  Collapse,
  Stack,
  Divider,
  IconButton,
  FormControl,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { DateRangePicker } from "rsuite";
import { TransitionGroup } from "react-transition-group";
import { FieldArray, Formik } from "formik";
import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import MDDropDown from "components/MDDropDown";
import MDInput from "components/MDInput";
import { useMaterialUIController } from "context";
import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import CircularIndeterminate from "components/MDLoading";
import MDBox from "components/MDBox";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined"
import { createPermit } from "store/slice/permits/permitSlice";
import { getPermitsByPlaceId } from "store/slice/permits/permitSlice";
import { CreatePermitSchema } from "services/validation";
import { getPermitStatistics } from "store/slice/permits/permitSlice";
import ReactPhoneInput from 'react-phone-input-material-ui';

const { beforeToday} = DateRangePicker;

const CreatePermits = (props) => {
  const formikRef = useRef(null);
  const { 
    dialogOpen, 
    onClose, 
    placeId, 
    startDate,
    endDate,
    search,
    tz,
    activeTab, 
  } = props;
  const dispatch = useDispatch();
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
  const permitsOptions = useSelector((state) => state.permitsOptions?.permitsOptions);
  const [selectedPermitOption, setSelectedPermitOption] = useState(permitsOptions? permitsOptions[0] : null);

  useEffect(() => {
    if (permitsOptions && permitsOptions.length > 0) {
      setSelectedPermitOption(permitsOptions[0]);

      formikRef?.current?.setFieldValue(
        "selectedPermitOption",
        permitsOptions[0]
      );
    }
  }, [permitsOptions]);

  const handleCreatePermits = async (permitData) => {
    try {
      setIsLoading(true);
      const res = await dispatch(createPermit(permitData)).unwrap();
      const success = res?.success;
      setNotification({
        ...notification,
        color: success ? "success" : "error",
        title: success ? "Success" : "Error",
        content: res?.message || "An unexpected error occurred.",
        icon: success ? "check" : "warning",
        show: true,
      });
      if (success) {
        const payload = {
          tz,
          pageNo: 0,
          status: activeTab,
          placeId,
          search: search,
          startDate,
          endDate,
        };
        await dispatch(getPermitsByPlaceId(payload));
        await dispatch(getPermitStatistics(placeId))
        onClose();
      }
    } catch (err) {
      console.error("Error creating permit:", err);
      setNotification({
        ...notification,
        color: "error",
        title: "Error",
        content: err?.message || "An error occurred while creating permit.",
        icon: "warning",
        show: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (index) => {
    let licensePlateArray = formikRef.current.values.licensePlate;
    licensePlateArray.splice(index, 1);
  };

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text={"Please wait..!"}
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
        dialogTitle="Permit"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            innerRef={formikRef}
            initialValues={{
              placeId: null,
              selectedPermitOption: selectedPermitOption,
              customRate: null,
              internalId: "",
              assignedName: "",
              phoneNo: "",
              email: "",
              startDate: null,
              endDate: null,
              licensePlate: [""],
              vehicleMake: "",
              vehicleModel: "",
              vehicleState: "",
            }}

            validationSchema={CreatePermitSchema}
            onSubmit={(value, action) => {
              const payload = {
                placeId,
                internalId: value?.internalId,
                assignedName: value?.assignedName,
                phoneNo: value?.phoneNo,
                email: value?.email,
                startDate: moment(value.startDate).format(),
                endDate: moment(value.endDate).format(),
                licensePlate: value?.licensePlate,
                status: "active",
                rateId: value.customRate,
                permitType: value.selectedPermitOption?.type,
                vehicleMake: value?.vehicleMake,
                vehicleModel: value?.vehicleModel,
                vehicleState: value?.vehicleState,
              };
              handleCreatePermits(payload);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="permit-type-select-label">
                        Type
                      </InputLabel>
                      <MDDropDown
                        labelId="permit-type-select-label"
                        id="permit-type-select"
                        label="Type"
                        name="permitType"
                        value={props.values.selectedPermitOption}
                        onChange={(event, newValue) => {
                          props.setValues({
                            ...props?.values,
                            selectedPermitOption: newValue.props.value,
                            customRate: null,
                          });
                        }}
                        onBlur={props.handleBlur}
                      >
                        {
                          permitsOptions.map((item) => (
                            <MenuItem key={item.type} value={item}>
                              {item.type}
                            </MenuItem>
                          ))
                        }
                      </MDDropDown>
                    </FormControl>
                  </Grid>

                  {props.values.selectedPermitOption?.customRates &&
                    props.values.selectedPermitOption?.customRates.length > 0 && (
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="permit-custom-rate-name-select-label">
                          Custom Rate
                        </InputLabel>
                        <MDDropDown
                          labelId="permit-custom-rate-name-select-label"
                          id="permit-custom-rate-name-select"
                          label="Custom Rate"
                          name="customRate"
                          value={props.values.customRate}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          error={
                            props.errors.customRate &&
                              props.touched.customRate
                              ? true
                              : false
                          }
                          success={
                            props.errors.customRate &&
                              props.touched.customRate
                              ? false
                              : true
                          }
                          helperText={
                            props.errors.customRate &&
                              props.touched.customRate
                              ? props.errors.customRate
                              : null
                          }
                        >
                          {
                            props.values.selectedPermitOption.customRates.map((item) => (
                              <MenuItem key={item} value={item}>
                                {item.displayName}
                              </MenuItem>
                            ))
                          }
                        </MDDropDown>
                      </FormControl>
                    </Grid>
                  )}

                  {props.values.selectedPermitOption?.displayUnitNumber &&
                    <Grid item xs={12}>
                      <MDInput
                        name="internalId"
                        value={props.values.internalId}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        label="Unit Number"
                        error={!!props.errors.internalId && props.touched.internalId}
                        success={!(props.errors.internalId && props.touched.internalId)}
                        helperText={props.errors.internalId && props.touched.internalId ? props.errors.internalId : ''}

                      />
                    </Grid>
                  }

                  <Grid item xs={12}>
                    <MDInput
                      name="assignedName"
                      value={props.values.assignedName}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Assigned Name (Optional)"
                      error={!!props.errors.assignedName && props.touched.assignedName}
                      success={!(props.errors.assignedName && props.touched.assignedName)}
                      helperText={props.errors.assignedName && props.touched.assignedName ? props.errors.assignedName : ''}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ReactPhoneInput
                      value={props.values.phoneNo}
                      onChange={value => props.setValues({ ...props.values, phoneNo: "+" + value })}
                      onBlur={props.handleBlur}
                      label="Phone Number"
                      inputProps={{
                        name: "phoneNo",
                        error: !!props.errors.phoneNo,
                        success: !props.errors.phoneNo,
                        helperText: props.errors.phoneNo
                      }}
                      component={MDInput}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      name="email"
                      value={props.values.email}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Email"
                      error={!!props.errors.email && props.touched.email}
                      success={!(props.errors.email && props.touched.email)}
                      helperText={props.errors.email && props.touched.email ? props.errors.email : ''}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FieldArray name="licensePlate">
                          {({ remove, push }) => (
                            <MDBox className="pt-2">
                              <TransitionGroup component="div" appear>
                                {props?.values?.licensePlate.map((licensePlate, index) => (
                                  <Collapse key={index}>
                                    <MDBox>
                                      {index !== 0 && (
                                        <MDBox mt={1}>
                                          <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
                                            <Divider orientation="horizontal" flexItem light sx={{ width: `calc(100% - 40px)`, margin: "auto 0 !important" }} />
                                            {props.values.licensePlate.length > 1 && (
                                              <IconButton color="error" size="small" onClick={() => {
                                                remove(index);
                                                handleRemove(index);
                                              }}>
                                                <ClearOutlinedIcon />
                                              </IconButton>
                                            )}
                                          </Stack>
                                        </MDBox>
                                      )}
                                      <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                          <MDInput
                                            label="License Plate"
                                            name={`licensePlate.${index}`}
                                            value={licensePlate}
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                            error={!!props.errors.licensePlate?.[index]}
                                            success={!(props.errors.licensePlate?.[index] && props.touched.licensePlate?.[index])}
                                            helperText={props.errors.licensePlate?.[index] || ''}
                                          />
                                        </Grid>
                                      </Grid>
                                    </MDBox>
                                  </Collapse>
                                ))}
                              </TransitionGroup>
                              {/* <MDBox sx={{ mr: 2, mt: 3, mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                <MDButton
                                  variant="contained"
                                  color={sidenavColor}
                                  onClick={() => push("")}
                                >
                                  +
                                </MDButton>
                              </MDBox> */}
                            </MDBox>
                          )}
                        </FieldArray>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      name="vehicleMake"
                      value={props.values.vehicleMake}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Vehicle Make"
                      error={!!props.errors.vehicleMake && props.touched.vehicleMake}
                      success={!(props.errors.vehicleMake && props.touched.vehicleMake)}
                      helperText={props.errors.vehicleMake && props.touched.vehicleMake ? props.errors.vehicleMake : ''}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      name="vehicleModel"
                      value={props.values.vehicleModel}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Vehicle Model"
                      error={!!props.errors.vehicleModel && props.touched.vehicleModel}
                      success={!(props.errors.vehicleModel && props.touched.vehicleModel)}
                      helperText={props.errors.vehicleModel && props.touched.vehicleModel ? props.errors.vehicleModel : ''}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      name="vehicleState"
                      value={props.values.vehicleState}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Vehicle State"
                      error={!!props.errors.vehicleState && props.touched.vehicleState}
                      success={!(props.errors.vehicleState && props.touched.vehicleState)}
                      helperText={props.errors.vehicleState && props.touched.vehicleState ? props.errors.vehicleState : ''}
                    />
                  </Grid>
                  <Grid item xs={12} md={12} lg={12}>
                    <FormControl fullWidth>
                      <DateRangePicker
                        id="dateDuration"
                        placeholder="Permit Start Date - Permit End Date"
                        character=" - "
                        size="lg"
                        format="MM-dd-yyyy"
                        showMeridian
                        block
                        placement="top"
                        shouldDisableDate={beforeToday()}
                        value={
                          props.values.startDate && props.values.endDate
                            ? [
                              new Date(props.values.startDate),
                              new Date(props.values.endDate),
                            ]
                            : undefined
                        }
                        ranges={[]}
                        onChange={(value) => {
                          if (value && value.length === 2) {
                            props.setFieldValue(
                              "startDate",
                              moment(value[0]).format()
                            );
                            props.setFieldValue(
                              "endDate",
                              moment(value[1]).format()
                            );
                          } else {
                            props.setFieldValue("startDate", null);
                            props.setFieldValue("endDate", null);
                          }
                        }}
                        onBlur={props.handleBlur}
                      />
                    </FormControl>

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

export default CreatePermits;
