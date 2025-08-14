import * as React from "react";
import Paper from "@mui/material/Paper";
import { ViewState } from "@devexpress/dx-react-scheduler";
import { styled, alpha } from "@mui/material/styles";
import {
  Scheduler,
  DayView,
  Appointments,
  WeekView,
  AppointmentTooltip,
  Toolbar,
  ViewSwitcher,
} from "@devexpress/dx-react-scheduler-material-ui";
import moment from "moment";

const PREFIX = "Demo";

const classes = {
  todayCell: `${PREFIX}-todayCell`,
  weekendCell: `${PREFIX}-weekendCell`,
  today: `${PREFIX}-today`,
  weekend: `${PREFIX}-weekend`,
};

const StyledWeekViewTimeTableCell = styled(WeekView.TimeTableCell)(
  ({ theme }) => ({
    [`&.${classes.todayCell}`]: {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.14),
      },
      "&:focus": {
        backgroundColor: alpha(theme.palette.primary.main, 0.16),
      },
    },
    [`&.${classes.weekendCell}`]: {
      backgroundColor: alpha(theme.palette.action.disabledBackground, 0.04),
      "&:hover": {
        backgroundColor: alpha(theme.palette.action.disabledBackground, 0.04),
      },
      "&:focus": {
        backgroundColor: alpha(theme.palette.action.disabledBackground, 0.04),
      },
    },
  })
);

const StyledWeekViewDayScaleCell = styled(WeekView.DayScaleCell)(
  ({ theme }) => ({
    [`&.${classes.today}`]: {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
    [`&.${classes.weekend}`]: {
      backgroundColor: alpha(theme.palette.action.disabledBackground, 0.06),
    },
  })
);

const TimeTableCell = (props) => {
  const { startDate } = props;
  const date = new Date(startDate);

  if (date.getDate() === new Date().getDate()) {
    return (
      <StyledWeekViewTimeTableCell {...props} className={classes.todayCell} />
    );
  }
  if (date.getDay() === 0 || date.getDay() === 6) {
    return (
      <StyledWeekViewTimeTableCell {...props} className={classes.weekendCell} />
    );
  }
  return <StyledWeekViewTimeTableCell {...props} />;
};

const DayScaleCell = (props) => {
  const { startDate, today } = props;

  if (today) {
    return <StyledWeekViewDayScaleCell {...props} className={classes.today} />;
  }
  if (startDate.getDay() === 0 || startDate.getDay() === 6) {
    return (
      <StyledWeekViewDayScaleCell {...props} className={classes.weekend} />
    );
  }
  return <StyledWeekViewDayScaleCell {...props} />;
};

const Appointment = ({
  children, style, ...restProps
}) => {
  return (
    <Appointments.Appointment
      {...restProps}
      style={{
        ...style,
        backgroundColor: restProps?.data?.colorId,
        borderRadius: '8px',
      }}
    >
      {children}
    </Appointments.Appointment>
  )
};


function CalenderView(props) {
  const { calenderData } = props;

  function duplicateEvents(data) {
    const result = [];
    for (const event of data) {
      const startDate = moment(event.startDate);
      const endDate = moment(event.endDate);
      const numDays = endDate.diff(startDate, 'days');

      if (numDays > 0) {
        // Duplicate event for each day
        for (let i = 0; i <= numDays; i++) {
          const newEvent = { ...event }; 
          const newStartDate = startDate.clone().add(i, 'days');
          const newEndDate = moment.min(endDate, newStartDate.clone().add(1, 'days')).subtract(1, 'seconds'); // Exclude last second
          newEvent.startDate = newStartDate.format();
          newEvent.endDate = newEndDate.format();
          result.push(newEvent);
        }
      } else {
        result.push(event);
      }
    }
    return result;
  }

  const processedData = duplicateEvents(calenderData);


  return (
    <Paper>
      <Scheduler data={processedData}>
        <ViewState currentDate={moment().format("YYYY-MM-DD")} />
        <DayView startDayHour={0} endDayHour={24} />
        <WeekView
          startDayHour={0}
          endDayHour={24}
          timeTableCellComponent={TimeTableCell}
          dayScaleCellComponent={DayScaleCell}
        />
        <Toolbar />
        <ViewSwitcher />
        <Appointments appointmentComponent={Appointment} />
        <AppointmentTooltip />
      </Scheduler>
    </Paper>
  );
}
export default CalenderView;
