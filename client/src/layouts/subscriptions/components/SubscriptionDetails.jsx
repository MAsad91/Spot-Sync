/** @format */

import React, { useEffect, useState } from "react";
import MDDialog from "components/MDDialog";
import { get, isEmpty, map } from "lodash";
import { DialogContent, Icon, IconButton, Tooltip } from "@mui/material";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import NoDataOverlay from "../../../components/Common/NoDataOverlay";
import CMCardHeader from "../../../components/UIComponents/Cards/CMCardHeader";
import SubscriptionDetailBox, {
  SubscriptionDetailTitle,
  SubscriptionDetailValue,
} from "./SubscriptionDetailBox";
import DetailCardSkeleton from "./DetailCardSkeleton";
import { getSubscriptionDetail } from "store/slice/subscriptions/subscriptionSlice";
import { getSubscriptionDuration } from "global/functions";
import { amountToShow } from "global/functions";
import { capitalizeFirstLetter } from "global/functions";
import MDBox from "components/MDBox";
import { getTimezoneName } from "global/functions";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import RefundDialog from "./RefundDialog";
import LicensePlateEditDialog from "./EditLicensePlateDialog";
import MDSnackbar from "components/MDSnackbar";


const SubscriptionDetail = (props) => {
  const { dialogOpen, onClose, subscriptionId } = props;
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;

  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [issueRefundData, setIssueRefundData] = useState("");
  const [fullRefund, setFullRefund] = useState(false);

  const [editLicensePlate, setEditLicensePlate] = useState(false);
  const [licensePlateRowData, setLicensePlateRowData] = useState({});

  const [placeData, setPlaceData] = useState({});
  const [externalKeys, setExternalKeys] = useState([]);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => {
      setNotification({ ...notification, show: false });
    },
  });
  const isLoading = useSelector((state) => state.subscriptions.loading);
  const SubscriptionDetail = useSelector(
    (state) => state.subscriptions.subscriptionDetail
  );
  const [emptyData, setEmptyData] = useState(false);
  useEffect(() => {
    dispatch(getSubscriptionDetail(subscriptionId))
      .unwrap()
      .then((result) => {
        if (get(result, "success", false)) {
          if (isEmpty(get(result, "data", {}))) {
            setEmptyData(true);
          } else {
            setEmptyData(false);
          }
        } else {
          setEmptyData(true);
        }
      })
      .catch((err) => {
        throw err;
      });
  }, [dispatch, subscriptionId]);

  const licensePlateColumnsData = [
    {
      field: "licensePlateNumber",
      headerName: "License Plate Number",
      width: 250,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.licensePlateNumber || "-"} ${
            row.status === 3 ? "( Refunded )" : ""
          }`}
        </MDTypography>
      ),
    },
    {
      field: "assignName",
      headerName: "Assign Name",
      width: 250,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.assignName || "-"}`}
        </MDTypography>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 250,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` $${amountToShow(row.price)}`}
        </MDTypography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,

      renderCell: ({ row }) => (
        <Tooltip title="Edit" placement="top">
          <IconButton
            color="success"
            onClick={() => {
              setLicensePlateRowData(row);
              setEditLicensePlate(true);
            }}
          >
            <Icon fontSize="small">edit</Icon>
          </IconButton>
        </Tooltip>
      ),
    },
  ];
  const getRowClassName = (params) => {
    return params.row.status === 3 ? "disabledRow" : "";
  };

  const handelDownload = ({ receiptURL }) => {
    if (receiptURL && receiptURL !== false) {
      window.open(receiptURL, "_blank");
    }
  };

  const licensePlateArray = get(SubscriptionDetail, "licensePlate", []).filter(
    (obj) => obj.status === 10
  );

  return (
    <>
      <MDDialog
        dialogTitle="Subscription Details"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="xl"
        fullScreen={true}
        borderRadius={false}
      >
        <DialogContent>
          <Card>
            <CardContent className="w-100 h-100">
              {isLoading ? (
                <DetailCardSkeleton
                  disableHeaderButton={true}
                  skeletons={3}
                  cardProps={{ variant: "outlined" }}
                />
              ) : emptyData ? (
                <NoDataOverlay />
              ) : (
                <Stack direction="column" spacing={2}>
                  <Paper variant="outlined" className="w-100 rounded-0">
                    <CMCardHeader
                      title="Subscription Details"
                      titlesize="1rem"
                      titlecolor="grey"
                      titlecolorvariant="700"
                      border="1px"
                    />
                    <CardContent>
                      <Stack
                        direction={{ sm: "row", xs: "column" }}
                        flexWrap="wrap"
                        justifyContent="space-between"
                        sx={{ rowGap: 2, columnGap: 2 }}
                      >
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Subscription ID" />
                          <SubscriptionDetailValue>
                            {get(
                              SubscriptionDetail,
                              "subscriptionNumber",
                              "NA"
                            )}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Subscription Status" />
                          <SubscriptionDetailValue>
                            {capitalizeFirstLetter(
                              get(
                                SubscriptionDetail,
                                "subscriptionStatus",
                                "pending"
                              )
                            )}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Subscription Type" />
                          <SubscriptionDetailValue>
                            {get(SubscriptionDetail, "isMonthly", "false")
                              ? "Monthly"
                              : "Custom"}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Subscription Duration" />
                          <SubscriptionDetailValue>
                            {getSubscriptionDuration({
                              startDate: SubscriptionDetail.startDate,
                              endDate: SubscriptionDetail.endDate,
                              tz: getTimezoneName(),
                            })}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Auto Renew" />
                          <SubscriptionDetailValue>
                            {get(SubscriptionDetail, "isAutoRenew", false)
                              ? "Yes"
                              : "No"}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        {get(SubscriptionDetail, "isAutoRenew", false) && (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle title="Renewal Count" />
                            <SubscriptionDetailValue>
                              {get(SubscriptionDetail, "renewalCount", 0)}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        )}
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Next Renewal Date" />
                          <SubscriptionDetailValue>
                            {moment(SubscriptionDetail.endDate)
                              .subtract(1, "days")
                              .add(1, "days")
                              .format("MM/DD/YYYY")}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        {SubscriptionDetail.isMonthly &&
                        SubscriptionDetail.renewalCount < 1 ? (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle title="Base Rate" />
                            <SubscriptionDetailValue
                              lineThrough={true}
                              monthlyAmount={`$${amountToShow(
                                SubscriptionDetail.firstMonthBaseRate
                              )}`}
                            >
                              {`$${amountToShow(SubscriptionDetail.baseRate)}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        ) : (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle title="Base Rate" />
                            <SubscriptionDetailValue>
                              {`$${amountToShow(SubscriptionDetail.baseRate)}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        )}
                        {SubscriptionDetail.isMonthly &&
                        SubscriptionDetail.renewalCount < 1 ? (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle
                              title={`Tax  (${SubscriptionDetail.taxPercentage}%)`}
                            />
                            <SubscriptionDetailValue
                              lineThrough={true}
                              monthlyAmount={`$${amountToShow(
                                SubscriptionDetail.firstMonthTax
                              )}`}
                            >
                              {`$${amountToShow(SubscriptionDetail.tax)}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        ) : (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle
                              title={`Tax  (${SubscriptionDetail.taxPercentage}%)`}
                            />
                            <SubscriptionDetailValue>
                              {`$${amountToShow(SubscriptionDetail.tax)}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        )}

                        {SubscriptionDetail.isMonthly &&
                        SubscriptionDetail.renewalCount < 1 ? (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle
                              title={`City Tax  (${get(
                                SubscriptionDetail,
                                "cityTaxPercentage",
                                0
                              )}%)`}
                            />
                            <SubscriptionDetailValue
                              lineThrough={true}
                              monthlyAmount={`$${amountToShow(
                                get(SubscriptionDetail, "firstMonthCityTax", 0)
                              )}`}
                            >
                              {`$${amountToShow(
                                get(SubscriptionDetail, "cityTax", 0)
                              )}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        ) : (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle
                              title={`City Tax  (${get(
                                SubscriptionDetail,
                                "cityTaxPercentage",
                                0
                              )}%)`}
                            />
                            <SubscriptionDetailValue>
                              {`$${amountToShow(
                                get(SubscriptionDetail, "cityTax", 0)
                              )}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        )}

                        {SubscriptionDetail.isMonthly &&
                        SubscriptionDetail.renewalCount < 1 ? (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle
                              title={`County Tax  (${get(
                                SubscriptionDetail,
                                "countyTaxPercentage",
                                0
                              )}%)`}
                            />
                            <SubscriptionDetailValue
                              lineThrough={true}
                              monthlyAmount={`$${amountToShow(
                                get(
                                  SubscriptionDetail,
                                  "firstMonthCountyTax",
                                  0
                                )
                              )}`}
                            >
                              {`$${amountToShow(
                                get(SubscriptionDetail, "countytax", 0)
                              )}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        ) : (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle
                              title={`County Tax  (${get(
                                SubscriptionDetail,
                                "countyTaxPercentage",
                                0
                              )}%)`}
                            />
                            <SubscriptionDetailValue>
                              {`$${amountToShow(
                                get(SubscriptionDetail, "countyTax", 0)
                              )}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        )}

                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Service Fee" />
                          <SubscriptionDetailValue>
                            {`$${amountToShow(SubscriptionDetail.serviceFee)}`}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        {SubscriptionDetail.isMonthly &&
                        SubscriptionDetail.renewalCount < 1 ? (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle title="Payment Gateway Fee" />
                            <SubscriptionDetailValue
                              lineThrough={true}
                              monthlyAmount={`$${amountToShow(
                                SubscriptionDetail.firstMonthPaymentGatewayFee
                              )}`}
                            >
                              {`$${amountToShow(
                                SubscriptionDetail.paymentGatewayFee
                              )}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        ) : (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle title="Payment Gateway Fee" />
                            <SubscriptionDetailValue>
                              {`$${amountToShow(
                                SubscriptionDetail.paymentGatewayFee
                              )}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        )}
                        {SubscriptionDetail.isMonthly &&
                        SubscriptionDetail.renewalCount < 1 ? (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle title="Total Amount" />
                            <SubscriptionDetailValue
                              lineThrough={true}
                              monthlyAmount={`$${amountToShow(
                                SubscriptionDetail.firstMonthTotalAmount
                              )}`}
                            >
                              {`$${amountToShow(
                                SubscriptionDetail.totalAmount
                              )}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        ) : (
                          <SubscriptionDetailBox>
                            <SubscriptionDetailTitle title="Total Amount" />
                            <SubscriptionDetailValue>
                              {`$${amountToShow(
                                SubscriptionDetail.totalAmount
                              )}`}
                            </SubscriptionDetailValue>
                          </SubscriptionDetailBox>
                        )}
                      </Stack>
                    </CardContent>
                  </Paper>

                  <Paper variant="outlined" className="w-100 rounded-0">
                    <CMCardHeader
                      title="License Plates Details"
                      titlesize="1rem"
                      titlecolor="grey"
                      titlecolorvariant="700"
                      border="1px"
                    />
                    <CardContent>
                      <MDDataGrid
                        rows={licensePlateArray}
                        columns={licensePlateColumnsData}
                        getRowId={(row) => row.licensePlateNumber}
                        getRowClassName={getRowClassName}
                      />
                    </CardContent>
                  </Paper>

                  <Paper variant="outlined" className="w-100 rounded-0">
                    <CMCardHeader
                      title="Parker Details"
                      titlesize="1rem"
                      titlecolor="grey"
                      titlecolorvariant="700"
                      border="1px"
                    />
                    <CardContent>
                      <Stack
                        direction={{ sm: "row", xs: "column" }}
                        flexWrap="wrap"
                        justifyContent="space-between"
                        sx={{ rowGap: 2, columnGap: 2 }}
                      >
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Parker Name" />
                          <SubscriptionDetailValue>
                            {`${get(
                              SubscriptionDetail,
                              "customerId.firstName",
                              "NA"
                            )} ${get(
                              SubscriptionDetail,
                              "customerId.lastName",
                              "NA"
                            )}`}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Parker Email" />
                          <SubscriptionDetailValue>
                            {get(SubscriptionDetail, "customerId.email", "NA")}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Parker Mobile" />
                          <SubscriptionDetailValue>
                            {get(
                              SubscriptionDetail,
                              "customerId.isEmailPrimary",
                              false
                            )
                              ? get(
                                  SubscriptionDetail,
                                  "customerId.secondaryMobile",
                                  "N/A"
                                )
                              : get(
                                  SubscriptionDetail,
                                  "customerId.mobile",
                                  "N/A"
                                )}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                      </Stack>
                    </CardContent>
                  </Paper>
                  <Paper variant="outlined" className="w-100 rounded-0">
                    <CMCardHeader
                      title="Brand Details"
                      title_size="1rem"
                      title_color="grey"
                      title_color_variant="700"
                      border="1px"
                    />
                    <CardContent>
                      <Stack
                        direction={{ sm: "row", xs: "column" }}
                        flexWrap="wrap"
                        justifyContent="space-between"
                        sx={{ rowGap: 1.5, columnGap: 2 }}
                      >
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Brand Name" />
                          <SubscriptionDetailValue>
                            {get(SubscriptionDetail, "brandId.brandName", "NA")}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Brand Email" />
                          <SubscriptionDetailValue>
                            {get(
                              SubscriptionDetail,
                              "brandId.ownerEmail",
                              "NA"
                            )}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Brand Mobile" />
                          <SubscriptionDetailValue>
                            {get(
                              SubscriptionDetail,
                              "brandId.ownerMobileNumber",
                              "NA"
                            )}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                        <SubscriptionDetailBox>
                          <SubscriptionDetailTitle title="Brand Address" />
                          <SubscriptionDetailValue>
                            {get(
                              SubscriptionDetail,
                              "brandId.brandAddress",
                              "NA"
                            )}
                          </SubscriptionDetailValue>
                        </SubscriptionDetailBox>
                      </Stack>
                    </CardContent>
                  </Paper>
                  <Paper variant="outlined" className="w-100 rounded-0">
                    <CMCardHeader
                      title="Payment History"
                      titlesize="1rem"
                      titlecolor="grey"
                      titlecolorvariant="700"
                      border="1px"
                    />
                    <CardContent>
                      <Stack>
                        {map(SubscriptionDetail?.payments, (item, index) => (
                          <MDBox
                            mt={2}
                            p={2}
                            sx={{
                              border: `1px solid ${
                                item.paymentStatus === "success"
                                  ? "green"
                                  : item.paymentStatus === "initialize"
                                  ? "orange"
                                  : "red"
                              }`,
                            }}
                            key={index}
                          >
                            <Stack
                              direction={{ sm: "row", xs: "column" }}
                              flexWrap="wrap"
                              justifyContent="space-between"
                              sx={{ rowGap: 1.5, columnGap: 2 }}
                            >
                              <SubscriptionDetailBox>
                                <SubscriptionDetailTitle
                                  title={`${
                                    item.isSkipped
                                      ? "Skipped On"
                                      : "Transaction Date"
                                  }`}
                                />
                                <SubscriptionDetailValue>
                                  {moment(
                                    get(item, "transactionDate", "NA")
                                  ).format("MM/DD/YYYY hh:mm A")}
                                </SubscriptionDetailValue>
                              </SubscriptionDetailBox>
                              <SubscriptionDetailBox>
                                <SubscriptionDetailTitle title="Transaction Id" />
                                <SubscriptionDetailValue>
                                  {get(
                                    item,
                                    "paymentInfo.transactionResponse.transId",
                                    get(item, "transactionId", "N/A")
                                  )}
                                </SubscriptionDetailValue>
                              </SubscriptionDetailBox>
                            

                              <SubscriptionDetailBox>
                                <SubscriptionDetailTitle title="Payment Method" />
                                <SubscriptionDetailValue>
                                  {get(item, "paymentMethodType", "NA") ===
                                  "card"
                                    ? "Credit card"
                                    : item.paymentMethodType}
                                </SubscriptionDetailValue>
                              </SubscriptionDetailBox>
                              <SubscriptionDetailBox>
                                <SubscriptionDetailTitle title="Payment Status" />
                                <SubscriptionDetailValue>
                                  {capitalizeFirstLetter(
                                    get(item, "paymentStatus", "NA")
                                  )}
                                </SubscriptionDetailValue>
                              </SubscriptionDetailBox>
                              {item.paymentStatus === "failed" && (
                                <SubscriptionDetailBox>
                                  <SubscriptionDetailTitle title="Payment Failed Reason" />
                                  <SubscriptionDetailValue>
                                    {capitalizeFirstLetter(
                                      get(
                                        item,
                                        "paymentInfo.transactionResponse.errors[0].errorText",
                                        get(item, "paymentInfo.message", "N/A")
                                      )
                                    )}
                                  </SubscriptionDetailValue>
                                </SubscriptionDetailBox>
                              )}

                              <SubscriptionDetailBox>
                                <SubscriptionDetailTitle title="Subscription ID" />
                                <SubscriptionDetailValue>
                                  {capitalizeFirstLetter(
                                    get(item, "subscriptionNumber", "NA")
                                  )}
                                </SubscriptionDetailValue>
                              </SubscriptionDetailBox>
                              {item.paymentStatus !== "refunded" && (
                                <>
                                  <SubscriptionDetailBox>
                                    <SubscriptionDetailTitle title="Base Rate" />
                                    <SubscriptionDetailValue>
                                      {`$${amountToShow(item.baseRate)}`}
                                    </SubscriptionDetailValue>
                                  </SubscriptionDetailBox>

                                  <SubscriptionDetailBox>
                                    <SubscriptionDetailTitle
                                      title={`Tax  (${item.taxPercentage}%)`}
                                    />
                                    <SubscriptionDetailValue>
                                      {`$${amountToShow(item.tax)}`}
                                    </SubscriptionDetailValue>
                                  </SubscriptionDetailBox>

                                  {item.cityTax && item.cityTax > 0 ? (
                                    <SubscriptionDetailBox>
                                      <SubscriptionDetailTitle
                                        title={`City Tax  (${item.cityTaxPercentage}%)`}
                                      />
                                      <SubscriptionDetailValue>
                                        {`$${amountToShow(item.cityTax)}`}
                                      </SubscriptionDetailValue>
                                    </SubscriptionDetailBox>
                                  ) : null}

                                  {item.countyTax && item.countyTax > 0 ? (
                                    <SubscriptionDetailBox>
                                      <SubscriptionDetailTitle
                                        title={`County Tax  (${item.countyTaxPercentage}%)`}
                                      />
                                      <SubscriptionDetailValue>
                                        {`$${amountToShow(item.countyTax)}`}
                                      </SubscriptionDetailValue>
                                    </SubscriptionDetailBox>
                                  ) : null}

                                  <SubscriptionDetailBox>
                                    <SubscriptionDetailTitle title="Service Fee" />
                                    <SubscriptionDetailValue>
                                      {`$${amountToShow(item.serviceFee)}`}
                                    </SubscriptionDetailValue>
                                  </SubscriptionDetailBox>

                                  <SubscriptionDetailBox>
                                    <SubscriptionDetailTitle
                                      title={`Payment Gateway Fee (${capitalizeFirstLetter(
                                        item.paymentGatewayFeePayBy
                                      )})`}
                                    />
                                    <SubscriptionDetailValue>
                                      {`$${amountToShow(
                                        item.paymentGatewayFee
                                      )}`}
                                    </SubscriptionDetailValue>
                                  </SubscriptionDetailBox>
                                </>
                              )}

                              <SubscriptionDetailBox>
                                <SubscriptionDetailTitle title="Total Amount" />
                                <SubscriptionDetailValue>
                                  {`$${amountToShow(item.totalAmount)}`}
                                </SubscriptionDetailValue>
                              </SubscriptionDetailBox>
                              {item.isSkipped && (
                                <SubscriptionDetailBox>
                                  <SubscriptionDetailTitle title="Skipped Message" />
                                  <SubscriptionDetailValue>
                                    {get(item, "skippedMessage", "N/A")}
                                  </SubscriptionDetailValue>
                                </SubscriptionDetailBox>
                              )}
                              <SubscriptionDetailBox></SubscriptionDetailBox>
                            </Stack>
                            {item.paymentStatus === "success" &&
                              !item.isSkipped && (
                                <div
                                  className="d-flex align-items-center"
                                  style={{ gap: "10px" }}
                                >
                                  {!item?.isFullyRefunded && (
                                    <MDButton
                                      color={sidenavColor}
                                      variant="contained"
                                      size="small"
                                      onClick={() => {
                                        setRefundDialogOpen(true);
                                        setIssueRefundData(item);
                                      }}
                                    >
                                      Refund
                                    </MDButton>
                                  )}
                                  <MDButton
                                    variant="contained"
                                    size="small"
                                    color={sidenavColor}
                                    onClick={() => {
                                      handelDownload({
                                        receiptURL: item.receiptURL,
                                      });
                                    }}
                                  >
                                    Download Receipt
                                  </MDButton>

                                </div>
                              )}
                          </MDBox>
                        ))}
                      </Stack>
                    </CardContent>
                  </Paper>
                </Stack>
              )}
            </CardContent>
          </Card>
        </DialogContent>
        <LicensePlateEditDialog
          setNotification={setNotification}
          subscriptionId={subscriptionId}
          licensePlateData={licensePlateRowData}
          dialogOpen={editLicensePlate}
          onClose={() => {
            setEditLicensePlate(false);
          }}
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
      </MDDialog>
      <RefundDialog
        dialogOpen={refundDialogOpen}
        onClose={() => {
          setRefundDialogOpen(false);
          setFullRefund(false);
        }}
        data={issueRefundData}
        subscriptionId={subscriptionId}
        setFullRefund={setFullRefund}
        fullRefund={fullRefund}
      />

    </>
  );
};

export default SubscriptionDetail;
