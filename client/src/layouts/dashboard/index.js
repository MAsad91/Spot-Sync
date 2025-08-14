// @mui material components
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import { useEffect, useState } from "react";
import { getTotalBookings, getTotalCustomers, getTotalRevenue, getTotalTax, getTotalServiceFee, getWeeklyBookings, getWeeklyRevenue, getMonthlyBookings, getMonthlyRevenue, dailyStatistics, returningUsers, topSellingRates } from "store/slice/homePage/homePageSlice";
import { useDispatch, useSelector } from "react-redux";
import { centsToDollars } from "global/functions";
import CircularIndeterminate from "components/MDLoading";
import MultiPlacePicker from "components/MDPlacePicker/MultiPlacePicker";
function Dashboard() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const SelectedPlaces = useSelector((state) => state.places?.multiSelectedPlaces)
  const placeIds = SelectedPlaces.map(place => place?._id);
  const token = useSelector((state) => state.auth.token)
  const {
    bookings,
    revenue,
    tax,
    serviceFee,
    weeklyBookingChartData,
    weeklyBookingPercentage,
    weeklyBookingLastUpdatedTime,
    weeklyRevenueChartData,
    weeklyRevenuePercentage,
    weeklyRevenueLastUpdatedTime,
    monthlyBookingChartData,
    monthlyBookingPercentage,
    monthlyBookingLastUpdatedTime,
    monthlyRevenueChartData,
    monthlyRevenuePercentage,
    monthlyRevenueLastUpdatedTime,
    returningUsersData,
    topSellingRatesData
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (SelectedPlaces.length > 0) {
      refreshDailyStats();
    }  
  }, [dispatch, SelectedPlaces]);

  const refreshDailyStats = () => {
    // dispatch(dailyStatistics({ token }))
    dispatch(getTotalBookings({ token, placeIds }))
   // dispatch(getTotalCustomers({ token, placeIds }))
    dispatch(getTotalRevenue({ token, placeIds }))
    dispatch(getTotalTax({ token, placeIds }))
    dispatch(getTotalServiceFee({ token, placeIds }))
    dispatch(getWeeklyBookings({ token, placeIds }))
    dispatch(getWeeklyRevenue({ token, placeIds }))
    dispatch(getMonthlyBookings({ token, placeIds }))
    dispatch(getMonthlyRevenue({ token, placeIds }))
    dispatch(returningUsers({ token, placeIds }))
    dispatch(topSellingRates({ token, placeIds }))
  };


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MultiPlacePicker notDefaultPlace={true} />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="toys"
                title="Bookings"
                count={bookings.bookings || 0}
                percentage={{
                  color: bookings.percentageIncrease > 0 ? "success" : "error",
                  amount: `${bookings.percentageIncrease > 0 ? '+' : ''}${bookings.percentageIncrease || 0}%`,
                  label: `${bookings.percentageIncrease > 0 ? 'greater' : 'less'} than last month`,
                }}
               // loading={true}
               /* refresh={
                  refreshDailyStats
                }*/
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="money"
                title="Revenue"
                count={`$${centsToDollars(revenue.revenue || 0)}`}
                percentage={{
                  color: revenue.percentageIncrease > 0 ? "success" : "error",
                  amount: `${revenue.percentageIncrease > 0 ? '+' : ''}${revenue.percentageIncrease || 0}%`,
                  label: `${revenue.percentageIncrease > 0 ? 'greater' : 'less'} than last month`,
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="home"
                title="Service Fee"
                count={`$${centsToDollars(serviceFee.serviceFee || 0)}`}
                percentage={{
                  color: serviceFee.percentageIncrease > 0 ? "success" : "error",
                  amount: `${serviceFee.percentageIncrease > 0 ? '+' : ''}${serviceFee.percentageIncrease || 0}%`,
                  label: `${serviceFee.percentageIncrease > 0 ? 'greater' : 'less'} than last month`,
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="secondary"
                icon="attach_money"
                title="Tax"
                count={`$${centsToDollars(tax.tax || 0)}`}
                percentage={{
                  color: tax.percentageIncrease > 0 ? "success" : "error",
                  amount: `${tax.percentageIncrease > 0 ? '+' : ''}${tax.percentageIncrease || 0}%`,
                  label: `${tax.percentageIncrease > 0 ? 'greater' : 'less'} than last month`,
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Weekly Bookings"
                  description={
                    <>
                      (<strong>{weeklyBookingPercentage > 0 ? '+' : ''}{weeklyBookingPercentage || 0}%</strong>) {weeklyBookingPercentage > 0 ? 'increase' : 'decrease'} in weekly Bookings.
                    </>
                  }
                  date={'Last Updated: '+weeklyBookingLastUpdatedTime}
                  chart={weeklyBookingChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="warning"
                  title="Weekly Revenue"
                  description={
                    <>
                      (<strong>{weeklyRevenuePercentage > 0 ? '+' : ''}{weeklyRevenuePercentage || 0}%</strong>) {weeklyRevenuePercentage > 0 ? 'increase' : 'decrease'} in weekly Revenue.
                    </>
                  }
                  date={'Last Updated: '+weeklyRevenueLastUpdatedTime}
                  chart={weeklyRevenueChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Monthly Revenue"
                  description={
                    <>
                      (<strong>{monthlyRevenuePercentage > 0 ? '+' : ''}{monthlyRevenuePercentage || 0}%</strong>) {monthlyRevenuePercentage > 0 ? 'increase' : 'decrease'} in monthly Revenue.
                    </>
                  }
                  date={'Last Updated: '+monthlyRevenueLastUpdatedTime}
                  chart={monthlyRevenueChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Monthly Bookings"
                  description={
                    <>
                      (<strong>{monthlyBookingPercentage > 0 ? '+' : ''}{monthlyBookingPercentage || 0}%</strong>) {monthlyBookingPercentage > 0 ? 'increase' : 'decrease'} in monthly Bookings.
                    </>
                  }
                  date={'Last Updated: '+monthlyBookingLastUpdatedTime}
                  chart={monthlyBookingChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects data={returningUsersData} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview data={topSellingRatesData} />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
      <CircularIndeterminate type="full" size={20} text="" open={isLoading} />
    </DashboardLayout>
  );
}

export default Dashboard;

/*<Grid item xs={12} md={6} lg={2.4}>
    <MDBox mb={1.5}>
      <ComplexStatisticsCard
        icon="group"
        title="Customers"
        count={customers.customers || 0}
        percentage={{
        color: customers.percentageIncrease > 0 ? "success" : "error",
        amount: `${customers.percentageIncrease > 0 ? '+' : ''}${customers.percentageIncrease || 0}%`,
        label: "than last month",
            }}
      />
    </MDBox>
  </Grid> */