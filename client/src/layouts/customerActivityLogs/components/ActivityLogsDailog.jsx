/** @format */

import React, { useEffect, useState } from "react";
import MDDialog from "components/MDDialog";
import { get, isEmpty, map } from "lodash";
import { DialogContent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import NoDataOverlay from "../../../components/Common/NoDataOverlay";
import DetailCardSkeleton from "../../subscriptions/components/DetailCardSkeleton";
import { getActivityLogs } from "store/slice/customerActivityLogs/customerActivityLogsSlice";
import MDBox from "components/MDBox";
import MDSnackbar from "components/MDSnackbar";
import CustomerMessage from "./CustomerMessage";
import SpotSyncMessage from "./SpotSyncMessage";

const SubscriptionDetail = (props) => {
  const { dialogOpen, onClose, customerActivityLogId, customerActivityLog, placeId } = props;
  const dispatch = useDispatch();
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
  const activityLogs = useSelector(
    (state) => state.customerActivityLog?.activityLogs
  );
  const [emptyData, setEmptyData] = useState(false);
  useEffect(() => {
    dispatch(getActivityLogs({
      placeId,
      customerActivityLogId
    }))
      .unwrap()
      .then((result) => {
        if (get(result, "success", false)) {
          if (isEmpty(get(result, "activityLogs", {}))) {
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
  }, [dispatch, customerActivityLogId, placeId]);

  return (
    <>
      <MDDialog
        dialogTitle="Activity Logs"
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
                  {/* <Paper variant="outlined" className="w-100 rounded-0"> */}
                    {map(activityLogs, (activityLog, index) => (
                      <MDBox mt={2}>
                        <CustomerMessage
                          activityLog={activityLog}
                          customerActivityLog={customerActivityLog}
                          key={'customerMessage' + index}
                        />

                        <SpotSyncMessage
                          activityLog={activityLog}
                          key={'spotSyncMessage' + index}
                        />
                      </MDBox>
                    ))}
                  {/* </Paper> */}
                </Stack>
              )}
            </CardContent>
          </Card>
        </DialogContent>
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
    </>
  );
};

export default SubscriptionDetail;
