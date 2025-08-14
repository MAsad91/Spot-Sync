import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GetTotalBookingsAPI } from "api/homePageAPi";
import { GetTotalCustomersAPI } from "api/homePageAPi";
import { GetTotalRevenueAPI } from "api/homePageAPi";
import { GetTotalTaxAPI } from "api/homePageAPi";
import { GetTotalServiceFeeAPI } from "api/homePageAPi";
import { TopSellingRatesAPI } from "api/homePageAPi";
import { GetWeeklyBookingsAPI } from "api/homePageAPi";
import { GetWeeklyRevenueAPI } from "api/homePageAPi";
import { GetMonthlyBookingsAPI } from "api/homePageAPi";
import { GetMonthlyRevenueAPI } from "api/homePageAPi";
import { DailyStatisticsAPI } from "api/homePageAPi";
import { ReturningUsersAPI } from "api/homePageAPi";
import { get } from "lodash";

const initialState = {
  bookings: {},
  customers: {},
  revenue: {},
  tax: {},
  serviceFee: {},
  weeklyBookingChartData: {},
  weeklyBookingPercentage: "",
  weeklyBookingLastUpdatedTime: "",
  weeklyRevenueChartData: {},
  weeklyRevenuePercentage: "",
  weeklyRevenueLastUpdatedTime: "",
  monthlyBookingChartData: {},
  monthlyBookingPercentage: "",
  monthlyBookingLastUpdatedTime: "",
  monthlyRevenueChartData: {},
  monthlyRevenuePercentage: "",
  monthlyRevenueLastUpdatedTime: "",
  dailyStatistics : {},
  returningUsersData : {},
  topSellingRatesData: [],
  loading: false,
};

export const dailyStatistics = createAsyncThunk(
  `statistics/dailyStatistics`,
  async (data) => {
    console.log(data)
    try {
      const response = await DailyStatisticsAPI(data);
      return response;
      
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
)
export const returningUsers = createAsyncThunk(
  `statistics/returningUser`,
  async (data) => {
    console.log(data)
    try {
      const response = await ReturningUsersAPI(data);
      return response.data;
      
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
)
export const topSellingRates = createAsyncThunk(
  `statistics/topSellingRates`,
  async (data) => {
    console.log(data)
    try {
      const response = await TopSellingRatesAPI(data);
      return response.data;
      
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
)

export const getWeeklyBookings = createAsyncThunk(
  `statistics/getWeeklyBookingstats`,
  async (data) => {
    try {
      const response = await GetWeeklyBookingsAPI(data);
      return response.data;
      
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
)
export const getWeeklyRevenue = createAsyncThunk(
  `statistics/getWeeklyRevenuestats`,
  async (data) => {
    try {
      const response = await GetWeeklyRevenueAPI(data);
      return response.data;
      
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
)
export const getMonthlyBookings = createAsyncThunk(
  `statistics/getMonthlyBookingstats`,
  async (data) => {
    try {
      const response = await GetMonthlyBookingsAPI(data);
      return response.data;
      
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
)
export const getMonthlyRevenue = createAsyncThunk(
  `statistics/getMonthlyRevenuestats`,
  async (data) => {
    try {
      const response = await GetMonthlyRevenueAPI(data);
      return response.data;
      
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
)

export const getTotalBookings = createAsyncThunk(
  `statistics/getTotalBooking`,
  async (data) => {
    try {
      const response = await GetTotalBookingsAPI(data);
      return response.data;
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
);

export const getTotalCustomers = createAsyncThunk(
  `statistics/getTotalCustomer`,
  async (data) => {
    try {
      const response = await GetTotalCustomersAPI(data);
      return response.data;
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
);

export const getTotalRevenue = createAsyncThunk(
  `statistics/getTotalRevenue`,
  async (data) => {
    try {
      const response = await GetTotalRevenueAPI(data);
      return response.data;
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
);

export const getTotalTax = createAsyncThunk(
  `statistics/getTotalTax`,
  async (data) => {
    try {
      const response = await GetTotalTaxAPI(data);
      return response.data;
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
);

export const getTotalServiceFee = createAsyncThunk(
  `statistics/getTotalServiceFee`,
  async (data) => {
    try {
      const response = await GetTotalServiceFeeAPI(data);
      return response.data;
    } catch (err) {
      console.log("statistics error ======>", err);
      return err;
    }
  }
);

export const statisticSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTotalBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTotalBookings.fulfilled, (state, { payload }) => {
        state.bookings = get(payload, "data", {});
        state.loading = false;
      })
      .addCase(getTotalBookings.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getTotalCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTotalCustomers.fulfilled, (state, { payload }) => {
        state.customers = get(payload, "data", {});
        state.loading = false;
      })
      .addCase(getTotalCustomers.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getTotalRevenue.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTotalRevenue.fulfilled, (state, { payload }) => {
        state.revenue = get(payload, "data", {});
        state.loading = false;
      })
      .addCase(getTotalRevenue.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getTotalTax.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTotalTax.fulfilled, (state, { payload }) => {
        state.tax = get(payload, "data", {});
        state.loading = false;
      })
      .addCase(getTotalTax.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getTotalServiceFee.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTotalServiceFee.fulfilled, (state, { payload }) => {
        state.serviceFee = get(payload, "data", {});
        state.loading = false;
      })
      .addCase(getTotalServiceFee.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getWeeklyBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWeeklyBookings.fulfilled, (state, { payload }) => {
        state.weeklyBookingChartData = get(payload, "data", {});
        state.weeklyBookingPercentage = get(payload, "percentage", "")
        state.weeklyBookingLastUpdatedTime = get(payload, "lastUpdatedTime", "")
        state.loading = false;
      })
      .addCase(getWeeklyBookings.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getWeeklyRevenue.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWeeklyRevenue.fulfilled, (state, { payload }) => {
        state.weeklyRevenueChartData = get(payload, "data", {});
        state.weeklyRevenuePercentage = get(payload, "percentage", "")
        state.weeklyRevenueLastUpdatedTime = get(payload, "lastUpdatedTime", "")
        state.loading = false;
      })
      .addCase(getWeeklyRevenue.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getMonthlyBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMonthlyBookings.fulfilled, (state, { payload }) => {
        state.monthlyBookingChartData = get(payload, "data", {});
        state.monthlyBookingPercentage = get(payload, "percentage", "")
        state.monthlyBookingLastUpdatedTime = get(payload, "lastUpdatedTime", "")
        state.loading = false;
      })
      .addCase(getMonthlyBookings.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getMonthlyRevenue.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMonthlyRevenue.fulfilled, (state, { payload }) => {
        state.monthlyRevenueChartData = get(payload, "data", {});
        state.monthlyRevenuePercentage = get(payload, "percentage", "")
        state.monthlyRevenueLastUpdatedTime = get(payload, "lastUpdatedTime", "")
        state.loading = false;
      })
      .addCase(getMonthlyRevenue.rejected, (state) => {
        state.loading = false;
      })
      .addCase(returningUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(returningUsers.fulfilled, (state, { payload }) => {
        state.returningUsersData = get(payload, "data", {});
        state.loading = false;
      })
      .addCase(returningUsers.rejected, (state) => {
        state.loading = false;
      })
      .addCase(topSellingRates.pending, (state) => {
        state.loading = true;
      })
      .addCase(topSellingRates.fulfilled, (state, { payload }) => {
        state.topSellingRatesData = get(payload, "data", []);
        state.loading = false;
      })
      .addCase(topSellingRates.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default statisticSlice.reducer;
