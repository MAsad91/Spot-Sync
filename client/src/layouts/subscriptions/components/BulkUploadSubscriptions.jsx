import { Fragment, useState } from "react";
import { DialogContent, Grid } from "@mui/material";
import MDButton from "components/MDButton";
import { useDispatch } from "react-redux";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import CircularIndeterminate from "components/MDLoading";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import "./style.css";
import { toCamelCase } from "global/functions";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MDBox from "components/MDBox";
import moment from "moment";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import MDInput from "components/MDInput";
import { createSubscription } from "store/slice/subscriptions/subscriptionSlice";
import { getSubscriptionsByPlaceId } from "store/slice/subscriptions/subscriptionSlice";

const steps = ["Upload File", "Table View", "Additional Details"];

const BulkUploadSubscriptions = (props) => {
  const dispatch = useDispatch();
  const { dialogOpen, onClose, placeId } = props;
  const [fileData, setFileData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingData, setExistingData] = useState([]);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [startDateObj, setStartDateObj] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endDateObj, setEndDateObj] = useState(null);
  const [message, setMessage] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handleOnClose = () => {
    setActiveStep(0);
    setMessage("");
    setFileData([]);
    setHeaders([]);
    setCheckedRows([]);
    setExistingData([]);
    onClose();
  };

  const handleGetBulkSubscription = () => {
    setIsLoading(true);
    dispatch(getSubscriptionsByPlaceId(placeId))
      .unwrap()
      .then((res) => {
        const success = res?.success;
        setIsLoading(false);
        if (success) {
          setExistingData(res?.subscriptions);
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

  const handleCreateBulkSubscription = (data) => {
    setIsLoading(true);
    const checkedData = data.filter((item) => item.checked === true);
    const modifiedData = checkedData.map((item) => {
      if (item.licensePlate) {
        const licensePlateArray = item.licensePlate
          .split(",")
          .map((plate) => plate.trim());
        return {
          ...item,
          startDate,
          endDate,
          message,
          amount: parseInt(item.amount),
          isApplyServiceFee: item.applyServiceFee === "TRUE" ? true : false,
          isApplyTax: item.applyServiceFee === "TRUE" ? true : false,
          isAutoRenew: item.applyServiceFee === "TRUE" ? true : false,
          licensePlate: licensePlateArray,
          isCustomSubscription: false,
        };
      } else {
        return item;
      }
    });
    dispatch(
      createSubscription({
        records: modifiedData,
        placeId,
        isCustomSubscription: false,
      })
    )
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
          dispatch(getSubscriptionsByPlaceId(placeId));
          handleOnClose();
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const checkedIndexes = [];
      const selectedColumns = [
        "First Name",
        "Last Name",
        "Email",
        "Mobile",
        "Amount",
        "License Plate ",
        "Auto Renew",
        "Apply Tax",
        "Apply Service Fee",
      ];
      const filteredData = excelData.map((row, rowIndex) => {
        const rowDataObject = {};
        row.forEach((cell, index) => {
          if (selectedColumns.includes(excelData[0][index])) {
            rowDataObject[excelData[0][index]] = cell;
          }
        });
        if (rowIndex !== 0) {
          const matchedLicensePlate = existingData?.find((item) => {
            return item?.customerId?.email === rowDataObject?.email;
          });
          if (matchedLicensePlate) {
            rowDataObject["checked"] = false;
          } else {
            checkedIndexes.push(rowIndex - 1);
            rowDataObject["checked"] = true;
          }
        }
        return rowDataObject;
      });
      setHeaders(selectedColumns);
      setCheckedRows(checkedIndexes);
      const dataWithoutHeaders = filteredData.slice(1);
      setFileData(dataWithoutHeaders);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCheckboxChange = (e, index) => {
    const isChecked = e.target.checked;
    const newCheckedRows = [...checkedRows];
    if (isChecked) {
      newCheckedRows.push(index);
      if (!fileData[index].checked) {
        setFileData((prevFileData) => {
          const updatedFileData = [...prevFileData];
          updatedFileData[index].checked = true;
          return updatedFileData;
        });
      }
    } else {
      const indexToRemove = newCheckedRows.indexOf(index);
      if (indexToRemove !== -1) {
        newCheckedRows.splice(indexToRemove, 1);
        setFileData((prevFileData) => {
          const updatedFileData = [...prevFileData];
          updatedFileData[index].checked = false;
          return updatedFileData;
        });
      }
    }

    setCheckedRows(newCheckedRows);
  };

  const parseCSVFile = (file) => {
    Papa.parse(file, {
      complete: (result) => {
        const data = result.data;
        const selectedHeaders = [
          "First Name",
          "Last Name",
          "Email",
          "Mobile",
          "Amount",
          "License Plate ",
          "Auto Renew",
          "Apply Tax",
          "Apply Service Fee",
        ];

        const checkedIndexes = [];
        const headersRow = data[0];
        const columnNames = Object.keys(headersRow);
        const headersFound = selectedHeaders.every((header) =>
          columnNames.includes(header)
        );

        if (headersFound) {
          setHeaders(selectedHeaders);
          const filteredData = data
            .filter((row) => Object.values(row).some((cell) => cell !== ""))
            .map((row, rowIndex) => {
              const rowDataObject = {};
              columnNames.forEach((header) => {
                if (selectedHeaders.includes(header)) {
                  rowDataObject[toCamelCase(header)] = row[header];
                }
              });

              const matchedLicensePlate = existingData?.find((item) => {
                return item?.customerId?.email === rowDataObject?.email;
              });
              if (matchedLicensePlate) {
                rowDataObject["checked"] = false;
              } else {
                checkedIndexes.push(rowIndex);
                rowDataObject["checked"] = true;
              }
              return rowDataObject;
            });

          setCheckedRows(checkedIndexes);
          setFileData(filteredData);
        } else {
          setNotification({
            ...notification,
            color: "error",
            icon: "warning",
            title: "Error",
            content: "Required headers are missing in the file.",
            show: true,
          });
        }
      },
      header: true,
    });
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleCreateBulkSubscription(fileData);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Creating Subscription.. "
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
        dialogTitle="Create Subscription"
        open={dialogOpen}
        dialogClose={handleOnClose}
        closeIcon={true}
        maxWidth="xl"
      >
        <DialogContent>
          <div>
            <MDBox sx={{ width: "100%" }}>
              <Stepper activeStep={activeStep}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              {activeStep === steps.length ? (
                <Fragment>
                  <Typography sx={{ mt: 2, mb: 1 }}>
                    All steps completed - you&apos;re finished
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                    <Box sx={{ flex: "1 1 auto" }} />
                    <Button onClick={handleReset}>Reset</Button>
                  </Box>
                </Fragment>
              ) : (
                <Fragment>
                  <Typography sx={{ mt: 2, mb: 1 }}>
                    {activeStep === 0 && (
                      <MDBox
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center  "
                      >
                        <h2>Upload File</h2>
                        <label
                          htmlFor="file-upload"
                          className="custom-upload-button"
                          onClick={() => handleGetBulkSubscription()}
                        >
                          Choose File
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".csv"
                          onChange={(e) => {
                            const file = e?.target?.files?.[0];
                            if (!file) return;
                            const extension = file.name.split(".").pop();
                            if (extension === "csv") {
                              parseCSVFile(file);
                              setActiveStep(activeStep + 1);
                            } else {
                              handleFileUpload(e);
                            }
                          }}
                          style={{ display: "none" }}
                        />
                      </MDBox>
                    )}
                    {activeStep === 1 && (
                      <>
                        <table className="custom-table">
                          <thead>
                            <tr>
                              {headers.map((header, index) => (
                                <th key={index}>{header}</th>
                              ))}
                              <th>Select</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fileData.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {headers.map((header, headerIndex) => (
                                  <td key={headerIndex}>
                                    {row[toCamelCase(header)]}
                                  </td>
                                ))}
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={row?.checked}
                                    onChange={(e) =>
                                      handleCheckboxChange(e, rowIndex)
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                    {activeStep === 2 && (
                      <>
                        <Grid container spacing={2}>
                          <Grid
                            item
                            xs={12}
                            md={6}
                            onClick={() => setStartDatePickerOpen(true)}
                          >
                            <DesktopDatePicker
                              name="startDateObj"
                              label="Start Date"
                              value={startDateObj}
                              onChange={(value) => {
                                setStartDateObj(value);
                                setStartDate(
                                  moment(value)
                                    .startOf("day")
                                    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
                                );
                              }}
                              open={startDatePickerOpen}
                              onClose={() => setStartDatePickerOpen(false)}
                              sx={{ width: "100%", mb: 1 }}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            md={6}
                            onClick={() => setEndDatePickerOpen(true)}
                          >
                            <DesktopDatePicker
                              name="endDateObj"
                              label="End Date"
                              value={endDateObj}
                              onChange={(value) => {
                                setEndDateObj(value);
                                setEndDate(
                                  moment(value)
                                    .endOf("day")
                                    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
                                );
                              }}
                              open={endDatePickerOpen}
                              onClose={() => setEndDatePickerOpen(false)}
                              sx={{ width: "100%", mb: 1 }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <MDInput
                              label="Message"
                              name="message"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                    <Button
                      variant="outlined"
                      style={{
                        display: "block",
                        background: "#2589f5",
                        marginTop: "3px",
                        float: "right",
                      }}
                      size="small"
                      disabled={
                        activeStep === 0 ||
                        (activeStep === 1 && fileData.length > 0)
                      }
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Back
                    </Button>
                    <Box sx={{ flex: "1 1 auto" }} />
                    <MDButton
                      variant="outlined"
                      style={{
                        display: "block",
                        background: "#2589f5",
                        marginTop: "3px",
                        float: "right",
                      }}
                      size="small"
                      onClick={handleNext}
                      disabled={
                        (activeStep === 0 && fileData.length === 0) ||
                        (activeStep === steps.length - 1 &&
                          (!startDate || !endDate || !message))
                      }
                    >
                      {activeStep === steps.length - 1 ? "Submit" : "Next"}
                    </MDButton>
                  </Box>
                </Fragment>
              )}
            </MDBox>
          </div>
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default BulkUploadSubscriptions;

// {isLastStep && (
//   <Formik
//     initialValues={{
//       startDate: "",
//       startDateObj: null,
//       endDate: "",
//       endDateObj: null,
//       message: "",
//     }}
//     // validationSchema={createSlackValidation}
//     onSubmit={(value, action) => {
//       console.log("values", value);
//     }}
//   >
//     {(props) => (
//       <form onSubmit={props.handleSubmit}>
//         <Grid container spacing={2}>
//           <Grid
//             item
//             xs={12}
//             md={6}
//             onClick={() => setStartDatePickerOpen(true)}
//           >
//             <DesktopDatePicker
//               name="startDateObj"
//               label="Start Date"
//               value={props.values?.startDateObj}
//               onChange={(value) => {
//                 props.setFieldValue("startDateObj", value);
//                 props.setFieldValue(
//                   "startDate",
//                   moment(value)
//                     .startOf("day")
//                     .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
//                 );
//               }}
//               onBlur={props.handleBlur}
//               open={startDatePickerOpen}
//               onClose={() => setStartDatePickerOpen(false)}
//               sx={{ width: "100%", mb: 1 }}
//               error={
//                 props.errors.startDateObj &&
//                 props.touched.startDateObj
//                   ? true
//                   : false
//               }
//               success={
//                 props.errors.startDateObj &&
//                 props.touched.startDateObj
//                   ? false
//                   : true
//               }
//               helperText={
//                 props.errors.startDateObj &&
//                 props.touched.startDateObj
//                   ? props.errors.startDateObj
//                   : null
//               }
//             />
//           </Grid>
//           <Grid
//             item
//             xs={12}
//             md={6}
//             onClick={() => setEndDatePickerOpen(true)}
//           >
//             <DesktopDatePicker
//               name="endDateObj"
//               label="End Date"
//               value={props.values?.endDateObj}
//               onChange={(value) => {
//                 props.setFieldValue("endDateObj", value);
//                 props.setFieldValue(
//                   "endDate",
//                   moment(value)
//                     .endOf("day")
//                     .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
//                 );
//               }}
//               onBlur={props.handleBlur}
//               open={endDatePickerOpen}
//               onClose={() => setEndDatePickerOpen(false)}
//               sx={{ width: "100%", mb: 1 }}
//               error={
//                 props.errors.endDateObj && props.touched.endDateObj
//                   ? true
//                   : false
//               }
//               success={
//                 props.errors.endDateObj && props.touched.endDateObj
//                   ? false
//                   : true
//               }
//               helperText={
//                 props.errors.endDateObj && props.touched.endDateObj
//                   ? props.errors.endDateObj
//                   : null
//               }
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <RichTextEditor
//               name="message"
//               value={props.values.message}
//               setFieldValue={props.setFieldValue}
//               error={props.errors.message}
//               helperText={props.errors.message}
//             />
//           </Grid>
//         </Grid>
//       </form>
//     )}
//   </Formik>
// )}

// dispatch(createBulkSubscription({ records: checkedData, placeId }))
//   .unwrap()
//   .then((res) => {
//     const success = res?.success;
//     setIsLoading(false);
//     setNotification({
//       ...notification,
//       color: success ? "success" : "error",
//       title: success ? "Success" : "Error",
//       content: res?.message,
//       icon: success ? "check" : "warning",
//       show: true,
//     });
//     if (success) {
//       updateParentData();
//       handleOnClose();
//     }
//   })
//   .catch((err) => {
//     setIsLoading(false);
//     setNotification({
//       ...notification,
//       color: "error",
//       title: "Error",
//       content: err?.message,
//       icon: "warning",
//       show: true,
//     });
//   });

// const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
// const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
// const [isLastStep, setIsLastStep] = useState(false);

// import { createBulkSubscription } from "store/slice/subscriptions/subscriptionSlice";
// import RichTextEditor from "components/UIComponents/RichTextEditor/RichTextEditor";
// import moment from "moment";
// import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
// import { Formik } from "formik";
